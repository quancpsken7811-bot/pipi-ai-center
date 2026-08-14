const fs = require('fs');
const path = require('path');
const vm = require('vm');

const KEYSTREAM_SIZE = 131072;
const VENDOR_DIR = path.join(__dirname, 'vendor', 'wechat-video-decrypt');
const GLUE_PATH = path.join(VENDOR_DIR, 'wasm_video_decode.js');
const WASM_PATH = path.join(VENDOR_DIR, 'wasm_video_decode.wasm');

let runtimePromise;

function createRuntimeContext(wasmBinary) {
  const silentConsole = { log() {}, warn() {}, error() {} };
  const context = {
    console: silentConsole,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    performance,
    URL,
    WebAssembly,
    TextDecoder,
    TextEncoder,
    Uint8Array,
    Int8Array,
    Uint16Array,
    Int16Array,
    Uint32Array,
    Int32Array,
    Float32Array,
    Float64Array,
    ArrayBuffer,
    DataView,
    Math,
    Date,
    Promise,
    VTS_WASM_URL: 'wasm_video_decode.wasm',
    MAX_HEAP_SIZE: 33554432
  };
  context.self = context;
  context.window = context;
  context.location = { href: 'https://local.pipi/wechat-video-decrypt/wasm_video_decode.js' };
  context.Module = { wasmBinary: new Uint8Array(wasmBinary), print() {}, printErr() {} };
  context.wasm_isaac_generate = (pointer, size) => {
    const source = new Uint8Array(context.Module.HEAPU8.buffer, pointer, size);
    context.keystream = Uint8Array.from(source).reverse();
  };
  return context;
}

async function loadWechatDecryptRuntime() {
  if (runtimePromise) return runtimePromise;
  runtimePromise = (async () => {
    const [glue, wasmBinary] = await Promise.all([
      fs.promises.readFile(GLUE_PATH, 'utf8'),
      fs.promises.readFile(WASM_PATH)
    ]);
    const context = createRuntimeContext(wasmBinary);
    vm.createContext(context);
    vm.runInContext(glue, context, { filename: GLUE_PATH, timeout: 30000 });
    const deadline = Date.now() + 15000;
    while (!context.Module.WxIsaac64 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    if (!context.Module.WxIsaac64) throw new Error('视频号本地解密组件加载超时');
    return context;
  })().catch((error) => {
    runtimePromise = null;
    throw error;
  });
  return runtimePromise;
}

async function generateWechatKeystream(decodeKey) {
  const key = String(decodeKey || '').trim();
  if (!/^\d+$/.test(key)) throw new Error('视频号媒体解密密钥无效');
  const context = await loadWechatDecryptRuntime();
  context.keystream = null;
  const decryptor = new context.Module.WxIsaac64(key);
  try {
    decryptor.generate(KEYSTREAM_SIZE);
  } finally {
    decryptor.delete();
  }
  if (!context.keystream || context.keystream.length !== KEYSTREAM_SIZE) throw new Error('视频号媒体密钥流生成失败');
  return Buffer.from(context.keystream);
}

function isMp4(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length >= 8 && buffer.toString('ascii', 4, 8) === 'ftyp';
}

async function decryptWechatVideoBuffer(encryptedBuffer, decodeKey) {
  const encrypted = Buffer.from(encryptedBuffer || []);
  if (isMp4(encrypted)) return encrypted;
  const keystream = await generateWechatKeystream(decodeKey);
  const decrypted = Buffer.from(encrypted);
  const decryptLength = Math.min(KEYSTREAM_SIZE, decrypted.length, keystream.length);
  for (let index = 0; index < decryptLength; index += 1) decrypted[index] ^= keystream[index];
  if (!isMp4(decrypted)) throw new Error('视频号媒体解密失败，请重新搜索后再提取');
  return decrypted;
}

module.exports = { KEYSTREAM_SIZE, decryptWechatVideoBuffer, generateWechatKeystream, isMp4 };
