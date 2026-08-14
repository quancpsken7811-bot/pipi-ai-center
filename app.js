const API_CONFIG = window.PIPI_API_CONFIG || { baseUrl: '', useMockWhenEmpty: true, endpoints: {} };
const COACH_MOMENT_FIXED_TEMPLATE = 'assets/coach-moment-fixed-template.png';
const API_REQUEST_TIMEOUTS = {
  loginPassword: 15000,
  register: 15000,
  loginSms: 15000,
  sendSms: 10000,
  me: 10000,
  toolAvailability: 10000,
  personalProfile: 15000,
  personalAvatar: 30000,
  personalPersona: 15000,
  personalKnowledge: 15000,
  personalKnowledgeUpload: 45000,
  personalPoints: 15000,
  pipiChat: 75000,
  salesSimulation: 105000,
  salesMethodConfig: 15000,
  pipiConfig: 15000,
  topics: 75000,
  copywriting: 105000,
  copywritingConfig: 15000,
  wechatLayout: 135000,
  competitor: 75000,
  competitorTrends: 45000,
  competitorQuota: 15000,
  competitorSearch: 135000,
  competitorTranscript: 240000,
  coachSop: 105000,
  coachMoments: 105000,
  coachMomentsImage: 240000,
  records: 15000
};

const demoUsers = {
  admin: { id: 1, account: 'admin', password: '123456', name: '管理员', role: 'admin', roleName: '管理员' },
  coach: { id: 2, account: 'coach', phone: '13800138001', password: '123456', name: '王老师', role: 'coaching', roleName: '陪跑学员' },
  train: { id: 3, account: 'train', phone: '13800138002', password: '123456', name: '李老师', role: 'training', roleName: '训练营学员' }
};
const AUTH_STORAGE_KEY = 'pipi-ai-center-auth';

const state = {
  user: null,
  toolAvailability: {},
  page: 'home',
  personalTab: 'profile',
  personal: { profile: null, persona: null, knowledge: [], points: { balance: 0, items: [] } },
  records: [],
  copySessions: [],
  activeCopySessionId: null,
  copyView: 'gallery',
  copyGeneration: null,
  wechatLayout: { theme: 'museum', mode: 'visual', layout: null, layouts: {}, images: [], html: '', article: '', result: null },
  competitorFinder: { keyword: '教育', channel: 'douyin', channelLabel: '抖音', loading: false, items: [], transcripts: {} },
  competitorTrends: { loaded: false, loading: false, platforms: {}, items: [], meta: null, error: '' },
  competitorQuota: { loaded: false, loading: false, date: '', limit: 100, used: 0, reserved: 0, remaining: 100 },
  salesSession: null,
  salesEmojiPickerOpen: false,
  salesOutcomeTimer: null,
  activeSalesMethod: 'icebreak',
  salesMethodConfig: [],
  loginMode: 'password',
  apiMode: API_CONFIG.endpoints ? 'api' : 'mock',
  adminModule: 'overview',
  usageDateFilter: { preset: '30d', startDate: '', endDate: '' },
  modelManagementTab: 'providers',
  selectedPromptId: null,
  selectedCopywritingPromptAgent: 'local_city',
  selectedSalesReportId: null,
  copyAgentFilter: 'all',
  copyAgentCreateOpen: false,
  copywritingConfig: { agents: [], covers: {}, cover_options: [] },
  coachMomentImageDataUrl: '',
  coachMomentTemplateDataUrl: COACH_MOMENT_FIXED_TEMPLATE,
  coachMomentProcessedImageDataUrl: '',
  coachSopDraft: null,
  coachSopView: 'mindmap',
  pipiConfig: {
    welcome_message: '你好呀，我是皮皮分身。你可以直接说说你的赛道、业务和现在最卡的一件事，我先陪你把问题捋清楚。',
    stickers_enabled: true,
    thinking_sticker: 'thinking.png',
    response_sticker_mode: 'auto'
  },
  pipiUserTurns: 0,
  pipiWelcomeNeedsRefresh: false,
  pipiConversation: null,
  adminConfig: {
    users: [],
    stats: {},
    pipiAssistant: {},
    pipiKnowledge: [],
    salesSimulation: {},
    coachToolbox: {},
    salesKnowledge: [],
    salesReports: [],
    providers: [],
    models: [],
    prompts: [],
    features: [],
    usage: { totals: {}, by_function: [], by_model: [] },
    providerUsage: { items: [] },
    callLogs: []
  }
};
let competitorRadarSignalWords = ['高赞口播', '家长痛点', '招生内容', '高收藏', '同赛道账号', '短视频获客'];

const pages = {
  home: '工作台',
  personal: '个人中心',
  pipi: '皮皮分身',
  topics: '选题生成',
  copy: '文案智能体',
  competitor: '找竞品',
  sales: '销售模拟',
  coach: '教练工具箱',
  admin: '后台配置'
};

const tools = [
  { page: 'pipi', icon: '皮', title: '皮皮分身', desc: '不会使用中台时，可以直接问皮皮获取操作指南。', roles: ['training', 'coaching', 'admin'] },
  { page: 'topics', icon: '题', title: '选题生成', desc: '按赛道、业务和方向生成教育赛道内容选题。', roles: ['training', 'coaching', 'admin'] },
  { page: 'copy', icon: '文', title: '文案智能体', desc: '训练营可用短视频文案，陪跑开放朋友圈和贴图号。', roles: ['training', 'coaching', 'admin'] },
  { page: 'competitor', icon: '竞', title: '找竞品', desc: '搜索教育爆款内容，提取文案后带去智能体改写。', roles: ['training', 'coaching', 'admin'] },
  { page: 'sales', icon: '销', title: '销售模拟', desc: '选择家长类型，练习真实销售沟通和成交推进。', roles: ['training', 'coaching', 'admin'] },
  { page: 'coach', icon: '教', title: '教练工具箱', desc: '沉淀交付 SOP，并快速产出交付朋友圈和分享图。', roles: ['admin'] }
];

const salesProfiles = {
  rational: {
    code: 'rational',
    name: '理性比较型',
    disc: 'DISC · C',
    short: '重视证据、方法和投入产出',
    description: '会认真比较课程、师资、价格和结果，不会因为情绪马上决定。',
    opening: '您好，我主要想先了解一下课程具体怎么安排，和其他机构相比有什么不同？',
    tags: ['爱比较', '重证据', '关注价格'],
    methodology: {
      hypothesis: '待验证的 C 型沟通偏好，不代表购买意向。',
      parent_clues: ['主动追问课程结构、师资、评估方式和适用边界', '会比较价格，但更在意投入是否有清楚依据'],
      first_fact: '先补齐孩子的现状、过往尝试、目标和家长的效果判断标准。',
      response_rule: '结论先行，再用流程、同类案例和适用边界说明；没有事实时不要硬答。',
      objection_rule: '先确认是在比较价格、效果标准还是课程适配，再用可验证的信息回应。',
      next_step: '提供一次测评、课程结构说明或与孩子情况匹配的体验安排。',
      coaching_focus: '能否用事实、边界和验证方式回应比较，而不是空泛说“我们很好”。',
      drill_sample: '您最想先确认的是课程是否适合孩子，还是后续怎么判断这段学习有没有变化？'
    }
  },
  anxious: {
    code: 'anxious',
    name: '目标急迫型',
    disc: 'DISC · D',
    short: '关心关键结论、效率和下一步',
    description: '孩子的问题有紧迫感，希望尽快得到清楚判断和可执行安排，也会警惕夸张承诺。',
    opening: '老师您好，我家孩子马上要升三年级了，英语基础特别差，现在开始还来得及吗？',
    tags: ['问题紧迫', '要效率', '怕耽误'],
    methodology: {
      hypothesis: '待验证的 D 型沟通偏好，紧迫感来自当前情境，不把焦虑本身等同于 D。',
      parent_clues: ['回复直接、希望快速进入重点', '反复确认目标、时间、效率和下一步'],
      first_fact: '先确认孩子当前最急的问题、目标时间点和已经尝试过的办法。',
      response_rule: '先给清楚且克制的判断，再说明最短验证路径；避免铺陈，也不能承诺短期结果。',
      objection_rule: '遇到“来不及”“多久有效”时，区分可控动作和不可承诺结果，再给具体节奏。',
      next_step: '给出两个明确的测评或体验时间选项，并说明需要准备的信息。',
      coaching_focus: '能否先回应最紧急的问题，再用边界清楚的行动安排推进。',
      drill_sample: '我先不轻易说来不来得及。您方便说一下孩子现在最卡的是词汇、阅读，还是上课状态？我才能判断第一步怎么安排。'
    }
  },
  hesitant: {
    code: 'hesitant',
    name: '稳妥确认型',
    disc: 'DISC · S',
    short: '需要安全感，不愿意被强推进',
    description: '会担心孩子不适应、自己坚持不了，也常说回去商量一下再决定。',
    opening: '老师您好，我先了解一下。孩子之前也试过几家，但都没有坚持下来。',
    tags: ['慢决策', '要安全感', '怕踩坑'],
    methodology: {
      hypothesis: '待验证的 S 型沟通偏好，不把慢决策当作低意向。',
      parent_clues: ['语气礼貌、需要被充分回应', '更担心孩子适应、持续陪伴和做错选择'],
      first_fact: '先听清过去报名后为什么没坚持，以及孩子和家长各自最担心什么。',
      response_rule: '语气稳定，先复述顾虑，再将体验、陪伴和后续动作拆小；不要突然逼单。',
      objection_rule: '遇到“再考虑”“怕坚持不了”时，先判断是执行条件、孩子适配还是信任不足。',
      next_step: '设置低压力体验或资料确认节点，允许带孩子或共同决策人一起确认。',
      coaching_focus: '能否先让家长感到被理解，再把风险变成一个可验证的小动作。',
      drill_sample: '之前没有坚持下来，您觉得更像是孩子不喜欢，还是后面缺少人陪着一起调整？'
    }
  },
  expressive: {
    code: 'expressive',
    name: '信任互动型',
    disc: 'DISC · I',
    short: '重视感受、关系和老师是否合拍',
    description: '愿意聊天和分享孩子情况，更在意老师是否理解孩子、沟通是否舒服。',
    opening: '老师您好，我家孩子其实挺聪明的，就是注意力不太集中，您先帮我看看适不适合吧。',
    tags: ['重感受', '愿分享', '看关系'],
    methodology: {
      hypothesis: '待验证的 I 型沟通偏好，不把表达欲等同于容易成交。',
      parent_clues: ['愿意分享孩子的故事和感受', '会观察老师是否理解孩子、沟通是否自然'],
      first_fact: '先承接家长对孩子的观察，再追问一个具体场景、过往尝试或期待变化。',
      response_rule: '可以有温度地互动，但每次都要回到一个具体事实，不能只给情绪价值。',
      objection_rule: '遇到“合不合适”“老师懂不懂孩子”时，先复述其观察，再说明判断方式和匹配边界。',
      next_step: '邀请家长带着孩子的具体情况做一次沟通或体验，并提前说明观察重点。',
      coaching_focus: '能否把关系建立转成事实了解和具体的下一步，而不是只聊天。',
      drill_sample: '您说孩子注意力容易飘，通常是在什么学习场景最明显？我想先判断他是方法不适配，还是任务节奏不适合。'
    }
  }
};

const salesSixSteps = [
  { title: '破冰夸奖', hint: '有温度地建立第一印象' },
  { title: '深度挖需', hint: '问清孩子现状与需求' },
  { title: '案例展示', hint: '用同类真实变化建信任' },
  { title: '产品介绍', hint: '按诊断结果匹配产品' },
  { title: '卡点清理', hint: '认同顾虑并重塑价值' },
  { title: '临门踢单', hint: '推动一个低门槛行动' }
];

const salesScoreDimensions = [
  { code: 'icebreak', name: '破冰与信任', weight: 12 },
  { code: 'discovery', name: '事实挖需', weight: 22 },
  { code: 'diagnosis', name: '需求诊断', weight: 20 },
  { code: 'case_match', name: '案例与方案匹配', weight: 16 },
  { code: 'objection', name: '异议处理', weight: 15 },
  { code: 'close', name: '推进与收口', weight: 15 }
];

const salesConversationOutcomes = {
  normal: { code: 'normal', label: '正常结束', severity: 'normal', detail: '本轮在正常沟通节点结束。' },
  disengaged: { code: 'disengaged', label: '用户不想理你', severity: 'warning', detail: '销售表达出现赶客信号，对方停止继续沟通，本轮已自动结束。' },
  blocked: { code: 'blocked', label: '已拉黑', severity: 'danger', detail: '出现攻击或骚扰性表达，对方结束沟通并拉黑，本轮已自动结束。' }
};

const salesEmojiSet = ['😀', '😄', '😂', '😭', '😮', '😅', '😡', '🤔', '😳', '😊', '😍', '😎', '👍', '👏', '🙏', '🤝', '💪', '❤️', '🎉', '✨', '🌹', '☕', '👀', '🔥', '🎈', '🤗', '😬', '😔'];
const parentEmojiByProfile = {
  anxious: '😔',
  hesitant: '🙂',
  expressive: '😊'
};

const salesMethodDetails = {
  icebreak: {
    number: '01', title: '破冰夸奖', library: '夸夸库', desc: '夸奖要真实、具体，最好来自家长已经做对的事，而不是空泛地说“您很重视教育”。',
    items: ['能在这个阶段主动来了解，说明您对孩子的情况观察得很细。', '您刚才能把孩子的情况说得这么具体，其实已经帮我们省了很多判断时间。', '您没有急着给孩子加课，而是先想弄清问题，这个思路其实特别好。', '孩子愿意坚持到现在，背后一定有您很多耐心的陪伴。']
  },
  discovery: {
    number: '02', title: '深度挖需', library: '挖需库', desc: '从成绩、目标、过往学习和能力漏洞逐步了解，一次只问一个最关键的问题。',
    items: ['孩子现在最让您着急的，是成绩、学习状态，还是方法不对？', '过去为了解决这个问题，您们试过哪些方法？', '如果这次学习有效，您最希望先看到孩子发生什么变化？', '孩子自己怎么看这个问题？他愿意配合到什么程度？']
  },
  case: {
    number: '03', title: '案例展示', library: '案例库', desc: '优先选同年级、同问题、同阶段的真实案例，说清起点、过程和变化。',
    items: ['先说相似起点：“我们之前有一个同年级的孩子，一开始也是……”', '再说关键过程：“当时没有急着加量，而是先做了……”', '最后说可验证变化，不使用结果保证。']
  },
  product: {
    number: '04', title: '产品介绍', library: '产品库', desc: '产品介绍要回应刚才的诊断，只讲对这位家长有价值的部分。',
    items: ['先复述诊断：“按照刚才了解的情况，孩子现在最需要的不是……而是……”', '再连接产品：“所以我建议先用……来验证……”', '只说和当前需求相关的交付、节奏和结果验证方式。']
  },
  objection: {
    number: '05', title: '卡点清理', library: '异议库', desc: '先认同顾虑，再核实真正原因，不要听到“贵”就立即解释价格。',
    items: ['认同：“您会考虑这个很正常，给孩子选课本来就需要谨慎。”', '核实：“您现在更担心的是投入后没效果，还是孩子坚持不下来？”', '重塑：回到家长真正在意的结果和风险。']
  },
  close: {
    number: '06', title: '临门踢单', library: '成交库', desc: '不用虚假稀缺逼单，而是把下一步降低到家长容易做决定的诊断或体验。',
    items: ['诊断推进：“我们先不急着定长期课，先给孩子做一次测评。”', '体验推进：“先让孩子体验一次，看他是否愿意配合，再决定后面的路径。”', '明确动作：说清时间、方式、需要准备的材料和下次联系点。']
  }
};

const quickQuestions = [
  '我是同城少儿书法，现在没客资，先做短视频还是朋友圈？',
  '我是成人雅思，产品比较散，应该先整理什么？',
  '朋友圈怎么发才不像招生广告？',
  '我适合先做线上 C 端还是同城 C 端？',
  '训练营和陪跑到底有什么区别？'
];

const trainingQuickQuestions = [
  '怎么生成一组选题？',
  '文案智能体可以生成哪些内容？',
  '找竞品应该怎么填写？',
  '我生成的内容在哪里查看和复制？'
];

const knowledge = [
  { title: '同城/线上判断', match: /(同城|本地|线下|线上|全国|城市)/, answer: '不要默认线上更高级。判断同城还是线上，先看你有没有全国级背书、线上交付能力和差异化内容。如果现在更缺稳定客资，又有本地服务场景，同城通常更容易先跑出反馈。' },
  { title: '精准客资内容', match: /(没客资|获客|流量|没人问|咨询|短视频|选题)/, answer: '没客资时，先不要堆数量。先把目标客户最常问、最焦虑、最容易搜索的问题整理出来，再做搜索型选题和轻入口承接。' },
  { title: '产品主线', match: /(产品|课程|卖什么|太散|主线)/, answer: '产品太散时，先找主产品。主产品要说清楚服务谁、解决什么刚需问题、交付什么可感知结果。其他产品先围绕主产品做引流、复购或升级。' },
  { title: '朋友圈信任场', match: /(朋友圈|私域|发圈|硬广|信任)/, answer: '朋友圈不是只发成交结果，也不是只发生活。更稳的是生活/IP感、学员结果、干货判断、团队和产品信任交替出现，每条从真实场景或具体问题切入。' },
  { title: '训练营/陪跑边界', match: /(训练营|陪跑|升级|区别|适合)/, answer: '训练营更适合先补流量、表达和基础动作；陪跑解决一整盘业务，包括定位、产品、流量、成交、私域和交付。不是更贵就更好，而是看问题是不是已经从单点变成系统问题。' }
];

const $ = (id) => document.getElementById(id);
const value = (id) => $(id).value.trim();
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let toastTimer = null;

function showToast(message) {
  const toast = $('appToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
}

function initSilkMotion() {
  const canvas = $('silkCanvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let frame = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = (now) => {
    const time = now * 0.00055;
    context.clearRect(0, 0, width, height);
    const ribbons = [
      { x: -.34, y: .78, dx: 1.64, dy: -.5, width: .18, speed: .72 },
      { x: -.2, y: 1.08, dx: 1.7, dy: -.33, width: .13, speed: .58 },
      { x: .72, y: 1.02, dx: .62, dy: -.94, width: .17, speed: .5 }
    ];
    ribbons.forEach((ribbon, band) => {
      const phase = time * ribbon.speed + band * 1.8;
      const startX = width * ribbon.x;
      const startY = height * ribbon.y;
      const distance = Math.max(width, height) * 1.35;
      const thickness = Math.max(100, width * ribbon.width);
      const points = [];
      for (let step = 0; step <= 24; step += 1) {
        const progress = step / 24;
        const x = startX + distance * ribbon.dx * progress;
        const baseY = startY + height * ribbon.dy * progress;
        const sway = Math.sin(phase + progress * 4.2) * (34 + band * 8) + Math.sin(phase * .7 + progress * 8) * 14;
        const y = baseY + sway;
        points.push({ x, y });
      }
      const gradient = context.createLinearGradient(0, height, width, 0);
      gradient.addColorStop(0, `rgba(104, 24, 3, ${.08 + band * .02})`);
      gradient.addColorStop(.3, `rgba(255, 128, 30, ${.13 + band * .018})`);
      gradient.addColorStop(.56, `rgba(255, 211, 139, ${.08 + band * .015})`);
      gradient.addColorStop(1, 'rgba(91, 18, 3, .025)');
      context.shadowColor = 'rgba(255, 127, 28, .16)';
      context.shadowBlur = 24;
      context.beginPath();
      points.forEach((point, index) => {
        const offset = thickness * (.48 + Math.sin(phase + index * .34) * .1);
        if (index === 0) context.moveTo(point.x, point.y - offset);
        else context.lineTo(point.x, point.y - offset);
      });
      for (let index = points.length - 1; index >= 0; index -= 1) {
        const point = points[index];
        const offset = thickness * (.48 + Math.sin(phase + index * .34) * .1);
        context.lineTo(point.x, point.y + offset);
      }
      context.closePath();
      context.fillStyle = gradient;
      context.fill();
      context.shadowBlur = 0;
    });
    frame = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  frame = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(frame);
}

function initCompetitorRadar() {
  const radar = $('competitorRadar');
  const canvas = $('competitorRadarCanvas');
  if (!radar || !canvas || canvas.dataset.ready) return;
  canvas.dataset.ready = 'true';
  const context = canvas.getContext('2d');
  const points = [{ angle: .2, radius: .73, size: 3.2, phase: .2 }, { angle: 1.22, radius: .48, size: 2.4, phase: 1.6 }, { angle: 2.05, radius: .78, size: 2.8, phase: 2.7 }, { angle: 2.82, radius: .57, size: 2.2, phase: .8 }, { angle: 3.66, radius: .82, size: 3.1, phase: 2.1 }, { angle: 4.45, radius: .44, size: 2.3, phase: 3.4 }, { angle: 5.14, radius: .69, size: 2.7, phase: 1.2 }];
  let width = 0;
  let height = 0;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = (time) => {
    context.clearRect(0, 0, width, height);
    const radius = Math.max(20, Math.min(width, height) * .43);
    const sweep = reducedMotion ? -.65 : (time * (radar.classList.contains('searching') ? .00205 : .00062)) % (Math.PI * 2);
    context.save();
    context.translate(width / 2, height / 2);
    for (let ring = 1; ring <= 4; ring += 1) {
      context.beginPath(); context.arc(0, 0, radius * ring / 4, 0, Math.PI * 2);
      context.strokeStyle = `rgba(149,105,78,${ring === 4 ? .22 : .105})`; context.lineWidth = 1; context.stroke();
    }
    for (let tick = 0; tick < 48; tick += 1) {
      const angle = tick * Math.PI * 2 / 48; const major = tick % 6 === 0;
      context.beginPath(); context.moveTo(Math.cos(angle) * radius * (major ? .94 : .975), Math.sin(angle) * radius * (major ? .94 : .975)); context.lineTo(Math.cos(angle) * radius * 1.015, Math.sin(angle) * radius * 1.015);
      context.strokeStyle = major ? 'rgba(143,92,63,.32)' : 'rgba(143,92,63,.14)'; context.lineWidth = major ? 1.1 : .7; context.stroke();
    }
    for (let axis = 0; axis < 4; axis += 1) {
      const angle = axis * Math.PI / 2;
      context.beginPath(); context.moveTo(Math.cos(angle) * radius * .22, Math.sin(angle) * radius * .22); context.lineTo(Math.cos(angle) * radius * .91, Math.sin(angle) * radius * .91);
      context.strokeStyle = 'rgba(137,101,78,.085)'; context.lineWidth = .8; context.stroke();
    }
    for (let trail = 0; trail < 22; trail += 1) {
      const end = sweep - trail * .027; context.beginPath(); context.moveTo(0, 0); context.arc(0, 0, radius * .985, end - .032, end); context.closePath(); context.fillStyle = `rgba(199,94,40,${(.016 * (1 - trail / 22)).toFixed(4)})`; context.fill();
    }
    context.beginPath(); context.moveTo(0, 0); context.lineTo(Math.cos(sweep) * radius * .99, Math.sin(sweep) * radius * .99); context.strokeStyle = 'rgba(168,68,29,.62)'; context.lineWidth = 1.15; context.stroke();
    points.forEach((point, pointIndex) => {
      const distance = Math.abs(Math.atan2(Math.sin(sweep - point.angle), Math.cos(sweep - point.angle))); const signal = Math.max(.14, 1 - distance / .38); const pulse = reducedMotion ? 1 : .9 + Math.sin(time * .003 + point.phase) * .1;
      const x = Math.cos(point.angle) * radius * point.radius; const y = Math.sin(point.angle) * radius * point.radius;
      context.beginPath(); context.arc(x, y, point.size * (1 + signal * .55) * pulse, 0, Math.PI * 2); context.fillStyle = `rgba(177,76,34,${(.28 + signal * .56).toFixed(3)})`; context.fill();
      if (signal > .55) { context.beginPath(); context.arc(x, y, point.size * (2.4 + signal), 0, Math.PI * 2); context.strokeStyle = `rgba(199,94,40,${(.26 * signal).toFixed(3)})`; context.stroke(); }
      if (signal > .45 && competitorRadarSignalWords.length) {
        const alpha = Math.min(1, (signal - .45) / .38); const cycle = reducedMotion ? 0 : Math.floor(time / 5200); const word = competitorRadarSignalWords[(pointIndex + cycle) % competitorRadarSignalWords.length];
        context.save(); context.globalAlpha = alpha; context.font = '600 9px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
        const labelWidth = Math.ceil(context.measureText(word).width) + 14; const labelHeight = 20; const labelX = x >= 0 ? x + 10 : x - labelWidth - 10; const labelY = y - labelHeight / 2;
        context.beginPath(); context.moveTo(x, y); context.lineTo(x >= 0 ? labelX : labelX + labelWidth, y); context.strokeStyle = 'rgba(159,91,52,.32)'; context.lineWidth = .8; context.stroke();
        context.beginPath(); context.roundRect(labelX, labelY, labelWidth, labelHeight, 5); context.fillStyle = 'rgba(255,251,247,.94)'; context.fill(); context.strokeStyle = 'rgba(178,111,72,.2)'; context.stroke();
        context.fillStyle = 'rgba(111,71,48,.88)'; context.textBaseline = 'middle'; context.fillText(word, labelX + 7, labelY + labelHeight / 2 + .5); context.restore();
      }
    });
    context.restore();
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}

async function apiRequest(endpointKey, payload = {}, options = {}) {
  const endpoint = API_CONFIG.endpoints?.[endpointKey];
  if (!endpoint) {
    if (API_CONFIG.useMockWhenEmpty) return null;
    throw new Error('API 未配置');
  }
  const requestMethod = options.method || 'POST';
  const timeoutMs = Number(options.timeoutMs || API_REQUEST_TIMEOUTS[endpointKey] || 30000);
  const fallbackBaseUrls = Array.isArray(API_CONFIG.fallbackBaseUrls) ? API_CONFIG.fallbackBaseUrls : [];
  const apiBaseUrls = [...new Set([API_CONFIG.baseUrl, ...fallbackBaseUrls].filter(Boolean))];
  const retryCount = options.retryCount ?? (requestMethod === 'GET' ? 2 : 1);
  // 本机入口切换优先于同一个入口的重复请求，避免内嵌浏览器偶发的 loopback 连接失败卡住登录。
  const attemptCount = Math.max(apiBaseUrls.length, Number(retryCount) || 1);
  let lastError;
  for (let attempt = 0; attempt < attemptCount; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const baseUrl = apiBaseUrls[attempt % apiBaseUrls.length];
      const response = await fetch(`${baseUrl}${options.path || endpoint}`, {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          ...(state.user?.token ? { Authorization: `Bearer ${state.user.token}` } : {})
        },
        ...(requestMethod === 'GET' || requestMethod === 'DELETE' ? {} : { body: JSON.stringify(payload) }),
        signal: controller.signal
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error(`中台服务返回了无法解析的结果（HTTP ${response.status}）`);
      }
      if (!response.ok || data.code !== 0) throw new Error(data.message || '接口请求失败');
      return data.data;
    } catch (error) {
      lastError = error.name === 'AbortError'
        ? new Error(`请求超过 ${Math.round(timeoutMs / 1000)} 秒仍未返回，请稍后重试。`)
        : error;
      const retryable = /Failed to fetch|NetworkError|网络请求失败|无法连接中台服务/i.test(lastError.message || '');
      if (attempt < attemptCount - 1 && retryable) await new Promise((resolve) => setTimeout(resolve, 700));
      else break;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }
  if (/Failed to fetch|NetworkError/i.test(lastError?.message || '')) {
    throw new Error('暂时无法连接中台服务，请刷新当前页面后重试；若仍无法连接，请确认 8787 API 服务已启动。');
  }
  throw lastError || new Error('接口请求失败');
}

function canUsePage(page) {
  if (!state.user) return false;
  if (page === 'admin' || page === 'coach') return state.user.role === 'admin';
  if (state.toolAvailability[page] === false) return false;
  if (Array.isArray(state.user.enabledFeatures) && state.user.enabledFeatures.length) {
    return page === 'home' || page === 'personal' || state.user.enabledFeatures.includes(page);
  }
  const tool = tools.find((item) => item.page === page);
  return !tool || tool.roles.includes(state.user.role);
}

function showLogin() {
  $('loginPage').classList.remove('hidden');
  $('appShell').classList.add('hidden');
  $('loginModal').classList.add('hidden');
  document.querySelector('.floating').classList.add('hidden');
}

function showApp() {
  $('loginPage').classList.add('hidden');
  $('appShell').classList.remove('hidden');
  document.querySelector('.floating').classList.remove('hidden');
  applyUser();
  loadToolAvailability();
  loadUserRecords();
  loadPersonalCenter();
  loadSalesMethodConfig();
  loadCopywritingConfig();
  setPage('home');
}

async function loadToolAvailability() {
  const availability = await apiRequest('toolAvailability', {}, { method: 'GET' }).catch(() => null);
  if (!availability) return;
  state.toolAvailability = availability;
  applyUser();
  if (!canUsePage(state.page)) setPage('home');
}

function saveAuthSession() {
  if (!state.user?.token) return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state.user));
}

function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

async function restoreAuthSession() {
  let savedUser;
  try {
    savedUser = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch {
    clearAuthSession();
    showLogin();
    return;
  }
  if (!savedUser?.token) {
    showLogin();
    return;
  }
  state.user = savedUser;
  try {
    const currentUser = await apiRequest('me', {}, { method: 'GET', retryCount: 0 });
    state.user = normalizeApiUser(currentUser);
    saveAuthSession();
    showApp();
  } catch {
    state.user = null;
    clearAuthSession();
    showLogin();
  }
}

function applyUser() {
  $('currentRole').textContent = state.user.roleName;
  $('accountName').textContent = state.user.name;
  $('profileShortcutInitial').textContent = state.user.name.slice(0, 1);
  const avatarUrl = state.personal.profile?.avatar_url || '';
  $('profileShortcutInitial').classList.toggle('has-avatar', Boolean(avatarUrl));
  $('profileShortcutInitial').style.backgroundImage = avatarUrl ? `url("${avatarUrl}")` : '';
  $('workspaceLabel').textContent = state.user.role === 'admin' ? '管理员后台' : `${state.user.roleName}工作台`;
  const pipiMode = $('pipiModeHint');
  if (pipiMode) {
    pipiMode.textContent = state.user.role === 'training'
      ? '训练营客服指南：不会使用中台、找不到功能或生成遇到问题，都可以直接问我。'
      : '陪跑业务助手：可以聊定位、流量、产品、私域和内容方向。';
  }
  $('toggleRole').style.display = state.apiMode === 'mock' ? 'block' : 'none';
  document.querySelectorAll('.admin-only').forEach((item) => item.classList.toggle('hidden', state.user.role !== 'admin'));
  document.querySelectorAll('nav [data-page]').forEach((item) => item.classList.toggle('hidden', !canUsePage(item.dataset.page)));
  document.querySelectorAll('#copyType option').forEach((option) => {
    option.disabled = state.user.role === 'training' && option.value !== 'short';
  });
  if (state.user.role === 'training') $('copyType').value = 'short';
  document.querySelectorAll('[data-copy-agent]').forEach((item) => item.classList.toggle('active', item.dataset.copyAgent === value('copyAgent')));
  renderTools();
  renderQuickQuestions();
  renderRecent();
  renderContinue();
}

function applyPipiPresentation() {
  const displayName = state.pipiConfig.display_name || '皮皮分身';
  const title = $('pipiDisplayName');
  const avatar = $('pipiAvatar');
  if (title) title.textContent = displayName;
  if (avatar) avatar.alt = displayName;
  if (state.page === 'pipi') $('pageTitle').textContent = displayName;
}

async function loginWithPassword() {
  const account = value('loginAccount');
  const password = value('loginPassword');
  try {
    const apiUser = await apiRequest('loginPassword', { account, password }, { retryCount: 2 });
    state.user = apiUser ? normalizeApiUser(apiUser) : mockLogin(account, password);
    saveAuthSession();
    showApp();
  } catch (error) {
    if (API_CONFIG.allowDemoLogin && isApiUnavailable(error) && demoUsers[account]?.password === password) {
      state.user = mockLogin(account, password);
      enterDemoMode('AI 服务暂未启动，当前已进入演示模式；启动 8787 后端后会自动使用真实接口。');
      saveAuthSession();
      showApp();
      return;
    }
    $('loginNote').textContent = error.message;
  }
}

async function registerAccount() {
  const account = value('registerAccount').trim();
  const phone = value('registerPhone').trim();
  const password = value('registerPassword');
  const passwordConfirm = value('registerPasswordConfirm');
  if (password !== passwordConfirm) {
    $('loginNote').textContent = '两次输入的密码不一致';
    return;
  }
  try {
    const apiUser = await apiRequest('register', { account, phone, password });
    state.user = normalizeApiUser(apiUser);
    saveAuthSession();
    showApp();
  } catch (error) {
    $('loginNote').textContent = error.message;
  }
}

function setLoginMode(mode) {
  const registrationEnabled = API_CONFIG.selfRegistrationEnabled === true;
  const isRegister = mode === 'register' && registrationEnabled;
  state.loginMode = isRegister ? 'register' : 'password';
  $('passwordLogin').classList.toggle('hidden', isRegister);
  $('registerForm').classList.toggle('hidden', !isRegister);
  $('loginButton').classList.toggle('hidden', isRegister);
  $('registerButton').classList.toggle('hidden', !isRegister);
  $('showLoginMode').classList.toggle('active', !isRegister);
  $('showRegisterMode').classList.toggle('active', isRegister);
  $('showRegisterMode').classList.toggle('hidden', !registrationEnabled);
  $('showLoginMode').setAttribute('aria-selected', String(!isRegister));
  $('showRegisterMode').setAttribute('aria-selected', String(isRegister));
  $('loginTitle').textContent = isRegister ? '注册皮皮 AI 中台' : '登录皮皮 AI 中台';
  $('loginDescription').textContent = isRegister ? '创建账号后即可进入你的教育内容工作台。' : '登录后进入你的专属教育内容工作台。';
  $('loginNote').textContent = isRegister ? '注册账号默认开通训练营基础功能。' : registrationEnabled ? '没有账号？点击上方“注册”即可创建。' : '账号由管理员统一开通；没有账号请联系交付老师。';
}

async function loginWithSms() {
  const phone = value('loginPhone');
  const code = value('loginCode');
  try {
    const apiUser = await apiRequest('loginSms', { phone, code });
    state.user = apiUser ? normalizeApiUser(apiUser) : { ...demoUsers.coach, token: 'mock-token-coach' };
    saveAuthSession();
    showApp();
  } catch (error) {
    const demoPhone = Object.values(demoUsers).find((item) => item.phone === phone);
    if (API_CONFIG.allowDemoLogin && isApiUnavailable(error) && demoPhone && code === '123456') {
      state.user = { ...demoPhone, token: `mock-token-${demoPhone.role}` };
      enterDemoMode('AI 服务暂未启动，当前已进入演示模式；启动 8787 后端后会自动使用真实接口。');
      saveAuthSession();
      showApp();
      return;
    }
    $('loginNote').textContent = error.message;
  }
}

function mockLogin(account, password) {
  const user = demoUsers[account] || Object.values(demoUsers).find((item) => item.account === account);
  if (!user || user.password !== password) throw new Error('演示账号或密码错误');
  return { ...user, token: `mock-token-${user.role}` };
}

function isApiUnavailable(error) {
  return /Failed to fetch|NetworkError|无法连接中台服务|无法连接 AI 服务|网络请求失败/i.test(error?.message || '');
}

function enterDemoMode(message) {
  state.apiMode = 'mock';
  $('loginNote').textContent = message;
}

function normalizeApiUser(data) {
  const role = data.role || data.student_type || data.roles?.[0] || 'coaching';
  return {
    id: data.id,
    account: data.phone || data.username,
    name: data.nickname || data.name || '学员',
    role,
    roleName: role === 'admin' ? '管理员' : role === 'training' || role === 'training_student' ? '训练营学员' : '陪跑学员',
    enabledFeatures: data.enabled_features || [],
    status: data.status || 'active',
    token: data.token
  };
}

function logout() {
  state.user = null;
  clearAuthSession();
  state.records = [];
  state.copySessions = [];
  state.activeCopySessionId = null;
  $('pipiMessages').innerHTML = '';
  showLogin();
}

async function loadUserRecords() {
  const result = await apiRequest('records', {}, { method: 'GET' }).catch(() => null);
  if (!result) return;
  state.records = (result.items || []).map((item) => ({
    ...item,
    createdAt: item.created_at ? new Date(item.created_at).toLocaleString('zh-CN') : item.createdAt,
    conversationKey: item.conversationKey || item.meta?.conversation_id || '',
    conversationTitle: item.conversationTitle || item.meta?.conversation_title || '',
    conversationHistory: item.conversationHistory || item.meta?.conversation_history || []
  }));
  renderRecent();
  renderContinue();
  if (state.page === 'personal' && state.personalTab === 'recent') renderHistory();
}

function setPage(page) {
  if (!canUsePage(page)) {
    alert(page === 'admin' ? '只有管理员可以查看后台。' : '当前账号暂未开通该功能。');
    return;
  }
  state.page = page;
  document.body.classList.remove('copy-compose-open');
  document.body.classList.toggle('sales-page-open', page === 'sales');
  Object.keys(pages).forEach((key) => $(`${key}Page`).classList.toggle('hidden', key !== page));
  document.querySelectorAll('[data-page]').forEach((button) => button.classList.toggle('active', button.dataset.page === page));
  $('pageTitle').textContent = page === 'pipi' ? (state.pipiConfig.display_name || pages[page]) : pages[page];
  if (page === 'copy') {
    setCopyView(state.copyView);
    loadCopywritingConfig();
  }
  if (page === 'competitor') {
    renderCompetitorFinder();
    renderCompetitorTrends();
    renderCompetitorQuota();
    if (!state.competitorTrends.loaded && !state.competitorTrends.loading) loadCompetitorTrends();
    if (!state.competitorQuota.loaded && !state.competitorQuota.loading) loadCompetitorQuota();
  }
  if (page === 'coach') renderCoachMomentPoster();
  if (page === 'personal') loadPersonalCenter();
  if (page === 'admin') loadAdminConfig();
  if (page === 'sales') {
    renderSalesMethodGuide();
    loadSalesMethodConfig();
  }
  if (page === 'pipi') {
    const shouldRefreshWelcome = !$('pipiMessages').children.length || (state.pipiUserTurns === 0 && state.pipiWelcomeNeedsRefresh);
    loadPipiConfig().then((changed) => {
      if (shouldRefreshWelcome || (changed && state.pipiUserTurns === 0)) {
        resetPipi();
        state.pipiWelcomeNeedsRefresh = false;
      }
    });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getSalesMethodDetails() {
  if (!state.salesMethodConfig.length) return salesMethodDetails;
  return Object.fromEntries(state.salesMethodConfig.map((item) => [item.code, item]));
}

async function loadSalesMethodConfig() {
  const result = await apiRequest('salesMethodConfig', {}, { method: 'GET' }).catch(() => null);
  if (!result?.steps?.length) return;
  state.salesMethodConfig = result.steps.map((item) => ({ ...item, desc: item.description || item.desc || '' }));
  renderSalesMethodGuide();
  if (!$('salesStepView').classList.contains('hidden')) renderSalesMethodStep();
}

async function loadCopywritingConfig() {
  const result = await apiRequest('copywritingConfig', {}, { method: 'GET' }).catch(() => null);
  if (!result) return;
  state.copywritingConfig = { ...state.copywritingConfig, ...result };
  syncCopyAgentDefinitions();
  renderCopyAgentGallery();
  renderCopyAgentCovers();
  if (!$('copyComposeView').classList.contains('hidden')) renderCopyAgentChat();
}

function renderSalesMethodGuide() {
  const container = $('salesMethodSteps');
  if (!container) return;
  const details = getSalesMethodDetails();
  container.innerHTML = Object.values(details).map((item) => {
    const summary = item.short_desc || item.desc || '';
    return `<button type="button" data-sales-method="${item.code}"><span>${item.number}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.library)} · ${escapeHtml(summary)}</small></div></button>`;
  }).join('');
}

function renderTools() {
  const container = $('toolGrid');
  if (!container) return;
  container.innerHTML = tools.filter((tool) => canUsePage(tool.page)).map((tool) => `<button class="tool-card" data-page="${tool.page}">
      <span>${tool.icon}</span><strong>${tool.title}</strong><small>${tool.desc}</small><em>进入</em>
    </button>`).join('');
}

function addRecord(type, title, content, extra = {}) {
  state.records.unshift({ id: Date.now(), type, title, content, createdAt: new Date().toLocaleString('zh-CN'), ...extra });
  renderRecent();
  renderContinue();
  $('adminCallCount').textContent = `${state.records.length} 次`;
}

function renderRecent() {
  const items = state.records.slice(0, 4);
  $('recentList').innerHTML = items.length ? items.map(recordHtml).join('') : '<div class="record-item"><strong>暂无生成记录</strong><div class="meta"><span>先从皮皮分身或选题生成开始</span></div></div>';
}

function recordPage(type) {
  if (/选题/.test(type)) return 'topics';
  if (/文案/.test(type)) return 'copy';
  if (/竞品/.test(type)) return 'competitor';
  if (/销售/.test(type)) return 'sales';
  if (/皮皮/.test(type)) return 'pipi';
  return 'personal';
}

function renderContinue() {
  const container = $('continueList');
  if (!container) return;
  const items = state.records.slice(0, 3);
  container.innerHTML = items.length ? items.map((item) => `<article class="continue-item"><div class="continue-item-main"><span>${escapeHtml(item.type || '内容记录')}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.createdAt || item.created_at || '')}</small></div><button class="link-button" data-page="${recordPage(item.type || '')}">继续 →</button></article>`).join('') : '<div class="continue-empty"><strong>还没有进行中的内容</strong><span>从上面的快速开始进入一个工具，生成内容后会显示在这里。</span></div>';
}

async function loadPersonalCenter() {
  const [profile, personaData, knowledgeData, pointsData] = await Promise.all([
    apiRequest('personalProfile', {}, { method: 'GET' }).catch(() => null),
    apiRequest('personalPersona', {}, { method: 'GET' }).catch(() => null),
    apiRequest('personalKnowledge', {}, { method: 'GET' }).catch(() => null),
    apiRequest('personalPoints', {}, { method: 'GET' }).catch(() => null)
  ]);
  if (profile) {
    state.personal.profile = profile;
    if (profile.name && state.user.name !== profile.name) {
      state.user.name = profile.name;
      saveAuthSession();
      applyUser();
    }
  }
  if (personaData) state.personal.persona = personaData.persona || null;
  if (knowledgeData) state.personal.knowledge = knowledgeData.items || [];
  if (pointsData) state.personal.points = pointsData;
  renderPersonalCenter();
}

function renderPersonalCenter() {
  const container = $('personalCenterContent');
  if (!container) return;
  const profile = state.personal.profile || {};
  const persona = state.personal.persona;
  const knowledge = state.personal.knowledge || [];
  const points = state.personal.points || { balance: 0, items: [] };
  $('personalPointsBalance').textContent = `${points.balance || 0} 积分`;
  document.querySelectorAll('[data-personal-tab]').forEach((button) => button.classList.toggle('active', button.dataset.personalTab === state.personalTab));
  if (state.personalTab === 'profile') {
    container.innerHTML = `<section class="personal-panel"><div class="personal-panel-head"><div><h3>编辑资料</h3><p>这份资料用于识别你的账号与业务背景。</p></div></div><div class="personal-avatar-editor"><div class="personal-avatar-preview">${profile.avatar_url ? `<img src="${escapeHtml(profile.avatar_url)}" alt="个人头像" />` : `<span>${escapeHtml((profile.name || state.user.name).slice(0, 1))}</span>`}</div><div><strong>个人头像</strong><small>支持 JPG、PNG、WebP，图片不超过 2MB。</small><input id="personalAvatarFile" type="file" accept="image/jpeg,image/png,image/webp" hidden /><button class="secondary mini" id="selectPersonalAvatar" type="button">上传头像</button></div></div><div class="personal-form"><label>姓名<input id="personalName" value="${escapeHtml(profile.name || state.user.name)}" maxlength="32" /></label><label>账号<input value="${escapeHtml(profile.account || state.user.account || '')}" disabled /></label><label>手机号<input value="${escapeHtml(profile.phone || '')}" disabled /></label><label>一句话介绍<textarea id="personalBio" rows="3" placeholder="例如：专注 3-12 岁少儿书法教育">${escapeHtml(profile.bio || '')}</textarea></label><label>业务描述<textarea id="personalBusiness" rows="4" placeholder="写下你的赛道、产品、服务对象和当下目标">${escapeHtml(profile.business_description || '')}</textarea></label><button class="primary" id="savePersonalProfile">保存资料</button></div></section>`;
    return;
  }
  if (state.personalTab === 'persona') {
    container.innerHTML = persona ? `<section class="personal-panel"><div class="personal-panel-head"><div><h3>个人人设</h3><p>“我是谁 / 我服务谁 / 我的故事”，所有 AI 创作都会自动使用。</p></div><button class="secondary" id="deletePersona">删除人设</button></div><div class="personal-form persona-form"><label>人设名称<input id="personaName" value="${escapeHtml(persona.name || '')}" /></label><label>我是做什么的<textarea id="personaIdentity" rows="3" placeholder="例如：同城少儿书法机构主理人">${escapeHtml(persona.identity || '')}</textarea></label><label>我服务谁<textarea id="personaAudience" rows="3" placeholder="例如：3-12 岁孩子及关注书写能力的家长">${escapeHtml(persona.audience || '')}</textarea></label><label>我提供什么<textarea id="personaService" rows="3" placeholder="例如：少儿硬笔、软笔课程与书写习惯培养">${escapeHtml(persona.service || '')}</textarea></label><label>我的故事<textarea id="personaStory" rows="6" placeholder="写下你的经历、理念和想坚持的事">${escapeHtml(persona.story || '')}</textarea></label><button class="primary" id="savePersona">保存人设</button></div></section>` : `<section class="persona-empty"><i data-lucide="circle-user-round"></i><h3>还没有个人人设</h3><p>创建一个人设，让所有 AI 创作出的内容都带上你的印记。</p><button class="primary" id="createPersona"><i data-lucide="plus"></i>创建第一个人设</button></section>`;
    window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true', 'stroke-width': 1.8 } });
    return;
  }
  if (state.personalTab === 'knowledge') {
    container.innerHTML = `<section class="personal-panel"><div class="personal-panel-head"><div><h3>个人知识库</h3><p>把皮皮团队给你产出的文档放进来吧～已启用的人设和知识会被所有智能体自动参考。</p></div><span class="personal-count">${knowledge.length} 条</span></div><div class="personal-knowledge-upload"><input id="personalKnowledgeFile" type="file" accept=".txt,.md,.csv,.rtf,.docx,text/plain,text/markdown,text/csv,application/rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden /><button class="secondary" id="selectPersonalKnowledgeFile" type="button">上传文档</button><span id="personalKnowledgeUploadStatus">支持 TXT、MD、CSV、RTF、DOCX，单份不超过 5MB。</span></div><div class="personal-knowledge-form"><input id="personalKnowledgeTitle" placeholder="文档标题，例如：我的业务定位方案" /><input id="personalKnowledgeCategory" placeholder="分类，例如：定位 / 产品 / 案例" /><textarea id="personalKnowledgeContent" rows="7" placeholder="也可以直接粘贴文档内容。已启用的内容会作为你的专属创作参考。"></textarea><button class="primary" id="addPersonalKnowledge">加入个人知识库</button></div><div class="personal-knowledge-list">${knowledge.length ? knowledge.map((item) => `<article><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category || '未分类')} · ${item.source_type ? `${escapeHtml(item.source_type)} 文档 · ` : ''}${item.status === 'active' ? '创作中已启用' : '已暂停使用'}</small><p>${escapeHtml(item.content || '').slice(0, 180)}</p></div><div class="row-actions"><button class="secondary mini" data-personal-knowledge-toggle="${escapeHtml(item.id)}" data-next-status="${item.status === 'active' ? 'disabled' : 'active'}">${item.status === 'active' ? '暂停' : '启用'}</button><button class="secondary mini" data-personal-knowledge-delete="${escapeHtml(item.id)}">删除</button></div></article>`).join('') : '<div class="personal-empty-note">还没有个人文档。从皮皮团队给你的定位、方案或案例里挑一份开始吧。</div>'}</div></section>`;
    return;
  }
  if (state.personalTab === 'points') {
    container.innerHTML = `<section class="personal-panel student-points-panel"><div class="points-hero"><span>当前可用积分</span><strong>${points.balance || 0}</strong><small>积分可用于后续开放的增值服务和专属权益，具体规则以平台通知为准。</small></div></section>`;
    return;
  }
  container.innerHTML = `<section class="personal-panel"><div class="personal-panel-head"><div><h3>最近生成</h3><p>这里保留你在选题、文案、竞品、皮皮和销售模拟中的生成记录。</p></div><button class="secondary" id="clearPersonalHistory">清空记录</button></div><div id="personalRecentList" class="record-list"></div></section>`;
  renderHistory();
}

function renderHistory() {
  const container = $('personalRecentList');
  if (!container) return;
  if (!state.records.length) {
    container.innerHTML = '<div class="record-item"><strong>暂无生成记录</strong><div class="meta"><span>你的创作和对话记录会显示在这里</span></div></div>';
    return;
  }
  const groups = new Map();
  state.records.forEach((item) => {
    const key = item.conversationKey || `${item.type}:${item.title}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  container.innerHTML = [...groups.values()].map((items) => {
    const latest = items[0];
    const title = latest.conversationTitle || latest.title;
    const preview = (latest.content || '').split('\n').find(Boolean) || '已生成内容，可回到原工具继续查看。';
    const transcript = Array.isArray(latest.conversationHistory) ? latest.conversationHistory : [];
    const transcriptHtml = transcript.length ? `<details class="record-transcript"><summary>查看完整对话 · ${transcript.length} 条消息</summary><div>${transcript.map((message) => `<p class="${message.role === 'user' ? 'user' : 'assistant'}"><b>${message.role === 'user' ? '你' : '皮皮'}</b>${escapeHtml(message.content || '')}</p>`).join('')}</div></details>` : '';
    return `<article class="record-item conversation-record"><div class="conversation-record-head"><div><strong>${escapeHtml(title)}</strong><div class="meta"><span>${escapeHtml(latest.type || '内容记录')}</span><span>${transcript.length ? `${transcript.length} 条消息` : `${items.length} 次生成`}</span><span>${escapeHtml(latest.createdAt || latest.created_at || '')}</span></div></div><button class="link-button" data-page="${recordPage(latest.type || '')}">继续对话 →</button></div><p>${escapeHtml(preview.slice(0, 120))}</p>${transcriptHtml}</article>`;
  }).join('');
}

function recordHtml(item) {
  return `<article class="record-item"><strong>${escapeHtml(item.title)}</strong><div class="meta"><span>${escapeHtml(item.type)}</span><span>${escapeHtml(item.createdAt || item.created_at || '')}</span>${item.user_name ? `<span>${escapeHtml(item.user_name)}</span>` : ''}</div></article>`;
}

function renderCopySessions() {
  const container = $('copySessionList');
  if (!container) return;
  const sessions = state.copySessions.filter((item) => item.agent === value('copyAgent'));
  container.innerHTML = sessions.length
    ? sessions.map((session) => `<button type="button" class="agent-session-item ${session.id === state.activeCopySessionId ? 'active' : ''}" data-copy-session="${session.id}"><strong>${escapeHtml(session.title)}</strong><small>${escapeHtml(session.updatedAt)}</small></button>`).join('')
    : '<div class="agent-session-item active">新对话</div>';
}

function saveCopySession(payload, typeName, content) {
  const now = new Date().toLocaleString('zh-CN');
  let session = state.copySessions.find((item) => item.id === state.activeCopySessionId && item.agent === payload.agent);
  if (!session) {
    session = {
      id: `copy-${Date.now()}`,
      agent: payload.agent,
      title: payload.material.slice(0, 28),
      typeName,
      createdAt: now,
      updatedAt: now,
      messages: []
    };
    state.copySessions.unshift(session);
    state.activeCopySessionId = session.id;
  }
  session.updatedAt = now;
  session.typeName = typeName;
  session.messages.push({ prompt: payload.material, content, createdAt: now });
  renderCopySessions();
  return session;
}

function renderCopyConversation(session, pendingPrompt = '', pendingContent = '') {
  const messages = session?.messages || [];
  const hasConversation = Boolean(messages.length || pendingPrompt);
  $('copyChatBody').classList.toggle('has-conversation', hasConversation);
  $('copyChatBody').closest('.agent-chat-main')?.classList.toggle('has-conversation', hasConversation);
  $('copyResult').classList.toggle('empty', !hasConversation);
  const completed = messages.map((message) => `
    <div class="copy-chat-message user"><div class="copy-message-bubble">${escapeHtml(message.prompt || '')}</div></div>
    <div class="copy-chat-message assistant"><div class="copy-message-label">皮皮文案智能体</div><div class="copy-message-text" contenteditable="true">${escapeHtml(message.content || '')}</div></div>
  `).join('');
  const pending = pendingPrompt ? `
    <div class="copy-chat-message user"><div class="copy-message-bubble">${escapeHtml(pendingPrompt)}</div></div>
    <div class="copy-chat-message assistant pending"><div class="copy-message-label">皮皮文案智能体</div>${pendingContent || '<div class="copy-thinking"><span></span><span></span><span></span></div>'}</div>
  ` : '';
  $('copyResult').innerHTML = completed + pending;
  requestAnimationFrame(() => {
    $('copyChatBody').scrollTop = $('copyChatBody').scrollHeight;
  });
}

function restoreCopySession(sessionId) {
  const session = state.copySessions.find((item) => item.id === sessionId);
  if (!session) return;
  state.activeCopySessionId = session.id;
  renderCopyConversation(session);
  renderCopySessions();
}

function copyText(text) {
  navigator.clipboard?.writeText(text);
}

function downloadText(filename, text) {
  const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function timestampName(prefix) {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `${prefix}-${stamp}.txt`;
}

function setButtonLoading(id, isLoading, loadingText) {
  const button = $(id);
  if (!button) return;
  if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

function modelBadge(result) {
  if (!result?.provider && !result?.model) return '';
  if (result.provider === 'local' && result.model === 'topic-fallback') return '<div class="model-badge"><span>备用生成</span></div>';
  return `<div class="model-badge"><span>${escapeHtml(result.provider || 'api')}</span><span>${escapeHtml(result.model || 'model')}</span>${result.latency_ms ? `<span>${result.latency_ms}ms</span>` : ''}</div>`;
}

function errorHtml(message) {
  return `<div class="error-box"><strong>生成失败</strong><p>${escapeHtml(message || '接口请求失败，请稍后重试。')}</p></div>`;
}

function fallbackNotice(message) {
  return `<div class="warning-box"><strong>AI 服务暂时没有返回</strong><p>${escapeHtml(message || '当前先展示本地兜底结果，你可以稍后重新生成。')}</p></div>`;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function setUsageDatePreset(preset) {
  const today = new Date();
  const filter = state.usageDateFilter;
  filter.preset = preset;
  if (preset === 'custom') return;
  const start = new Date(today);
  if (preset === '7d') start.setDate(start.getDate() - 6);
  if (preset === '30d') start.setDate(start.getDate() - 29);
  filter.startDate = formatIsoDate(start);
  filter.endDate = formatIsoDate(today);
}

function usageDateFilterPath(endpoint) {
  const filter = state.usageDateFilter;
  if (!filter.startDate || !filter.endDate) setUsageDatePreset(filter.preset || '30d');
  const query = new URLSearchParams({ start_date: filter.startDate, end_date: filter.endDate });
  return `${endpoint}?${query.toString()}`;
}

function usageDateLabel() {
  const filter = state.usageDateFilter;
  if (filter.preset === 'today') return '今日';
  if (filter.preset === '7d') return '近 7 天';
  if (filter.preset === '30d') return '近 30 天';
  return `${filter.startDate || '--'} 至 ${filter.endDate || '--'}`;
}

async function loadAdminConfig() {
  if (state.user?.role !== 'admin') return;
  const requests = [
    ['users', apiRequest('adminUsers', {}, { method: 'GET' })],
    ['stats', apiRequest('adminStats', {}, { method: 'GET' })],
    ['pipiAssistant', apiRequest('adminPipiConfig', {}, { method: 'GET' })],
    ['pipiKnowledge', apiRequest('adminPipiKnowledge', {}, { method: 'GET' })],
    ['salesSimulation', apiRequest('adminSalesConfig', {}, { method: 'GET' })],
    ['coachToolbox', apiRequest('adminCoachToolbox', {}, { method: 'GET' })],
    ['salesKnowledge', apiRequest('adminSalesKnowledge', {}, { method: 'GET' })],
    ['salesReports', apiRequest('adminSalesReports', {}, { method: 'GET' })],
    ['copywriting', apiRequest('adminCopywritingConfig', {}, { method: 'GET' })],
    ['providers', apiRequest('adminProviders', {}, { method: 'GET' })],
    ['models', apiRequest('adminModels', {}, { method: 'GET' })],
    ['prompts', apiRequest('adminPrompts', {}, { method: 'GET' })],
    ['features', apiRequest('adminFeatures', {}, { method: 'GET' })],
    ['usage', apiRequest('adminUsage', {}, { method: 'GET', path: usageDateFilterPath(API_CONFIG.endpoints.adminUsage) })],
    ['providerUsage', apiRequest('adminProviderUsage', {}, { method: 'GET', path: usageDateFilterPath(API_CONFIG.endpoints.adminProviderUsage) })],
    ['callLogs', apiRequest('adminCallLogs', {}, { method: 'GET', path: usageDateFilterPath(API_CONFIG.endpoints.adminCallLogs) })]
  ];
  const settled = await Promise.allSettled(requests.map(([, request]) => request));
  const data = {};
  const failed = [];
  settled.forEach((result, index) => {
    const key = requests[index][0];
    if (result.status === 'fulfilled') data[key] = result.value;
    else failed.push(key);
  });
  if (failed.length) showToast(`后台有 ${failed.length} 项配置加载失败，已保留上一次数据，请点击“刷新配置”重试`);
  const users = data.users || { items: state.adminConfig.users };
  const stats = data.stats || state.adminConfig.stats;
  const pipiAssistant = data.pipiAssistant || state.adminConfig.pipiAssistant;
  const pipiKnowledge = data.pipiKnowledge || { items: state.adminConfig.pipiKnowledge };
  const salesSimulation = data.salesSimulation || state.adminConfig.salesSimulation;
  const coachToolbox = data.coachToolbox || state.adminConfig.coachToolbox;
  const salesKnowledge = data.salesKnowledge || { items: state.adminConfig.salesKnowledge };
  const salesReports = data.salesReports || { items: state.adminConfig.salesReports };
  const copywriting = data.copywriting || state.adminConfig.copywriting;
  const providers = data.providers || { items: state.adminConfig.providers };
  const models = data.models || { items: state.adminConfig.models };
  const prompts = data.prompts || { items: state.adminConfig.prompts };
  const features = data.features || { items: state.adminConfig.features };
  const usage = data.usage || state.adminConfig.usage;
  const providerUsage = data.providerUsage || state.adminConfig.providerUsage;
  const callLogs = data.callLogs || { items: state.adminConfig.callLogs };
  state.adminConfig.users = users.items || [];
  state.adminConfig.stats = stats || {};
  state.adminConfig.pipiAssistant = pipiAssistant || {};
  state.adminConfig.pipiKnowledge = pipiKnowledge.items || [];
  state.adminConfig.salesSimulation = salesSimulation || {};
  state.adminConfig.coachToolbox = coachToolbox || {};
  state.adminConfig.salesKnowledge = salesKnowledge.items || [];
  state.adminConfig.salesReports = salesReports.items || [];
  state.adminConfig.copywriting = copywriting || { agents: [], covers: {}, cover_options: [] };
  state.copywritingConfig = { ...state.copywritingConfig, ...state.adminConfig.copywriting };
  syncCopyAgentDefinitions();
  renderCopyAgentGallery();
  renderCopyAgentCovers();
  state.adminConfig.providers = providers.items || [];
  state.adminConfig.models = models.items || [];
  state.adminConfig.prompts = prompts.items || [];
  state.adminConfig.features = features.items || [];
  state.adminConfig.usage = usage || { totals: {}, by_function: [], by_model: [] };
  state.adminConfig.providerUsage = providerUsage || { items: [] };
  state.adminConfig.callLogs = callLogs.items || [];
  if (!state.selectedPromptId && state.adminConfig.prompts.length) state.selectedPromptId = state.adminConfig.prompts[0].id;
  renderAdminConfig();
}

const adminModuleMeta = {
  overview: ['后台概览', '快速查看账号、内容智能体、AI 配置、销售训练和用量情况。'],
  users: ['用户与权限', '后台手动开通训练营和陪跑权限。'],
  'pipi-assistant': ['皮皮分身', '维护皮皮的语气、回复规则、知识库范围和互动表情包。'],
  'sales-simulation': ['销售中心', '在同一处维护销售模拟规则，并查看学员训练报告。'],
  'coach-toolbox': ['教练工具箱', '独立管理教练工具、工作流搭建 Prompt 与模型配置。'],
  'agent-covers': ['文案智能体', '在同一处维护智能体的上下架、模型、开场引导、前台封面与专属 Prompt。'],
  'model-management': ['AI 配置', '集中管理供应商、模型、Prompt 与功能绑定。'],
  logs: ['用量与日志', '查看功能和模型的 Token 消耗，以及最近调用状态。']
};

function providerName(code) {
  return state.adminConfig.providers.find((item) => item.code === code)?.name || code;
}

const copyAgentNames = {
  local_city: '同城智能体',
  persona_story: '人设智能体',
  education_vertical: '垂类爆款智能体',
  education_dry_goods: '垂类干货智能体',
  education_marketing: '营销智能体',
  moments: '朋友圈智能体',
  xiaohongshu: '小绿书智能体',
  wechat_article: '公众号文案'
};

const defaultCopyAgentCovers = {
  local_city: 'image-pipi-reading-jpg',
  persona_story: 'image-pipi-cafe-jpg',
  education_vertical: 'image-pipi-winter-city-jpg',
  education_dry_goods: 'image-pipi-hanfu-jpg',
  education_marketing: 'image-pipi-white-sea-jpg',
  moments: 'image-pipi-blue-sea-jpg',
  xiaohongshu: 'image-pipi-pink-sea-jpg',
  wechat_article: 'image-pipi-arch-sea-jpg'
};

const defaultCopyCoverOptions = [
  { id: 'image-pipi-reading-jpg', label: '图片 01', file: 'assets/agent-covers/pipi-reading.jpg', focus: '50% 50%' },
  { id: 'image-pipi-cafe-jpg', label: '图片 02', file: 'assets/agent-covers/pipi-cafe.jpg', focus: '50% 50%' },
  { id: 'image-pipi-winter-city-jpg', label: '图片 03', file: 'assets/agent-covers/pipi-winter-city.jpg', focus: '50% 50%' },
  { id: 'image-pipi-hanfu-jpg', label: '图片 04', file: 'assets/agent-covers/pipi-hanfu.jpg', focus: '50% 50%' },
  { id: 'image-pipi-white-sea-jpg', label: '图片 05', file: 'assets/agent-covers/pipi-white-sea.jpg', focus: '50% 50%' },
  { id: 'image-pipi-blue-sea-jpg', label: '图片 06', file: 'assets/agent-covers/pipi-blue-sea.jpg', focus: '50% 50%' },
  { id: 'image-pipi-pink-sea-jpg', label: '图片 07', file: 'assets/agent-covers/pipi-pink-sea.jpg', focus: '50% 50%' },
  { id: 'image-pipi-arch-sea-jpg', label: '图片 08', file: 'assets/agent-covers/pipi-arch-sea.jpg', focus: '50% 50%' },
  { id: 'image-pipi-sunset-yellow-jpg', label: '图片 09', file: 'assets/agent-covers/pipi-sunset-yellow.jpg', focus: '50% 50%' }
];

function copyCoverOptions() {
  return state.copywritingConfig.cover_options?.length ? state.copywritingConfig.cover_options : defaultCopyCoverOptions;
}

function copyAgentCover(agentCode) {
  const coverId = state.copywritingConfig.covers?.[agentCode] || defaultCopyAgentCovers[agentCode] || 'reading';
  const option = copyCoverOptions().find((item) => item.id === coverId) || defaultCopyCoverOptions[0];
  const layout = state.copywritingConfig.layouts?.[agentCode] || {};
  const focusX = Number.isFinite(Number(layout.focus_x)) ? Number(layout.focus_x) : 50;
  const focusY = Number.isFinite(Number(layout.focus_y)) ? Number(layout.focus_y) : 50;
  const zoom = Number.isFinite(Number(layout.zoom)) ? Number(layout.zoom) : 100;
  return { ...option, focus: `${focusX}% ${focusY}%`, zoom };
}

function renderCopyAgentCovers() {
  document.querySelectorAll('[data-copy-agent]').forEach((card) => {
    const cover = copyAgentCover(card.dataset.copyAgent);
    const image = card.querySelector('.agent-cover.large img');
    if (!image) return;
    const zoom = Math.max(1, Number(cover.zoom || 100) / 100);
    image.src = cover.file;
    image.alt = `${copyAgentNames[card.dataset.copyAgent] || '文案智能体'}封面`;
    image.style.setProperty('--cover-focus', cover.focus || '50% 48%');
    image.style.setProperty('--cover-zoom', String(zoom));
    image.style.objectPosition = cover.focus || '50% 48%';
    image.style.transformOrigin = cover.focus || '50% 48%';
  });
}

function renderCopyAgentManager() {
  const container = $('copyAgentManager');
  const createForm = $('copyAgentCreateForm');
  const toggleButton = $('toggleCreateCopyAgent');
  if (!container || !createForm || !toggleButton) return;
  const agents = state.adminConfig.copywriting?.agents || [];
  const allModels = state.adminConfig.models || [];
  const models = allModels.filter((item) => item.status === 'active');
  const modelOptions = (selectedId) => {
    const selectedModel = allModels.find((item) => Number(item.id) === Number(selectedId));
    const options = selectedModel && selectedModel.status !== 'active' ? [selectedModel, ...models] : models;
    return options.map((model) => `<option value="${model.id}" ${Number(selectedId) === Number(model.id) ? 'selected' : ''}>${escapeHtml(model.display_name || model.model_code)} · ${escapeHtml(providerName(model.provider_code))}${model.status !== 'active' ? '（已停用，请重新选择）' : ''}</option>`).join('');
  };
  if ($('copywritingAgentCount')) $('copywritingAgentCount').textContent = `${agents.length} 个智能体`;
  toggleButton.textContent = state.copyAgentCreateOpen ? '收起新建' : '＋ 新建智能体';
  createForm.classList.toggle('hidden', !state.copyAgentCreateOpen);
  createForm.innerHTML = state.copyAgentCreateOpen ? `<div class="copy-agent-create-card">
    <div class="copy-agent-form-grid"><label>智能体名称<input id="newCopyAgentName" placeholder="例如：招生邀约智能体" /></label><label>识别码（可选）<input id="newCopyAgentCode" placeholder="留空自动生成；或填 enrollment_invite" /></label><label>内容类型<select id="newCopyAgentType"><option value="short">短视频文案</option><option value="moments">朋友圈文案</option><option value="imageText">图文卡片</option><option value="article">公众号长文</option></select></label><label>前台分类<select id="newCopyAgentCategory"><option value="traffic">流量</option><option value="private">私域</option></select></label><label>使用模型<select id="newCopyAgentModel">${modelOptions(20)}</select></label></div>
    <label>前台介绍<input id="newCopyAgentDescription" placeholder="一句话说明它能帮老师完成什么" /></label>
    <label>开局引导<textarea id="newCopyAgentGuide" rows="2" placeholder="例如：告诉我你的课程、目标家长和这次邀约的活动。"></textarea></label>
    <label>示例问题（每行一条，最多 4 条）<textarea id="newCopyAgentStarters" rows="4" placeholder="帮我写一条公开课邀约\n把这段课程介绍改得更自然"></textarea></label>
    <label>生成 Prompt<textarea id="newCopyAgentPrompt" rows="7" placeholder="写清楚这个智能体的身份、任务、输出结构与不能编造的边界。留空会使用通用教育文案规则。"></textarea></label>
    <div class="copy-agent-form-actions"><button class="primary" type="button" id="createCopyAgent">创建智能体（默认下架）</button><small>创建后可继续调整封面和 Prompt，确认无误再上架。</small></div>
  </div>` : '';
  container.innerHTML = agents.length ? agents.map((agent) => {
    const category = Array.isArray(agent.tags) && agent.tags.includes('private') ? 'private' : 'traffic';
    const model = allModels.find((item) => Number(item.id) === Number(agent.model_id));
    return `<article class="copy-agent-manager-item ${agent.status === 'published' ? 'is-published' : 'is-unpublished'}">
      <header><div><span class="copy-agent-status">${agent.status === 'published' ? '已上架' : '已下架'}</span><strong>${escapeHtml(agent.name)}</strong><small>${escapeHtml(agent.code)} · ${escapeHtml(model?.display_name || '模型待选择')}</small></div><div class="copy-agent-row-actions"><button class="secondary mini" type="button" data-copy-agent-save="${escapeHtml(agent.code)}">保存配置</button><button class="${agent.status === 'published' ? 'secondary' : 'primary'} mini" type="button" data-copy-agent-status="${escapeHtml(agent.code)}" data-next-status="${agent.status === 'published' ? 'unpublished' : 'published'}">${agent.status === 'published' ? '下架智能体' : '上架智能体'}</button></div></header>
      <div class="copy-agent-form-grid"><label>名称<input data-copy-agent-name="${escapeHtml(agent.code)}" value="${escapeHtml(agent.name)}" /></label><label>内容类型<select data-copy-agent-type="${escapeHtml(agent.code)}"><option value="short" ${agent.default_type === 'short' ? 'selected' : ''}>短视频文案</option><option value="moments" ${agent.default_type === 'moments' ? 'selected' : ''}>朋友圈文案</option><option value="imageText" ${agent.default_type === 'imageText' ? 'selected' : ''}>图文卡片</option><option value="article" ${agent.default_type === 'article' ? 'selected' : ''}>公众号长文</option></select></label><label>前台分类<select data-copy-agent-category="${escapeHtml(agent.code)}"><option value="traffic" ${category === 'traffic' ? 'selected' : ''}>流量</option><option value="private" ${category === 'private' ? 'selected' : ''}>私域</option></select></label><label>使用模型<select data-copy-agent-model="${escapeHtml(agent.code)}">${modelOptions(agent.model_id)}</select></label></div>
      <label>前台介绍<input data-copy-agent-description="${escapeHtml(agent.code)}" value="${escapeHtml(agent.description || '')}" /></label>
      <label>每个新对话的开局引导<textarea data-copy-agent-guide="${escapeHtml(agent.code)}" rows="2">${escapeHtml(agent.guide || '')}</textarea></label>
      <label>示例问题（每行一条）<textarea data-copy-agent-starters="${escapeHtml(agent.code)}" rows="4">${escapeHtml((agent.starters || []).map((item) => typeof item === 'object' ? item.prompt || item.label : item).join('\n'))}</textarea></label>
    </article>`;
  }).join('') : '<div class="empty-box">还没有智能体，可以先新建一个。</div>';
  toggleButton.onclick = () => {
    state.copyAgentCreateOpen = !state.copyAgentCreateOpen;
    renderCopyAgentManager();
  };
  if ($('createCopyAgent')) $('createCopyAgent').onclick = async () => {
    try {
      const name = value('newCopyAgentName');
      if (!name) throw new Error('请先填写智能体名称');
      await postAdmin('adminCopywritingAgents', {
        name,
        code: value('newCopyAgentCode'),
        description: value('newCopyAgentDescription'),
        guide: value('newCopyAgentGuide'),
        starters: value('newCopyAgentStarters').split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
        default_type: value('newCopyAgentType'),
        category: value('newCopyAgentCategory'),
        model_id: Number(value('newCopyAgentModel')),
        prompt: value('newCopyAgentPrompt'),
        status: 'unpublished'
      });
      state.copyAgentCreateOpen = false;
      renderCopyAgentManager();
      showToast('智能体已创建，当前为下架状态');
    } catch (error) {
      alert(error.message);
    }
  };
  container.querySelectorAll('[data-copy-agent-save]').forEach((button) => {
    button.addEventListener('click', async () => {
      const code = button.dataset.copyAgentSave;
      try {
        await patchAdmin(`/api/admin/copywriting/agents/${encodeURIComponent(code)}`, {
          name: container.querySelector(`[data-copy-agent-name="${code}"]`)?.value,
          description: container.querySelector(`[data-copy-agent-description="${code}"]`)?.value,
          guide: container.querySelector(`[data-copy-agent-guide="${code}"]`)?.value,
          starters: (container.querySelector(`[data-copy-agent-starters="${code}"]`)?.value || '').split(/\r?\n/).map((item) => item.trim()).filter(Boolean),
          default_type: container.querySelector(`[data-copy-agent-type="${code}"]`)?.value,
          category: container.querySelector(`[data-copy-agent-category="${code}"]`)?.value,
          model_id: Number(container.querySelector(`[data-copy-agent-model="${code}"]`)?.value)
        });
      } catch (error) {
        alert(error.message);
      }
    });
  });
  container.querySelectorAll('[data-copy-agent-status]').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await patchAdmin(`/api/admin/copywriting/agents/${encodeURIComponent(button.dataset.copyAgentStatus)}`, { status: button.dataset.nextStatus });
        showToast(button.dataset.nextStatus === 'published' ? '智能体已上架' : '智能体已下架');
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function renderCopywritingCoverConfig() {
  const container = $('copywritingCoverConfig');
  if (!container) return;
  const config = state.adminConfig.copywriting || {};
  const options = config.cover_options?.length ? config.cover_options : defaultCopyCoverOptions;
  const covers = config.covers || state.copywritingConfig.covers || defaultCopyAgentCovers;
  const layouts = config.layouts || state.copywritingConfig.layouts || {};
  const agents = config.agents?.length ? config.agents : copyAgentDefinitions();
  container.innerHTML = agents.map(({ code: agentCode, name: agentName }) => {
    const selectedId = covers[agentCode] || defaultCopyAgentCovers[agentCode];
    const cover = options.find((item) => item.id === selectedId) || defaultCopyCoverOptions[0];
    const layout = layouts[agentCode] || {};
    const focusX = Number.isFinite(Number(layout.focus_x)) ? Number(layout.focus_x) : 50;
    const focusY = Number.isFinite(Number(layout.focus_y)) ? Number(layout.focus_y) : 50;
    const zoom = Number.isFinite(Number(layout.zoom)) ? Number(layout.zoom) : 100;
    return `<article class="agent-cover-config-item">
      <div class="agent-cover-config-preview"><img data-agent-cover-preview="${agentCode}" src="${escapeHtml(cover.file)}" alt="${escapeHtml(agentName)}当前封面" style="--cover-focus:${focusX}% ${focusY}%;--cover-zoom:${zoom / 100}" /></div>
      <div><strong>${escapeHtml(agentName)}</strong><small>此处预览与前台卡片一致，按横版 16:9 取景。</small></div>
      <label>选择封面<select data-agent-cover-select="${agentCode}">${options.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === selectedId ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select></label>
      <div class="agent-cover-layout-controls"><label>横向位置 <input data-agent-cover-focus-x="${agentCode}" type="range" min="0" max="100" value="${focusX}" /><output data-agent-cover-focus-x-value="${agentCode}">${focusX}%</output></label><label>纵向位置 <input data-agent-cover-focus-y="${agentCode}" type="range" min="0" max="100" value="${focusY}" /><output data-agent-cover-focus-y-value="${agentCode}">${focusY}%</output></label><label>图片大小 <input data-agent-cover-zoom="${agentCode}" type="range" min="100" max="200" value="${zoom}" /><output data-agent-cover-zoom-value="${agentCode}">${zoom}%</output></label></div>
      <button type="button" class="secondary mini" data-agent-cover-save="${agentCode}">保存</button>
    </article>`;
  }).join('');
  const updatePreview = (agentCode) => {
    const selector = container.querySelector(`[data-agent-cover-select="${agentCode}"]`);
    const focusX = container.querySelector(`[data-agent-cover-focus-x="${agentCode}"]`)?.value || 50;
    const focusY = container.querySelector(`[data-agent-cover-focus-y="${agentCode}"]`)?.value || 50;
    const zoom = container.querySelector(`[data-agent-cover-zoom="${agentCode}"]`)?.value || 100;
    const option = options.find((item) => item.id === selector?.value) || defaultCopyCoverOptions[0];
    const image = container.querySelector(`[data-agent-cover-preview="${agentCode}"]`);
    if (!image) return;
    image.src = option.file;
    image.style.setProperty('--cover-focus', `${focusX}% ${focusY}%`);
    image.style.setProperty('--cover-zoom', String(Number(zoom) / 100));
    image.style.objectPosition = `${focusX}% ${focusY}%`;
    image.style.transformOrigin = `${focusX}% ${focusY}%`;
    container.querySelector(`[data-agent-cover-focus-x-value="${agentCode}"]`).textContent = `${focusX}%`;
    container.querySelector(`[data-agent-cover-focus-y-value="${agentCode}"]`).textContent = `${focusY}%`;
    container.querySelector(`[data-agent-cover-zoom-value="${agentCode}"]`).textContent = `${zoom}%`;
  };
  container.querySelectorAll('[data-agent-cover-select], [data-agent-cover-focus-x], [data-agent-cover-focus-y], [data-agent-cover-zoom]').forEach((input) => {
    input.addEventListener('input', () => {
      const agentCode = input.dataset.agentCoverSelect || input.dataset.agentCoverFocusX || input.dataset.agentCoverFocusY || input.dataset.agentCoverZoom;
      updatePreview(agentCode);
    });
  });
  agents.forEach((agent) => updatePreview(agent.code));
  container.querySelectorAll('[data-agent-cover-save]').forEach((button) => {
    button.addEventListener('click', async () => {
      const agentCode = button.dataset.agentCoverSave;
      const selector = container.querySelector(`[data-agent-cover-select="${agentCode}"]`);
      const focusX = container.querySelector(`[data-agent-cover-focus-x="${agentCode}"]`)?.value;
      const focusY = container.querySelector(`[data-agent-cover-focus-y="${agentCode}"]`)?.value;
      const zoom = container.querySelector(`[data-agent-cover-zoom="${agentCode}"]`)?.value;
      try {
        await patchAdmin('/api/admin/copywriting/config', { agent_code: agentCode, cover_id: selector?.value, layout: { focus_x: focusX, focus_y: focusY, zoom } });
        await loadCopywritingConfig();
      } catch (error) {
        alert(error.message);
      }
    });
  });
  bindCopywritingCoverUpload();
}

function renderCopywritingPromptConfig() {
  const container = $('copywritingPromptConfig');
  if (!container) return;
  const prompts = (state.adminConfig.prompts || []).filter((item) => item.feature_code === 'copywriting_generate');
  const agentCodes = (state.adminConfig.copywriting?.agents || copyAgentDefinitions()).map((item) => item.code);
  if (!agentCodes.includes(state.selectedCopywritingPromptAgent)) state.selectedCopywritingPromptAgent = agentCodes[0];
  const agentCode = state.selectedCopywritingPromptAgent;
  const prompt = prompts.find((item) => item.agent_code === agentCode);
  if (!prompt) {
    container.innerHTML = '<div class="empty-box">当前没有可编辑的文案智能体 Prompt。</div>';
    return;
  }
  container.innerHTML = `<div class="copywriting-prompt-form">
    <label>配置智能体<select id="copywritingPromptAgentSelect">${agentCodes.map((code) => `<option value="${code}" ${code === agentCode ? 'selected' : ''}>${escapeHtml(copyAgentNames[code])}</option>`).join('')}</select></label>
    <label>Prompt 名称<input id="copywritingPromptName" value="${escapeHtml(prompt.name || '')}" /></label>
    <label>版本<input id="copywritingPromptVersion" value="${escapeHtml(prompt.version || 'v1')}" /></label>
    <label class="copywriting-prompt-content">Prompt 内容<textarea id="copywritingPromptContent" rows="14">${escapeHtml(prompt.content || '')}</textarea></label>
    <button class="primary" id="saveCopywritingPrompt">保存 ${escapeHtml(copyAgentNames[agentCode])} Prompt</button>
  </div>`;
  $('copywritingPromptAgentSelect').addEventListener('change', (event) => {
    state.selectedCopywritingPromptAgent = event.target.value;
    renderCopywritingPromptConfig();
  });
  $('saveCopywritingPrompt').addEventListener('click', async () => {
    try {
      await patchAdmin(`/api/admin/prompts/${prompt.id}`, {
        name: value('copywritingPromptName'),
        feature_code: 'copywriting_generate',
        agent_code: agentCode,
        version: value('copywritingPromptVersion') || 'v1',
        content: value('copywritingPromptContent')
      });
    } catch (error) {
      alert(error.message);
    }
  });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`无法读取 ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function bindCopywritingCoverUpload() {
  const input = $('copywritingCoverFiles');
  const selectButton = $('selectCopywritingCovers');
  const uploadButton = $('uploadCopywritingCovers');
  const status = $('copywritingCoverUploadStatus');
  if (!input || input.dataset.bound) return;
  input.dataset.bound = 'true';
  selectButton.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    const files = [...input.files];
    const invalid = files.find((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024);
    uploadButton.disabled = !files.length || Boolean(invalid);
    status.textContent = invalid ? '仅支持 JPG、PNG、WebP，且单张不超过 8MB。' : files.length ? `已选择 ${files.length} 张图片` : '尚未选择图片';
  });
  uploadButton.addEventListener('click', async () => {
    const files = [...input.files];
    if (!files.length) return;
    uploadButton.disabled = true;
    try {
      for (let index = 0; index < files.length; index += 1) {
        status.textContent = `正在上传 ${index + 1}/${files.length}`;
        await apiRequest('adminCopywritingCovers', { files: [{ data_url: await readImageFile(files[index]) }] });
      }
      input.value = '';
      status.textContent = `已上传 ${files.length} 张图片，可在下方选择并调整画面。`;
      await loadAdminConfig();
      await loadCopywritingConfig();
    } catch (error) {
      status.textContent = error.message || '上传失败，请重试。';
    } finally {
      uploadButton.disabled = !input.files.length;
    }
  });
}

function promptAgentName(item) {
  return item.feature_code === 'copywriting_generate' ? (copyAgentNames[item.agent_code] || '未指定智能体') : '';
}

function optionHtml(items, selectedId, labelKey = 'display_name') {
  return items.map((item) => `<option value="${item.id}" ${Number(selectedId) === item.id ? 'selected' : ''}>${escapeHtml(item[labelKey] || item.name)} · ${escapeHtml(item.model_code || item.feature_code || '')}</option>`).join('');
}

function formatTokenCount(value) {
  const amount = Number(value || 0);
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return String(amount);
}

function formatCny(value) {
  return `¥${Number(value || 0).toFixed(4)}`;
}

function renderUsageStatistics() {
  const usage = state.adminConfig.usage || {};
  const totals = usage.totals || {};
  const moduleMeta = {
    pipi_assistant_chat: { name: '皮皮分身', color: '#bf6a35' },
    topic_generate: { name: '选题生成', color: '#547a9c' },
    copywriting_generate: { name: '文案智能体', color: '#4f8b66' },
    competitor_finder: { name: '找竞品', color: '#b56a76' },
    competitor_transcript: { name: '找竞品', color: '#b56a76' },
    sales_simulation: { name: '销售模拟', color: '#9a6ea8' }
  };
  const modules = new Map();
  (usage.by_function || []).forEach((item) => {
    const meta = moduleMeta[item.feature_code] || { name: '其他模块', color: '#89948d' };
    const current = modules.get(meta.name) || { ...meta, calls: 0, success_calls: 0, failed_calls: 0, prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    ['calls', 'success_calls', 'failed_calls', 'prompt_tokens', 'completion_tokens', 'total_tokens'].forEach((key) => { current[key] += Number(item[key] || 0); });
    modules.set(meta.name, current);
  });
  const moduleItems = [...modules.values()].sort((left, right) => right.total_tokens - left.total_tokens || right.calls - left.calls);
  const moduleTokens = moduleItems.reduce((sum, item) => sum + item.total_tokens, 0);
  const callLogs = state.adminConfig.callLogs || [];
  const successRate = totals.calls ? Math.round((Number(totals.success_calls || 0) / Number(totals.calls || 1)) * 100) : 0;
  const averageLatency = callLogs.length ? Math.round(callLogs.reduce((sum, item) => sum + Number(item.latency_ms || 0), 0) / callLogs.length) : 0;
  const fallbackCalls = callLogs.filter((item) => item.provider_code === 'local').length;
  const recentFailures = callLogs.filter((item) => item.status === 'failed').slice(0, 3);
  const trendDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return { key, label: `${date.getMonth() + 1}/${date.getDate()}`, tokens: 0, calls: 0 };
  });
  callLogs.forEach((item) => {
    const day = trendDays.find((entry) => entry.key === String(item.created_at || '').slice(0, 10));
    if (!day) return;
    day.tokens += Number(item.total_tokens || 0);
    day.calls += 1;
  });
  const trendPeak = Math.max(...trendDays.map((item) => item.tokens), 1);
  const segments = moduleItems.reduce((result, item) => {
    const start = result.cursor;
    const end = start + (moduleTokens ? (item.total_tokens / moduleTokens) * 360 : 0);
    result.parts.push(`${item.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`);
    result.cursor = end;
    return result;
  }, { cursor: 0, parts: [] });
  const periodLabel = usageDateLabel();
  if ($('usageDatePreset')) {
    $('usageDatePreset').value = state.usageDateFilter.preset;
    $('usageDateStart').value = state.usageDateFilter.startDate;
    $('usageDateEnd').value = state.usageDateFilter.endDate;
    $('usageDateRangeLabel').textContent = `${periodLabel}数据`;
  }
  const summary = [
    [`${periodLabel}已用金额`, formatCny(totals.estimated_cost_cny)],
    ['总调用', `${totals.calls || 0} 次`],
    ['成功率', `${successRate}%`],
    ['平均响应', averageLatency ? `${(averageLatency / 1000).toFixed(1)} 秒` : '-']
  ];
  $('usageTotalTokens').textContent = `${periodLabel} ¥${Number(totals.estimated_cost_cny || 0).toFixed(4)}`;
  $('usageSummary').innerHTML = summary.map(([label, amount]) => `<div><span>${label}</span><strong>${amount}</strong></div>`).join('');
  const providerUsage = state.adminConfig.providerUsage || { items: [] };
  const providerStatusLabel = { healthy: '账户可用', metered: '已接入计量', rate_limited: '账户接口限流', unavailable: '暂不可读取', missing_key: '未配置密钥', billing_credentials_missing: '待接账单权限', billing_unavailable: '账单暂不可读取' };
  $('providerUsageRefreshTime').textContent = providerUsage.refreshed_at ? `更新于 ${new Date(providerUsage.refreshed_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '等待同步';
  $('providerUsageCards').innerHTML = providerUsage.items?.length ? providerUsage.items.map((provider) => {
    const meter = provider.meter || {};
    const account = provider.account || {};
    const success = meter.calls ? Math.round((Number(meter.success_calls || 0) / Number(meter.calls)) * 100) : 0;
    const accountDetail = provider.code === 'tikhub'
      ? `<div class="provider-account-detail"><span>账户余额 ${escapeHtml(String(account.balance ?? account.quota ?? '暂未返回'))}</span>${account.plan ? `<span>${escapeHtml(account.plan)}</span>` : ''}</div>`
      : provider.code === 'volcengine_ark_plan'
      ? (account.balance_display
        ? `<div class="provider-account-detail"><span>账户余额 ${escapeHtml(account.balance_display)}</span><span>同步于 ${new Date(account.updated_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span></div>`
        : `<div class="provider-account-detail"><span>${escapeHtml(account.setup_hint || '等待火山账单余额同步')}</span></div>`)
      : '<div class="provider-account-detail"><span>费用账单以供应商控制台为准</span></div>';
    const metrics = provider.code === 'tikhub'
      ? ''
      : provider.code === 'siliconflow'
        ? `<div class="provider-usage-metrics"><div><span>${periodLabel}已用金额</span><b>${formatCny(meter.estimated_cost_cny)}</b></div><div><span>调用成功率</span><b>${meter.calls ? `${success}%` : '-'}</b></div><div><span>失败 / 降级</span><b>${meter.failed_calls || 0} 次</b></div></div>`
        : `<div class="provider-usage-metrics"><div><span>实测 Token</span><b>${formatTokenCount(meter.total_tokens)}</b></div><div><span>调用成功率</span><b>${meter.calls ? `${success}%` : '-'}</b></div><div><span>失败 / 降级</span><b>${meter.failed_calls || 0} 次</b></div></div>`;
    return `<article class="provider-usage-card"><div class="provider-usage-head"><div><strong>${escapeHtml(provider.name)}</strong><small>${escapeHtml(provider.billing_source || '')}</small></div><span class="${escapeHtml(account.status || provider.health_status || 'metered')}">${escapeHtml(providerStatusLabel[account.status] || account.label || '已接入')}</span></div>${metrics}${accountDetail}</article>`;
  }).join('') : '<div class="usage-empty-visual">尚未取得供应商计量数据。</div>';
  const chartMarkup = moduleTokens ? `<section class="usage-donut-panel"><div class="usage-donut" style="background:conic-gradient(${segments.parts.join(',')})"><div><strong>${formatTokenCount(moduleTokens)}</strong><span>Token</span></div></div><div class="usage-legend">${moduleItems.map((item) => `<div><i style="background:${item.color}"></i><span>${item.name}</span><b>${Math.round((item.total_tokens / moduleTokens) * 100)}%</b></div>`).join('')}</div></section><section class="usage-tree-panel"><div class="usage-tree-head"><div><h4>模块消耗分布</h4><p>面积代表各模块的 Token 消耗。</p></div><span>${moduleItems.length} 个模块</span></div><div class="usage-tree">${moduleItems.map((item) => `<article style="--module-color:${item.color};--module-weight:${Math.max(item.total_tokens, 1)}"><span>${item.name}</span><strong>${formatTokenCount(item.total_tokens)} Token</strong><small>${item.calls} 次调用 · 成功 ${item.success_calls}</small></article>`).join('')}</div></section>` : '<section class="usage-empty-visual">完成一次真实模型调用后，这里会按业务模块展示用量占比与消耗分布。</section>';
  $('usageVisualizations').innerHTML = `${chartMarkup}<section class="usage-trend-panel"><div class="usage-tree-head"><div><h4>近 7 日调用趋势</h4><p>柱高代表每天的 Token 消耗。</p></div><span>${fallbackCalls ? `${fallbackCalls} 次已降级` : '无降级'}</span></div><div class="usage-trend">${trendDays.map((item) => `<div><b style="height:${item.tokens ? Math.max(12, Math.round((item.tokens / trendPeak) * 100)) : 4}%" title="${item.label} · ${formatTokenCount(item.tokens)} Token"></b><strong>${item.label}</strong><small>${item.calls} 次</small></div>`).join('')}</div></section><section class="usage-health-panel"><div class="usage-tree-head"><div><h4>运行状态</h4><p>优先关注失败、降级与模型响应变慢。</p></div><span class="${recentFailures.length ? 'attention' : 'healthy'}">${recentFailures.length ? '需要关注' : '运行正常'}</span></div><div class="usage-health-metrics"><div><span>失败调用</span><strong>${totals.failed_calls || 0}</strong></div><div><span>本地降级</span><strong>${fallbackCalls}</strong></div><div><span>输入 / 输出</span><strong>${formatTokenCount(totals.prompt_tokens)} / ${formatTokenCount(totals.completion_tokens)}</strong></div></div>${recentFailures.length ? `<div class="usage-alert-list">${recentFailures.map((item) => `<p><b>${escapeHtml(moduleMeta[item.feature_code]?.name || item.feature_code || '未知模块')}</b><span>${escapeHtml(item.error_message || '调用失败').slice(0, 80)}</span></p>`).join('')}</div>` : '<div class="usage-ok-note">最近调用没有失败记录。</div>'}</section>`;
  const renderRows = (items, primary, secondary) => items.length
    ? items.map((item) => `<div class="usage-row"><div><strong>${escapeHtml(primary(item))}</strong><small>${escapeHtml(secondary(item))}</small></div><b>${formatTokenCount(item.total_tokens)} Token</b></div>`).join('')
    : '<div class="usage-row"><div><strong>暂无用量</strong><small>完成一次真实模型调用后会显示在这里。</small></div></div>';
  $('usageByFunction').innerHTML = renderRows(moduleItems,
    (item) => item.name,
    (item) => `${item.calls} 次调用 · 成功 ${item.success_calls} · 失败 ${item.failed_calls} · 输入 ${formatTokenCount(item.prompt_tokens)} / 输出 ${formatTokenCount(item.completion_tokens)}`);
  $('usageByModel').innerHTML = renderRows(usage.by_model || [],
    (item) => item.model_code,
    (item) => `${item.provider_code} · ${item.calls} 次调用 · 成功 ${item.success_calls} · 失败 ${item.failed_calls}`);
}

function renderAdminConfig() {
  const [title, desc] = adminModuleMeta[state.adminModule] || adminModuleMeta.overview;
  $('adminModuleTitle').textContent = title;
  $('adminModuleDesc').textContent = desc;
  document.querySelectorAll('[data-admin-module]').forEach((button) => button.classList.toggle('active', button.dataset.adminModule === state.adminModule));
  document.querySelectorAll('.admin-module').forEach((module) => module.classList.toggle('hidden', module.id !== `adminModule-${state.adminModule}`));
  document.querySelectorAll('[data-model-management-tab]').forEach((button) => button.classList.toggle('active', button.dataset.modelManagementTab === state.modelManagementTab));
  document.querySelectorAll('[data-model-management-view]').forEach((view) => view.classList.toggle('hidden', view.dataset.modelManagementView !== state.modelManagementTab));
  renderAdminOverview();
  renderAdminUsers();
  renderPipiAssistantConfig();
  renderSalesSimulationConfig();
  renderCoachToolboxConfig();
  renderSalesReports();
  renderCopyAgentManager();
  renderCopywritingCoverConfig();
  renderCopywritingPromptConfig();
  renderUsageStatistics();
  $('providerList').innerHTML = state.adminConfig.providers.map((item) => `
    <div class="config-row">
      <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.code)} · ${escapeHtml(item.capability || 'llm')} · 密钥${item.key_status === 'configured' ? '已配置' : '缺失'} · ${item.health_status === 'healthy' ? '已验证可用' : item.health_status === 'unhealthy' ? '最近调用失败' : '待验证'}</small>${item.last_error ? `<p>${escapeHtml(item.last_error)}</p>` : ''}</div>
      <button class="pill-button ${item.status === 'active' ? 'on' : ''}" data-provider-toggle="${item.id}" data-next-status="${item.status === 'active' ? 'disabled' : 'active'}">${item.status === 'active' ? '启用中' : '已禁用'}</button>
    </div>`).join('');
  $('modelList').innerHTML = state.adminConfig.models.map((item) => `
    <div class="config-row">
      <div><strong>${escapeHtml(item.display_name)}</strong><small>${escapeHtml(providerName(item.provider_code))} · ${escapeHtml(item.model_code)} · ${escapeHtml(item.role)}</small>${item.provider_code === 'siliconflow' ? `<div class="model-price-editor"><label>输入 ¥ / 百万 Token<input data-model-input-price="${item.id}" type="number" min="0" step="0.0001" value="${Number(item.input_price_cny_per_million || 0)}" /></label><label>输出 ¥ / 百万 Token<input data-model-output-price="${item.id}" type="number" min="0" step="0.0001" value="${Number(item.output_price_cny_per_million || 0)}" /></label><button class="secondary mini" data-model-price-save="${item.id}">保存单价</button></div>` : ''}</div>
      <button class="pill-button ${item.status === 'active' ? 'on' : ''}" data-model-toggle="${item.id}" data-next-status="${item.status === 'active' ? 'disabled' : 'active'}">${item.status === 'active' ? '启用中' : '已禁用'}</button>
    </div>`).join('');
  const generalPrompts = state.adminConfig.prompts.filter((item) => !['copywriting_generate', 'coach_toolbox'].includes(item.feature_code));
  if (!generalPrompts.some((item) => item.id === state.selectedPromptId)) state.selectedPromptId = generalPrompts[0]?.id || null;
  $('promptList').innerHTML = generalPrompts.map((item) => `
    <div class="config-row prompt-row">
      <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.feature_code)} ${promptAgentName(item) ? `· ${escapeHtml(promptAgentName(item))}` : ''} · ${escapeHtml(item.version)} · ${escapeHtml(item.status)}</small><p>${item.content ? escapeHtml(item.content).slice(0, 80) : 'Prompt 待补充，当前使用通用生成规则。'}</p></div>
      <div class="row-actions"><button class="secondary mini" data-prompt-open="${item.id}">打开</button><button class="pill-button ${item.status === 'active' ? 'on' : ''}" data-prompt-toggle="${item.id}" data-next-status="${item.status === 'active' ? 'disabled' : 'active'}">${item.status === 'active' ? '启用中' : '已禁用'}</button></div>
    </div>`).join('');
  renderPromptEditor();
  $('callLogList').innerHTML = state.adminConfig.callLogs.length ? state.adminConfig.callLogs.slice(0, 20).map((item) => `
    <article class="record-item"><strong>${escapeHtml(item.feature_code)} · ${escapeHtml(item.status)}</strong><div class="meta"><span>${escapeHtml(item.user_name || '系统')}</span><span>${escapeHtml(item.provider_code || '')}</span><span>${escapeHtml(item.model_code || '')}</span><span>输入 ${item.prompt_tokens || 0} / 输出 ${item.completion_tokens || 0} / 总计 ${item.total_tokens || 0} Token</span><span>${item.latency_ms || 0}ms</span></div></article>`).join('') : '<div class="record-item"><strong>暂无调用日志</strong><div class="meta"><span>生成一次真实模型调用后会显示 Token 用量。</span></div></div>';
  $('adminApiMode').textContent = state.apiMode === 'api' ? 'SiliconFlow + Ark Plan / TikHub' : '本地 Mock';
  $('adminCallCount').textContent = `${state.adminConfig.callLogs.length || state.records.length} 次`;
}

function roleLabel(role) {
  return role === 'admin' ? '管理员' : role === 'coaching' ? '陪跑学员' : '训练营学员';
}

function statusLabel(status) {
  return status === 'active' ? '启用中' : status === 'expired' ? '已到期' : '已禁用';
}

function renderAdminUsers() {
  const users = state.adminConfig.users || [];
  const count = (role) => users.filter((item) => item.role === role).length;
  $('adminUserTotal').textContent = `${users.length} 个账号`;
  $('userStats').innerHTML = [
    ['管理员', count('admin')],
    ['陪跑学员', count('coaching')],
    ['训练营学员', count('training')]
  ].map(([label, number]) => `<div class="user-stat"><span>${label}</span><strong>${number}</strong></div>`).join('');
  $('userList').innerHTML = users.length ? users.map((item) => `
    <div class="user-row">
      <div class="user-main"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.phone || item.account)} · ${escapeHtml(item.paid_product || '未填写产品')}</small></div>
      ${item.role === 'admin' ? `<span class="role-tag admin">管理员</span>` : `<select class="user-role-select" data-user-role="${item.id}"><option value="coaching" ${item.role === 'coaching' ? 'selected' : ''}>陪跑学员</option><option value="training" ${item.role === 'training' ? 'selected' : ''}>训练营学员</option></select>`}
      <span class="status-tag ${item.status}">${statusLabel(item.status)}</span>
      <div class="user-meta"><small>开通 ${escapeHtml(item.opened_at || '-')}</small><label>到期 <input type="date" value="${escapeHtml(item.expires_at || '')}" data-user-expires="${item.id}" /></label></div>
      ${item.role === 'admin' ? '<span class="user-lock">系统账号</span>' : `<div class="row-actions"><button class="secondary mini" data-user-save="${item.id}">保存</button><button class="pill-button ${item.status === 'active' ? 'on' : ''}" data-user-toggle="${item.id}" data-next-status="${item.status === 'active' ? 'disabled' : 'active'}">${item.status === 'active' ? '禁用账号' : '启用账号'}</button></div>`}
    </div>`).join('') : '<div class="empty-box">暂无已开通账号</div>';
}

function renderPipiAssistantConfig() {
  const config = state.adminConfig.pipiAssistant;
  if (!config || !Object.keys(config).length) {
    $('pipiAssistantConfigForm').innerHTML = '<div class="empty-box">正在加载皮皮分身配置。</div>';
    return;
  }
  $('pipiAssistantConfigForm').innerHTML = `
    <div class="assistant-config-grid">
      <label>显示名称<input id="editPipiDisplayName" value="${escapeHtml(config.display_name || '')}" /></label>
      <label>表情包模式<select id="editPipiStickerMode"><option value="auto" ${config.response_sticker_mode === 'auto' ? 'selected' : ''}>根据回复自动选择</option><option value="always" ${config.response_sticker_mode === 'always' ? 'selected' : ''}>每次回复都展示</option><option value="never" ${config.response_sticker_mode === 'never' ? 'selected' : ''}>关闭回复表情包</option></select></label>
    </div>
    <label class="check-label"><input id="editPipiEnabled" type="checkbox" ${config.enabled !== false ? 'checked' : ''} /> 启用皮皮分身功能</label>
    <label>欢迎语<textarea id="editPipiWelcome" rows="3">${escapeHtml(config.welcome_message || '')}</textarea></label>
    <label>回复语气<textarea id="editPipiStyle" rows="4">${escapeHtml(config.response_style || '')}</textarea></label>
    <label>回复规则<textarea id="editPipiRules" rows="4">${escapeHtml(config.response_rules || '')}</textarea></label>
    <section class="locked-config"><div><strong>知识库范围</strong><small>平台固定安全边界，不支持修改。</small></div><p>${escapeHtml(config.knowledge_scope || '')}</p></section>
    <label class="check-label"><input id="editPipiStickersEnabled" type="checkbox" ${config.stickers_enabled ? 'checked' : ''} /> 启用互动表情包和思考中表情包</label>
    <button class="primary" id="savePipiAssistantConfig">保存皮皮分身配置</button>
    <section class="pipi-knowledge-manager">
      <div class="pipi-knowledge-head"><div><h4>皮皮分身知识库</h4><p>把筛选后的 skill、业务方法和中台使用指南放在这里。只有启用的条目会进入皮皮的回答上下文。</p></div><span>${state.adminConfig.pipiKnowledge.length} 条</span></div>
      <div id="pipiKnowledgeList" class="pipi-knowledge-list">${renderPipiKnowledgeList()}</div>
      <div class="pipi-knowledge-form">
        <input id="newPipiKnowledgeTitle" placeholder="知识标题，例如：训练营中台使用指南" />
        <input id="newPipiKnowledgeCategory" placeholder="分类，例如：产品使用 / 教育业务 / 内容方法" />
        <textarea id="newPipiKnowledgeContent" rows="8" placeholder="粘贴整理后的知识内容或 skill 片段。建议按主题拆分，不要一次粘贴无关内容。"></textarea>
        <button class="secondary" id="addPipiKnowledge">新增知识库条目</button>
      </div>
    </section>`;
  $('savePipiAssistantConfig').addEventListener('click', savePipiAssistantConfig);
  $('addPipiKnowledge').addEventListener('click', addPipiKnowledge);
  document.querySelectorAll('[data-pipi-knowledge-toggle]').forEach((button) => {
    button.addEventListener('click', () => patchAdmin(`/api/admin/pipi-assistant/knowledge/${button.dataset.pipiKnowledgeToggle}`, { status: button.dataset.nextStatus }));
  });
  document.querySelectorAll('[data-pipi-knowledge-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      if (confirm('确定删除这条皮皮分身知识吗？删除后无法恢复。')) deleteAdmin(`/api/admin/pipi-assistant/knowledge/${button.dataset.pipiKnowledgeDelete}`).catch((error) => alert(error.message));
    });
  });
}

function renderPipiKnowledgeList() {
  const items = state.adminConfig.pipiKnowledge || [];
  if (!items.length) return '<div class="empty-box">暂无知识库条目。你可以先放入整理后的 skill 或中台使用指南。</div>';
  return items.map((item) => `
    <article class="pipi-knowledge-item">
      <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category || '未分类')} · ${item.status === 'active' ? '启用中' : '已停用'}</small><p>${escapeHtml(item.content).slice(0, 180)}${item.content.length > 180 ? '…' : ''}</p></div>
      <div class="row-actions"><button class="pill-button ${item.status === 'active' ? 'on' : ''}" data-pipi-knowledge-toggle="${item.id}" data-next-status="${item.status === 'active' ? 'disabled' : 'active'}">${item.status === 'active' ? '启用中' : '已停用'}</button><button class="secondary mini" data-pipi-knowledge-delete="${item.id}">删除</button></div>
    </article>`).join('');
}

async function addPipiKnowledge() {
  const title = value('newPipiKnowledgeTitle');
  const category = value('newPipiKnowledgeCategory') || '未分类';
  const content = value('newPipiKnowledgeContent');
  if (!title || !content) {
    alert('请填写知识标题和内容');
    return;
  }
  try {
    await postAdmin('adminPipiKnowledge', { title, category, content, status: 'active' });
  } catch (error) {
    alert(error.message);
  }
}

async function savePipiAssistantConfig() {
  try {
    const config = await patchAdmin('/api/admin/pipi-assistant/config', {
      enabled: $('editPipiEnabled').checked,
      display_name: value('editPipiDisplayName'),
      welcome_message: value('editPipiWelcome'),
      response_style: value('editPipiStyle'),
      response_rules: value('editPipiRules'),
      stickers_enabled: $('editPipiStickersEnabled').checked,
      response_sticker_mode: value('editPipiStickerMode')
    });
    state.pipiConfig = { ...state.pipiConfig, ...config };
    state.pipiWelcomeNeedsRefresh = true;
    applyPipiPresentation();
    if (state.page === 'pipi' && state.pipiUserTurns === 0) {
      resetPipi();
      state.pipiWelcomeNeedsRefresh = false;
    }
    await loadToolAvailability();
  } catch (error) {
    alert(error.message);
  }
}

function renderSalesSimulationConfig() {
  const container = $('salesSimulationConfigForm');
  if (!container) return;
  const config = state.adminConfig.salesSimulation || {};
  const feature = state.adminConfig.features.find((item) => item.feature_code === 'sales_simulation') || config.feature || {};
  const models = state.adminConfig.models.filter((item) => item.status === 'active');
  const prompts = state.adminConfig.prompts.filter((item) => item.feature_code === 'sales_simulation' && item.status === 'active');
  const fallbackIds = feature.fallback_model_ids || [];
  container.innerHTML = `
    <div class="assistant-config-grid">
      <label>主模型<select id="editSalesPrimaryModel">${optionHtml(models, feature.primary_model_id)}</select></label>
      <label>六步法 Prompt<select id="editSalesPrompt">${prompts.map((item) => `<option value="${item.id}" ${Number(feature.prompt_template_id) === item.id ? 'selected' : ''}>${escapeHtml(item.name)} · ${escapeHtml(item.version)}</option>`).join('')}</select></label>
    </div>
    <label>备用模型<select id="editSalesFallbackModels" multiple size="3">${models.map((item) => `<option value="${item.id}" ${fallbackIds.includes(item.id) ? 'selected' : ''}>${escapeHtml(item.display_name || item.name)} · ${escapeHtml(item.model_code || '')}</option>`).join('')}</select></label>
    <label>家长扮演规则<textarea id="editSalesRoleplayRule" rows="4">${escapeHtml(config.roleplay_rule || '')}</textarea></label>
    <label>六步法复盘规则<textarea id="editSalesReviewRule" rows="4">${escapeHtml(config.review_rule || '')}</textarea></label>
    <label>知识库使用边界<textarea id="editSalesKnowledgeScope" rows="3">${escapeHtml(config.knowledge_scope || '')}</textarea></label>
    <label class="check-label"><input id="editSalesEnabled" type="checkbox" ${config.enabled !== false ? 'checked' : ''} /> 启用销售模拟功能</label>
    <button class="primary" id="saveSalesSimulationConfig">保存销售模拟配置</button>
    <section class="sales-method-admin-manager">
      <div class="pipi-knowledge-head"><div><h4>六步法内容管理</h4><p>六个四字步骤名称保持固定，可以分别调整话术库名称、前台说明、AI 生成规则和通用话术。</p></div><span>${(config.steps || []).length} 步</span></div>
      <div class="sales-method-admin-list">${(config.steps || []).map((item) => `
        <article class="sales-method-admin-item">
          <header><span>${escapeHtml(item.number)}</span><div><strong>${escapeHtml(item.title)}</strong><small>步骤名称已锁定</small></div><button type="button" class="secondary mini" data-sales-step-save="${item.code}">保存本步</button></header>
          <div class="assistant-config-grid"><label>话术库名称<input id="adminSalesLibrary-${item.code}" value="${escapeHtml(item.library)}" /></label><label>前台短说明<input id="adminSalesShort-${item.code}" value="${escapeHtml(item.short_desc)}" /></label></div>
          <label>训练说明<textarea id="adminSalesDesc-${item.code}" rows="3">${escapeHtml(item.description)}</textarea></label>
          <label>AI 生成规则<textarea id="adminSalesPrompt-${item.code}" rows="3">${escapeHtml(item.prompt_rule)}</textarea></label>
          <label>通用话术（每行一条）<textarea id="adminSalesItems-${item.code}" rows="6">${escapeHtml((item.items || []).join('\n'))}</textarea></label>
        </article>`).join('')}</div>
    </section>
    <section class="pipi-knowledge-manager">
      <div class="pipi-knowledge-head"><div><h4>销售模拟知识库</h4><p>放入销售成交方法论、六步法细则、家长语料和已脱敏复盘案例。只有启用条目会进入模拟与复盘上下文。</p></div><span>${state.adminConfig.salesKnowledge.length} 条</span></div>
      <div class="pipi-knowledge-list">${renderSalesKnowledgeList()}</div>
      <div class="pipi-knowledge-form">
        <input id="newSalesKnowledgeTitle" placeholder="知识标题，例如：六步法详细说明" />
        <input id="newSalesKnowledgeCategory" placeholder="分类，例如：成交方法 / 家长语料 / 复盘案例" />
        <textarea id="newSalesKnowledgeContent" rows="8" placeholder="粘贴经脱敏和筛选的销售知识或 skill 片段。"></textarea>
        <button class="secondary" id="addSalesKnowledge">新增销售知识条目</button>
      </div>
    </section>`;
  $('saveSalesSimulationConfig').addEventListener('click', saveSalesSimulationConfig);
  $('addSalesKnowledge').addEventListener('click', addSalesKnowledge);
  document.querySelectorAll('[data-sales-step-save]').forEach((button) => {
    button.addEventListener('click', () => saveAdminSalesMethodStep(button.dataset.salesStepSave));
  });
  document.querySelectorAll('[data-sales-knowledge-toggle]').forEach((button) => {
    button.addEventListener('click', () => patchAdmin(`/api/admin/sales-simulation/knowledge/${button.dataset.salesKnowledgeToggle}`, { status: button.dataset.nextStatus }));
  });
  document.querySelectorAll('[data-sales-knowledge-delete]').forEach((button) => {
    button.addEventListener('click', () => {
      if (confirm('确定删除这条销售知识吗？删除后无法恢复。')) deleteAdmin(`/api/admin/sales-simulation/knowledge/${button.dataset.salesKnowledgeDelete}`).catch((error) => alert(error.message));
    });
  });
}

function renderCoachToolboxConfig() {
  const container = $('coachToolboxConfigForm');
  if (!container) return;
  const config = state.adminConfig.coachToolbox || {};
  const feature = config.feature || state.adminConfig.features.find((item) => item.feature_code === 'coach_toolbox') || {};
  const prompt = config.prompt || state.adminConfig.prompts.find((item) => item.feature_code === 'coach_toolbox') || {};
  const momentsFeature = config.moments_feature || state.adminConfig.features.find((item) => item.feature_code === 'coach_moments') || {};
  const momentsPrompt = config.moments_prompt || state.adminConfig.prompts.find((item) => item.feature_code === 'coach_moments') || {};
  const models = state.adminConfig.models.filter((item) => item.status === 'active');
  const momentsSkillAttached = /name:\s*pipi-delivery-moments/.test(momentsPrompt.content || '');
  container.innerHTML = `
    <div class="assistant-config-grid"><label class="check-label"><input id="editCoachToolboxEnabled" type="checkbox" ${config.enabled !== false ? 'checked' : ''} /> 启用教练工具箱</label><label class="check-label"><input id="editCoachSopEnabled" type="checkbox" ${config.sop_enabled !== false ? 'checked' : ''} /> 启用工作流搭建</label><label class="check-label"><input id="editCoachMomentsEnabled" type="checkbox" ${config.moments_enabled !== false ? 'checked' : ''} /> 启用交付朋友圈</label></div>
    <div class="admin-form two-col"><label>工作流主模型<select id="editCoachPrimaryModel">${optionHtml(models, feature.primary_model_id)}</select></label><label>工作流 Prompt 版本<input id="editCoachPromptVersion" value="${escapeHtml(prompt.version || 'v1')}" /></label></div>
    <label>工作流搭建 Prompt<textarea id="editCoachWorkflowPrompt" rows="10">${escapeHtml(prompt.content || '')}</textarea></label>
    <label>导图生成规则<textarea id="editCoachSopPromptNote" rows="4">${escapeHtml(config.sop_prompt_note || '')}</textarea></label>
    <section class="moments-skill-status ${momentsSkillAttached ? 'is-ready' : 'is-missing'}">
      <div class="moments-skill-status-head"><div><span>${momentsSkillAttached ? '已接入 Skill' : '尚未接入 Skill'}</span><h4>皮皮交付朋友圈</h4><small>pipi-delivery-moments · ${escapeHtml(momentsPrompt.version || 'v1')}</small></div><b>${momentsSkillAttached ? '生效中' : '需检查'}</b></div>
      <p>用于把真实交付素材整理成可直接发布的朋友圈：保留过程，不夸大结果，并自动遵守隐私保护规则。</p>
      <div class="moments-skill-tags"><span>真实交付过程</span><span>卡点与调整</span><span>学员微小变化</span><span>隐私打码提醒</span><span>销售模拟先挖需</span></div>
      <details><summary>这个智能体会怎么写？</summary><p>默认按“具体场景 → 看见卡点 → 怎么带着做 → 真实变化 → 交付洞察”输出。普通版控制在 220–380 字；用户要求短版时保留核心过程，不只剩一句观点。</p></details>
    </section>
    <div class="admin-form two-col"><label>交付朋友圈主模型<select id="editCoachMomentsPrimaryModel">${optionHtml(models, momentsFeature.primary_model_id)}</select></label><label>交付朋友圈 Skill 版本<input id="editCoachMomentsPromptVersion" value="${escapeHtml(momentsPrompt.version || 'v1')}" /></label></div>
    <label class="moments-skill-prompt-label">当前 Skill 规则（可查看、可编辑）<textarea id="editCoachMomentsPrompt" rows="16">${escapeHtml(momentsPrompt.content || '')}</textarea><small>这里显示的就是“交付朋友圈”智能体实际使用的规则。修改后点击保存即可生效。</small></label>
    <label>工具箱使用说明<textarea id="editCoachGuideNote" rows="3">${escapeHtml(config.guide_note || '')}</textarea></label>
    <button class="primary" id="saveCoachToolboxConfig">保存教练工具箱配置</button>`;
  $('saveCoachToolboxConfig').addEventListener('click', saveCoachToolboxConfig);
}

async function saveCoachToolboxConfig() {
  const config = state.adminConfig.coachToolbox || {};
  const feature = config.feature || state.adminConfig.features.find((item) => item.feature_code === 'coach_toolbox') || {};
  const prompt = config.prompt || state.adminConfig.prompts.find((item) => item.feature_code === 'coach_toolbox') || {};
  const momentsFeature = config.moments_feature || state.adminConfig.features.find((item) => item.feature_code === 'coach_moments') || {};
  const momentsPrompt = config.moments_prompt || state.adminConfig.prompts.find((item) => item.feature_code === 'coach_moments') || {};
  const payload = {
    config: {
      enabled: $('editCoachToolboxEnabled').checked,
      sop_enabled: $('editCoachSopEnabled').checked,
      moments_enabled: $('editCoachMomentsEnabled').checked,
      sop_prompt_note: value('editCoachSopPromptNote'),
      guide_note: value('editCoachGuideNote')
    },
    workflowPrompt: { name: prompt.name || '教练工具箱 Prompt', feature_code: 'coach_toolbox', version: value('editCoachPromptVersion') || 'v1', content: value('editCoachWorkflowPrompt') },
    workflowModelId: Number(value('editCoachPrimaryModel')),
    momentsPrompt: { name: momentsPrompt.name || '交付朋友圈 Prompt', feature_code: 'coach_moments', version: value('editCoachMomentsPromptVersion') || 'v1', content: value('editCoachMomentsPrompt') },
    momentsModelId: Number(value('editCoachMomentsPrimaryModel'))
  };
  try {
    await patchAdmin('/api/admin/coach-toolbox/config', payload.config, { refresh: false, toast: false });
    if (prompt.id) await patchAdmin(`/api/admin/prompts/${prompt.id}`, payload.workflowPrompt, { refresh: false, toast: false });
    if (feature.feature_code) await patchAdmin('/api/admin/ai/features/coach_toolbox', { primary_model_id: payload.workflowModelId }, { refresh: false, toast: false });
    if (momentsPrompt.id) await patchAdmin(`/api/admin/prompts/${momentsPrompt.id}`, payload.momentsPrompt, { refresh: false, toast: false });
    if (momentsFeature.feature_code) await patchAdmin('/api/admin/ai/features/coach_moments', { primary_model_id: payload.momentsModelId }, { refresh: false, toast: false });
    await loadAdminConfig();
    await refreshActiveFrontendConfig();
    showToast('教练工具箱配置已保存');
  } catch (error) {
    alert(error.message);
  }
}

async function saveAdminSalesMethodStep(code) {
  try {
    await patchAdmin(`/api/admin/sales-simulation/steps/${code}`, {
      library: value(`adminSalesLibrary-${code}`),
      short_desc: value(`adminSalesShort-${code}`),
      description: value(`adminSalesDesc-${code}`),
      prompt_rule: value(`adminSalesPrompt-${code}`),
      items: value(`adminSalesItems-${code}`).split('\n').map((item) => item.trim()).filter(Boolean)
    });
    await loadSalesMethodConfig();
  } catch (error) {
    alert(error.message);
  }
}

function renderSalesKnowledgeList() {
  const items = state.adminConfig.salesKnowledge || [];
  if (!items.length) return '<div class="empty-box">暂无销售知识条目。后续可以把销售 skill、六步法细则和脱敏语料放在这里。</div>';
  return items.map((item) => `
    <article class="pipi-knowledge-item">
      <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.category || '销售方法论')} · ${item.status === 'active' ? '启用中' : '已停用'}</small><p>${escapeHtml(item.content).slice(0, 180)}${item.content.length > 180 ? '…' : ''}</p></div>
      <div class="row-actions"><button class="pill-button ${item.status === 'active' ? 'on' : ''}" data-sales-knowledge-toggle="${item.id}" data-next-status="${item.status === 'active' ? 'disabled' : 'active'}">${item.status === 'active' ? '启用中' : '已停用'}</button>${item.built_in ? '<span class="status-tag active">内置知识</span>' : `<button class="secondary mini" data-sales-knowledge-delete="${item.id}">删除</button>`}</div>
    </article>`).join('');
}

async function addSalesKnowledge() {
  const title = value('newSalesKnowledgeTitle');
  const content = value('newSalesKnowledgeContent');
  if (!title || !content) {
    alert('请填写销售知识标题和内容');
    return;
  }
  try {
    await postAdmin('adminSalesKnowledge', { title, category: value('newSalesKnowledgeCategory') || '销售方法论', content, status: 'active' });
  } catch (error) {
    alert(error.message);
  }
}

async function saveSalesSimulationConfig() {
  try {
    const enabled = $('editSalesEnabled').checked;
    const roleplayRule = value('editSalesRoleplayRule');
    const reviewRule = value('editSalesReviewRule');
    const knowledgeScope = value('editSalesKnowledgeScope');
    const primaryModelId = Number(value('editSalesPrimaryModel'));
    const promptTemplateId = Number(value('editSalesPrompt'));
    const fallbackIds = Array.from(document.querySelectorAll('#editSalesFallbackModels option:checked')).map((item) => Number(item.value));
    await patchAdmin('/api/admin/sales-simulation/config', {
      enabled,
      roleplay_rule: roleplayRule,
      review_rule: reviewRule,
      knowledge_scope: knowledgeScope
    }, { refresh: false, toast: false });
    await patchAdmin('/api/admin/ai/features/sales_simulation', {
      status: enabled ? 'active' : 'disabled',
      primary_model_id: primaryModelId,
      fallback_model_ids: fallbackIds.join(','),
      prompt_template_id: promptTemplateId
    }, { refresh: false, toast: false });
    await loadAdminConfig();
    await refreshActiveFrontendConfig();
    showToast('销售模拟配置已保存');
  } catch (error) {
    alert(error.message);
  }
}

function renderAdminOverview() {
  const activeProviders = state.adminConfig.providers.filter((item) => item.status === 'active').length;
  const activeModels = state.adminConfig.models.filter((item) => item.status === 'active').length;
  const activePrompts = state.adminConfig.prompts.filter((item) => item.status === 'active').length;
  const cards = [
    ['用户与权限', `${state.adminConfig.stats.active_user_total || state.adminConfig.users.length} 个账号启用`, 'users', '打开'],
    ['皮皮分身', `${state.adminConfig.pipiKnowledge.length} 条知识库内容`, 'pipi-assistant', '打开'],
    ['文案智能体', `${Object.keys(state.adminConfig.copywriting.covers || {}).length} 个封面已配置`, 'agent-covers', '打开'],
    ['教练工具箱', state.adminConfig.coachToolbox.enabled === false ? '当前已停用' : '工作流与交付朋友圈', 'coach-toolbox', '管理'],
    ['AI 配置', `${activeProviders} 个供应商 · ${activeModels} 个模型 · ${activePrompts} 个 Prompt`, 'model-management', '打开'],
    ['销售中心', `${state.adminConfig.salesKnowledge.length} 条销售知识 · ${state.adminConfig.salesReports.length} 份报告`, 'sales-simulation', '打开'],
    ['用量与日志', `${formatTokenCount(state.adminConfig.usage?.totals?.total_tokens)} Token · ${state.adminConfig.usage?.totals?.calls || 0} 次调用`, 'logs', '查看']
  ];
  $('adminModuleCards').innerHTML = cards.map((card) => `<button class="admin-card" data-admin-module="${card[2]}"><strong>${card[0]}</strong><span>${card[1]}</span><em>${card[3]}</em></button>`).join('');
}

function reportDate(value) {
  if (!value) return '刚刚生成';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('zh-CN');
}

function resolveSalesOutcome(outcome) {
  return salesConversationOutcomes[outcome?.code] || salesConversationOutcomes.normal;
}

function salesOutcomeLevel(score, outcome) {
  if (outcome.code === 'blocked') return '高风险';
  if (outcome.code === 'disengaged') return '沟通流失';
  if (score >= 80) return '成交进阶';
  if (score >= 65) return '稳定推进';
  return '待夯实';
}

function applySalesOutcomeToReport(report, outcomeInput) {
  const outcome = resolveSalesOutcome(outcomeInput);
  if (outcome.code === 'normal') return { ...report, level: salesOutcomeLevel(report.overall_score, outcome), conversation_outcome: outcome };
  const caps = outcome.code === 'blocked'
    ? { icebreak: 12, objection: 8, close: 5 }
    : { icebreak: 32, objection: 28, close: 22 };
  const feedback = outcome.code === 'blocked'
    ? {
      icebreak: '攻击性表达直接破坏沟通安全感，信任关系无法继续。',
      objection: '没有承接顾虑，而是以攻击性表达中断了沟通。',
      close: '对话被拉黑结束，不能形成有效推进。'
    }
    : {
      icebreak: '赶客表达让对方感到不被尊重，信任关系中断。',
      objection: '面对犹豫或比较时，没有先确认真实顾虑并提供回应。',
      close: '用“别报名了”一类表达结束沟通，失去后续推进机会。'
    };
  const dimensions = normalizeReportDimensions(report).map((dimension) => ({
    ...dimension,
    score: caps[dimension.code] === undefined ? dimension.score : Math.min(dimension.score, caps[dimension.code]),
    feedback: feedback[dimension.code] || dimension.feedback
  }));
  const overall = Math.round(dimensions.reduce((total, item) => total + item.score * item.weight / 100, 0));
  const gap = outcome.code === 'blocked'
    ? '沟通安全感已被破坏：任何成交动作都应建立在尊重和边界之上。'
    : '沟通流失：客户表达顾虑时，销售方用赶客语言切断了信任和继续了解的机会。';
  const nextDrill = outcome.code === 'blocked'
    ? {
      title: '专项练习：停止攻击性表达',
      action: '任何不耐烦或冲突出现时，先暂停推进，用一句尊重且有边界的话结束当前沟通。',
      sample: '我理解您现在还需要比较，我们先不急着做决定。您方便时，我再根据孩子的情况补一份清楚的说明。'
    }
    : {
      title: '专项练习：把拒绝改成澄清',
      action: '听到比较、犹豫或价格顾虑时，不反击也不赶客，先确认对方真正担心的风险。',
      sample: '您愿意比较很正常。您现在最想确认的是课程是否适合孩子，还是投入后能不能看到变化？'
    };
  return {
    ...report,
    overall_score: overall,
    level: salesOutcomeLevel(overall, outcome),
    summary: `${outcome.detail}${report.summary ? ` ${report.summary}` : ''}`,
    dimensions,
    gaps: [gap, ...(report.gaps || [])].slice(0, 3),
    next_drill: nextDrill,
    conversation_outcome: outcome
  };
}

function normalizeReportDimensions(report) {
  const source = Array.isArray(report?.dimensions) ? report.dimensions : [];
  return salesScoreDimensions.map((dimension) => {
    const item = source.find((entry) => entry.code === dimension.code || entry.name === dimension.name) || {};
    return {
      ...dimension,
      score: Math.max(0, Math.min(100, Number(item.score) || 0)),
      feedback: item.feedback || '本轮对话中还没有足够的有效信号。',
      sub_scores: item.sub_scores || {}
    };
  });
}

function renderDiscoveryForces(item) {
  const forces = [
    ['need', '需求力', '是否问清现状、问题、目标和优先级'],
    ['payment', '付费力', '是否确认投入条件、价值感和风险顾虑'],
    ['decision', '决策力', '是否确认决策人、时间点和下一步条件']
  ];
  return `<div class="sales-discovery-forces"><div class="sales-discovery-forces-head"><strong>挖需能力拆解</strong><span>皮皮方法论</span></div><div class="sales-discovery-force-grid">${forces.map(([code, name, hint]) => {
    const score = Math.max(0, Math.min(100, Number(item.sub_scores?.[code]?.score ?? item.sub_scores?.[code]) || 0));
    const feedback = typeof item.sub_scores?.[code] === 'object' ? item.sub_scores[code].feedback : '';
    return `<article><div><strong>${name}</strong><b>${Math.round(score)}<small>/100</small></b></div><span class="sales-score-track"><i style="width:${score}%"></i></span><p>${escapeHtml(feedback || hint)}</p></article>`;
  }).join('')}</div></div>`;
}

function renderSalesReportMarkup(report, options = {}) {
  if (!report) return '<div class="empty-box">该报告暂未包含评分明细。</div>';
  const dimensions = normalizeReportDimensions(report);
  const overall = Math.max(0, Math.min(100, Math.round(Number(report.overall_score) || 0)));
  const outcome = resolveSalesOutcome(report.conversation_outcome);
  const strengths = Array.isArray(report.strengths) && report.strengths.length ? report.strengths : ['先保留本轮已经建立的有效沟通动作。'];
  const gaps = Array.isArray(report.gaps) && report.gaps.length ? report.gaps : ['下一轮围绕一个关键能力继续补足。'];
  const nextDrill = report.next_drill || {};
  return `<div class="sales-score-report ${options.compact ? 'compact' : ''}">
    <header class="sales-score-report-head">
      <div><span class="eyebrow">SALES SCORE REPORT</span><h3>${escapeHtml(report.level || '销售能力复盘')}</h3><p>${escapeHtml(report.summary || report.coach_summary || '已根据本轮真实对话生成复盘。')}</p></div>
      <div class="sales-score-total"><strong>${overall}</strong><span>/ 100</span></div>
    </header>
    ${outcome.code !== 'normal' ? `<div class="sales-report-outcome ${escapeHtml(outcome.severity)}"><span>对话结果</span><strong>${escapeHtml(outcome.label)}</strong><p>${escapeHtml(outcome.detail)}</p></div>` : ''}
    <div class="sales-score-dimensions">${dimensions.map((item) => `
      <article class="sales-score-dimension">
        <div class="sales-score-dimension-head"><strong>${escapeHtml(item.name)}</strong><b>${Math.round(item.score)}<small>/100</small></b></div>
        <span class="sales-score-track"><i style="width:${Math.max(0, Math.min(100, item.score))}%"></i></span>
        <p>${escapeHtml(item.feedback)}</p>${item.code === 'discovery' ? renderDiscoveryForces(item) : ''}
      </article>`).join('')}</div>
    <div class="sales-score-insights">
      <section><span>做得好的地方</span><ul>${strengths.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
      <section><span>优先补足</span><ul>${gaps.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>
    </div>
    <section class="sales-next-drill"><span>下一轮只练一个动作</span><strong>${escapeHtml(nextDrill.title || '先完成一次有效挖需')}</strong><p>${escapeHtml(nextDrill.action || '围绕孩子现状、过往尝试和家长最想先解决的问题，连续问清三个事实。')}</p>${nextDrill.sample ? `<blockquote>${escapeHtml(nextDrill.sample)}</blockquote>` : ''}</section>
  </div>`;
}

function renderSalesReports() {
  const container = $('salesReportAdminList');
  const count = $('adminSalesReportTotal');
  if (!container || !count) return;
  const reports = state.adminConfig.salesReports || [];
  count.textContent = `${reports.length} 份报告`;
  if (!reports.length) {
    container.innerHTML = '<div class="empty-box">还没有学员完成销售模拟。完成一轮对话并生成报告后，会在这里出现。</div>';
    return;
  }
  if (!reports.some((item) => String(item.id) === String(state.selectedSalesReportId))) state.selectedSalesReportId = reports[0].id;
  const selected = reports.find((item) => String(item.id) === String(state.selectedSalesReportId)) || reports[0];
  const report = selected.report || selected.meta?.sales_report || {};
  const session = selected.session || selected.meta?.sales_session || {};
  const profileName = session.profile_name || selected.title || '销售模拟';
  container.innerHTML = `<div class="sales-report-admin-layout">
    <div class="sales-report-admin-list">${reports.map((item) => {
      const itemReport = item.report || item.meta?.sales_report || {};
      const itemSession = item.session || item.meta?.sales_session || {};
      const itemOutcome = resolveSalesOutcome(itemReport.conversation_outcome);
      const active = String(item.id) === String(selected.id);
      return `<button type="button" class="sales-report-admin-item ${active ? 'active' : ''}" data-sales-report-open="${item.id}">
        <span>${escapeHtml(item.user_name || '学员')}</span><strong>${escapeHtml(itemSession.profile_name || item.title || '销售模拟')}</strong>
        <small>${Math.round(Number(itemReport.overall_score) || 0)} 分 · ${itemOutcome.code === 'normal' ? '正常结束' : escapeHtml(itemOutcome.label)} · ${escapeHtml(reportDate(item.created_at))}</small>
      </button>`;
    }).join('')}</div>
    <section class="sales-report-admin-detail">
      <div class="sales-report-admin-title"><div><span class="eyebrow">STUDENT ROLEPLAY</span><h3>${escapeHtml(selected.user_name || '学员')} · ${escapeHtml(profileName)}</h3><p>${escapeHtml(session.business || '教育业务')} · ${escapeHtml(session.product || '待沟通产品')} · ${escapeHtml(session.difficulty || 'normal')} 难度</p></div><time>${escapeHtml(reportDate(selected.created_at))}</time></div>
      ${renderSalesReportMarkup(report, { compact: true })}
      <section class="sales-report-transcript"><span>本轮模拟对话</span>${(session.history || []).map((message) => `<article class="${message.role === 'user' ? 'user' : 'parent'}"><b>${message.role === 'user' ? '学员' : escapeHtml(profileName)}</b><p>${escapeHtml(message.content || '')}</p></article>`).join('') || '<p>未保存对话内容。</p>'}</section>
    </section>
  </div>`;
}

function renderPromptEditor() {
  const prompt = state.adminConfig.prompts.find((item) => item.id === state.selectedPromptId);
  if (!prompt) {
    $('promptEditor').innerHTML = '<div class="empty-box">选择左侧 Prompt 后编辑。</div>';
    return;
  }
  const feature = state.adminConfig.features.find((item) => item.feature_code === prompt.feature_code);
  const fallbackIds = feature?.fallback_model_ids || [];
  const dataProviderCodes = feature?.data_provider_codes || [];
  $('promptEditor').innerHTML = `
    <label>Prompt 名称<input id="editPromptName" value="${escapeHtml(prompt.name)}" /></label>
    <label>绑定功能<select id="editPromptFeature" disabled title="已有 Prompt 的所属功能不可直接更换">
      <option value="topic_generate" ${prompt.feature_code === 'topic_generate' ? 'selected' : ''}>选题生成</option>
      <option value="pipi_assistant_chat" ${prompt.feature_code === 'pipi_assistant_chat' ? 'selected' : ''}>皮皮分身</option>
      <option value="copywriting_generate" ${prompt.feature_code === 'copywriting_generate' ? 'selected' : ''}>文案智能体</option>
      <option value="competitor_finder" ${prompt.feature_code === 'competitor_finder' ? 'selected' : ''}>找竞品</option>
      <option value="sales_simulation" ${prompt.feature_code === 'sales_simulation' ? 'selected' : ''}>销售模拟</option>
      <option value="coach_toolbox" ${prompt.feature_code === 'coach_toolbox' ? 'selected' : ''}>教练工作流</option>
      <option value="coach_moments" ${prompt.feature_code === 'coach_moments' ? 'selected' : ''}>交付朋友圈</option>
    </select></label>
    ${prompt.feature_code === 'copywriting_generate' ? `<label>绑定文案智能体<select id="editPromptAgent">
      ${Object.entries(copyAgentNames).map(([code, name]) => `<option value="${code}" ${prompt.agent_code === code ? 'selected' : ''}>${name}</option>`).join('')}
    </select></label>` : ''}
    <div class="admin-form two-col prompt-model-binding">
      <label>主模型<select id="editPromptPrimaryModel">${optionHtml(state.adminConfig.models, feature?.primary_model_id)}</select></label>
      <label>备用模型<select id="editPromptFallbackModels" multiple size="3">${state.adminConfig.models.map((item) => `<option value="${item.id}" ${fallbackIds.includes(item.id) ? 'selected' : ''}>${escapeHtml(item.display_name || item.name)} · ${escapeHtml(item.model_code || '')}</option>`).join('')}</select></label>
      <label>数据供应商<select id="editPromptDataProvider"><option value="" ${!dataProviderCodes.length ? 'selected' : ''}>不使用</option><option value="tikhub" ${dataProviderCodes.includes('tikhub') ? 'selected' : ''}>TikHub</option></select></label>
    </div>
    <label>版本<input id="editPromptVersion" value="${escapeHtml(prompt.version)}" /></label>
    <label>Prompt 内容<textarea id="editPromptContent" rows="14">${escapeHtml(prompt.content)}</textarea></label>
    <button class="primary full" id="savePromptDetail">保存 Prompt</button>`;
  $('savePromptDetail').addEventListener('click', savePromptDetail);
}

async function savePromptDetail() {
  if (!state.selectedPromptId) return;
  const prompt = state.adminConfig.prompts.find((item) => item.id === state.selectedPromptId);
  const featureCode = prompt?.feature_code || value('editPromptFeature');
  const primaryModelId = Number(value('editPromptPrimaryModel'));
  const fallbackModelIds = Array.from(document.querySelectorAll('#editPromptFallbackModels option:checked')).map((item) => Number(item.value));
  const dataProviderCode = value('editPromptDataProvider');
  try {
    await patchAdmin(`/api/admin/prompts/${state.selectedPromptId}`, {
      name: value('editPromptName'),
      ...(featureCode === 'copywriting_generate' ? { agent_code: value('editPromptAgent') } : {}),
      version: value('editPromptVersion') || 'v1',
      content: value('editPromptContent')
    }, { refresh: false, toast: false });
    await patchAdmin(`/api/admin/ai/features/${featureCode}`, {
      primary_model_id: primaryModelId,
      fallback_model_ids: fallbackModelIds.join(','),
      data_provider_codes: dataProviderCode,
      prompt_template_id: state.selectedPromptId
    }, { refresh: false, toast: false });
    await loadAdminConfig();
    await refreshActiveFrontendConfig();
    showToast('Prompt 与模型绑定已保存');
  } catch (error) {
    alert(error.message);
  }
}

async function refreshActiveFrontendConfig() {
  await loadToolAvailability();
  if (state.page === 'pipi') await loadPipiConfig();
  if (state.page === 'copy') await loadCopywritingConfig();
  if (state.page === 'sales') await loadSalesMethodConfig();
}

async function patchAdmin(path, payload, options = {}) {
  const result = await apiRequest('adminFeatures', payload, { method: 'PATCH', path, timeoutMs: options.timeoutMs || 30000, retryCount: 1 });
  if (options.refresh !== false) {
    await loadAdminConfig();
    await refreshActiveFrontendConfig();
  }
  if (options.toast !== false) showToast('保存成功，已同步到前台');
  return result;
}

async function deleteAdmin(path) {
  await apiRequest('adminFeatures', {}, { method: 'DELETE', path, timeoutMs: 30000, retryCount: 1 });
  await loadAdminConfig();
  await refreshActiveFrontendConfig();
  showToast('删除成功，已同步到前台');
}

async function postAdmin(endpointKey, payload) {
  await apiRequest(endpointKey, payload);
  await loadAdminConfig();
  await refreshActiveFrontendConfig();
  showToast('新增成功，已同步到前台');
}

async function refreshProviderModels(providerCode) {
  try {
    await apiRequest('adminRefreshModels', { provider_code: providerCode });
    await loadAdminConfig();
    showToast('模型列表已刷新');
  } catch (error) {
    alert(error.message);
  }
}

function renderQuickQuestions() {
  const questions = state.user?.role === 'training' ? trainingQuickQuestions : quickQuestions;
  $('quickQuestions').innerHTML = questions.map((item) => `<button data-question="${escapeHtml(item)}">${item}</button>`).join('');
}

function filterCopyAgents() {
  const search = value('agentSearch').toLowerCase();
  document.querySelectorAll('.agent-market-card').forEach((card) => {
    const matchesSearch = !search || card.innerText.toLowerCase().includes(search);
    const tags = card.dataset.agentTags || '';
    const matchesFilter = state.copyAgentFilter === 'all' || tags.includes(state.copyAgentFilter);
    card.classList.toggle('hidden', !(matchesSearch && matchesFilter));
  });
}

function setCopyView(view) {
  const isCompose = view === 'compose';
  state.copyView = view;
  document.body.classList.toggle('copy-compose-open', isCompose);
  $('copyGalleryView').classList.toggle('hidden', isCompose);
  $('copyComposeView').classList.toggle('hidden', !isCompose);
  if (isCompose) renderCopyAgentChat();
  if (state.page === 'copy') $('pageTitle').textContent = isCompose ? '生成文案' : '文案智能体';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const copyAgentMeta = {
  local_city: { title: '同城智能体', desc: '围绕城市、社区、本地家长和到店/到课场景，生成同城教育口播文案。', guide: '告诉我你的城市、业务、目标家长，以及你想解决的一个本地招生问题。' },
  persona_story: { title: '人设智能体', desc: '把真实经历、教育理念和身份故事整理成有温度的口播文案。', guide: '告诉我你的身份、经历、教育理念和一个你真正想表达的观点。' },
  education_vertical: { title: '垂类爆款智能体', desc: '围绕真实问题、专业判断和精准客户，生成教育垂类短视频文案。', guide: '告诉我你的细分赛道、目标客户和一个高频问题，我会帮你找到更有传播力的切口。' },
  education_dry_goods: { title: '垂类干货智能体', desc: '把教育专业知识、真实经验和方法判断，写成听得懂、记得住、能执行的短视频文案。', guide: '先告诉我你想讲的专业知识、适用人群和希望用户学会什么。' },
  education_marketing: { title: '营销智能体', desc: '用专业、克制的教育表达承接咨询、公开课和产品了解。', guide: '告诉我你的产品、用户当前的需求，以及这条内容希望承接什么动作。' },
  moments: { title: '朋友圈智能体', desc: '围绕日常表达、专业判断、案例和信任场，生成真实、有温度的朋友圈文案。', guide: '告诉我今天想表达的事情、真实素材和希望建立的信任感。' },
  xiaohongshu: { title: '小绿书智能体', desc: '把教育主题拆成封面明确、单页易读、适合微信传播的小绿书图文内容。', guide: '告诉我图文主题、目标人群和你准备使用的图片或案例。' },
  wechat_article: { title: '公众号文案', desc: '围绕长文结构、观点表达和教育内容沉淀，生成高信任的公众号价值文章。', guide: '告诉我文章主题、读者对象和你希望沉淀的核心观点。' }
  ,wechat_layout: { title: '公众号排版', desc: '把已经写好的文章变成可预览、可复制、可导出的公众号视觉成品。', guide: '粘贴完整成稿，选择风格和图片；系统会保留原文完成结构识别与视觉排版。' }
};

const defaultCopyAgentExtras = {
  local_city: { starters: ['我是做原版英语的，想吸引5-9岁孩子家长', '我想写一条同城教育口播', '帮我写一条本地家长关心的招生内容'], tags: ['traffic', 'short'], tag_labels: ['流量', '短视频'], default_type: 'short' },
  persona_story: { starters: ['把我的从业经历写成一条人设故事', '我想讲一个影响我教育理念的真实经历', '帮我把个人介绍写得更有温度'], tags: ['traffic', 'short'], tag_labels: ['流量', '短视频'], default_type: 'short' },
  education_vertical: { starters: ['帮我把一个家长高频问题写成短视频', '我想做一条有专业判断的教育内容', '围绕我的细分赛道找一个传播切口'], tags: ['traffic', 'short'], tag_labels: ['流量', '爆款'], default_type: 'short' },
  education_dry_goods: { starters: ['把这个知识点拆成一条易懂干货', '帮我写一个家长能马上执行的方法', '把我的专业经验整理成短视频'], tags: ['traffic', 'short'], tag_labels: ['流量', '专业干货'], default_type: 'short' },
  education_marketing: { starters: ['帮我写一条公开课邀约内容', '把产品介绍写得专业但不生硬', '写一条能自然承接咨询的短视频'], tags: ['traffic', 'short'], tag_labels: ['流量', '营销'], default_type: 'short' },
  moments: { starters: ['我想写一条今天的教学感悟', '把这个真实案例写成朋友圈', '帮我写一条有专业感但不营销的朋友圈'], tags: ['private', 'moments'], tag_labels: ['私域', '信任场'], default_type: 'moments' },
  xiaohongshu: { starters: ['把这个主题拆成小绿书图文', '帮我设计一组家长易读的图文卡片', '写一篇适合微信传播的教育小绿书'], tags: ['private', 'imageText'], tag_labels: ['私域', '图文卡片'], default_type: 'imageText' },
  wechat_article: { starters: ['帮我搭一篇教育观点文章的结构', '把这段素材写成公众号长文', '围绕这个家长问题写一篇深度文章'], tags: ['private', 'article'], tag_labels: ['私域', '价值长文'], default_type: 'article' }
  ,wechat_layout: { starters: ['排版一篇学员案例文章', '把这篇教育观点文章做成公众号成品', '给这篇招生活动文章做视觉排版'], tags: ['private', 'layout'], tag_labels: ['私域', '视觉排版'], default_type: 'article' }
};

function copyAgentDefinitions() {
  if (Array.isArray(state.copywritingConfig.agents) && state.copywritingConfig.agents.length) return state.copywritingConfig.agents;
  return Object.entries(copyAgentNames).map(([code, name]) => ({
    code,
    name,
    description: copyAgentMeta[code]?.desc || '教育内容创作智能体',
    guide: copyAgentMeta[code]?.guide || '告诉我你想写什么，也可以直接发来真实素材。',
    status: 'published',
    ...(defaultCopyAgentExtras[code] || {})
  }));
}

function copyAgentDefinition(code) {
  return copyAgentDefinitions().find((item) => item.code === code) || copyAgentDefinitions()[0];
}

function syncCopyAgentDefinitions() {
  copyAgentDefinitions().forEach((agent) => {
    copyAgentNames[agent.code] = agent.name;
    copyAgentMeta[agent.code] = { title: agent.name, desc: agent.description, guide: agent.guide };
  });
}

function renderCopyAgentGallery() {
  const container = $('copyAgentGrid');
  if (!container) return;
  const agents = copyAgentDefinitions().filter((item) => item.status !== 'unpublished' && (state.user?.role !== 'training' || (item.default_type === 'short' && item.tags?.includes('traffic'))));
  const currentCode = value('copyAgent');
  const activeAgent = agents.find((item) => item.code === currentCode) || agents[0];
  if (activeAgent && currentCode !== activeAgent.code) {
    $('copyAgent').value = activeAgent.code;
    state.activeCopySessionId = null;
  }
  if ($('copyAgentMarketCount')) $('copyAgentMarketCount').textContent = `共 ${agents.length} 个专属智能体`;
  if (!agents.length) {
    container.innerHTML = '<div class="empty-box">当前没有已上架的文案智能体，请联系管理员。</div>';
    return;
  }
  container.innerHTML = agents.map((agent) => {
    const cover = copyAgentCover(agent.code);
    const labels = Array.isArray(agent.tag_labels) && agent.tag_labels.length ? agent.tag_labels : ['教育', '内容'];
    const tags = Array.isArray(agent.tags) ? agent.tags.join(' ') : '';
    const zoom = Math.max(1, Number(cover.zoom || 100) / 100);
    return `<article class="agent-market-card ${agent.code === activeAgent.code ? 'active' : ''}" data-copy-agent="${escapeHtml(agent.code)}" data-agent-tags="${escapeHtml(tags)}"><div class="agent-cover large"><img src="${escapeHtml(cover.file)}" alt="${escapeHtml(agent.name)}封面" style="--cover-focus:${escapeHtml(cover.focus || '50% 48%')};--cover-zoom:${zoom}" /></div><div class="agent-card-body"><h3>${escapeHtml(agent.name)}</h3><p>${escapeHtml(agent.description || '')}</p><div class="agent-meta">${labels.map((label) => `<span>${escapeHtml(label)}</span>`).join('')}</div><button class="primary full agent-use">使用智能体</button></div></article>`;
  }).join('');
  filterCopyAgents();
}

function renderCopyAgentChat() {
  const agent = value('copyAgent');
  const isWechatLayout = agent === 'wechat_layout';
  if ($('copyChatLayout')) $('copyChatLayout').classList.toggle('hidden', isWechatLayout);
  if ($('wechatLayoutWorkspace')) $('wechatLayoutWorkspace').classList.toggle('hidden', !isWechatLayout);
  if (isWechatLayout) {
    renderWechatLayoutWorkspace();
    return;
  }
  const definition = copyAgentDefinition(agent) || {};
  const meta = copyAgentMeta[agent] || { title: definition.name || '文案智能体', desc: definition.description || '', guide: definition.guide || '' };
  const defaultType = definition.default_type || { moments: 'moments', xiaohongshu: 'imageText', wechat_article: 'article' }[agent] || 'short';
  if ($('copyType')) $('copyType').value = state.user?.role === 'training' ? 'short' : defaultType;
  const cover = copyAgentCover(agent);
  if ($('copyAgentTitle')) $('copyAgentTitle').textContent = meta.title;
  if ($('copyAgentDesc')) $('copyAgentDesc').textContent = meta.desc;
  if ($('copyAgentHeroCover')) $('copyAgentHeroCover').innerHTML = `<img src="${escapeHtml(cover.file)}" alt="${escapeHtml(meta.title)}封面" style="--cover-focus:${escapeHtml(cover.focus || '50% 48%')}" />`;
  if ($('copyAgentHeroTitle')) $('copyAgentHeroTitle').textContent = meta.title;
  if ($('copyAgentHeroDesc')) $('copyAgentHeroDesc').textContent = meta.desc;
  if ($('copyAgentGuide')) $('copyAgentGuide').textContent = meta.guide;
  if ($('copyStarterChips')) {
    const starters = Array.isArray(definition.starters) && definition.starters.length ? definition.starters : ['告诉我你想写什么，我先帮你完成一版'];
    $('copyStarterChips').innerHTML = starters.map((starter) => `<button type="button" data-copy-starter="${escapeHtml(typeof starter === 'object' ? starter.prompt || starter.label : starter)}">${escapeHtml(typeof starter === 'object' ? starter.label || starter.prompt : starter)}</button>`).join('');
  }
  if ($('copySidebarAgentName')) $('copySidebarAgentName').textContent = meta.title;
  if ($('copyAgentCover')) $('copyAgentCover').innerHTML = `<img src="${escapeHtml(cover.file)}" alt="${escapeHtml(meta.title)}封面" style="--cover-focus:${escapeHtml(cover.focus || '50% 48%')}" />`;
  const activeSession = state.copySessions.find((item) => item.id === state.activeCopySessionId && item.agent === agent);
  const pendingGeneration = state.copyGeneration?.payload?.agent === agent ? state.copyGeneration : null;
  renderCopyConversation(activeSession, pendingGeneration?.payload.material || '');
  renderCopySessions();
}

function appendMessage(role, html, cites = []) {
  const wrapper = document.createElement('div');
  wrapper.className = `message ${role}`;
  const citeHtml = cites.length ? `<div class="cites">${cites.map((item) => `<span class="cite">${item.title}</span>`).join('')}</div>` : '';
  wrapper.innerHTML = role === 'assistant'
    ? `<img src="assets/pipi-avatar.png" alt="" /><div class="bubble">${html}${citeHtml}</div>`
    : `<div class="bubble">${escapeHtml(html)}</div>`;
  $('pipiMessages').appendChild(wrapper);
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return wrapper;
}

function appendSticker(filename) {
  if (!filename) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'message assistant sticker-only';
  wrapper.innerHTML = `<img class="message-sticker" src="assets/pipi-stickers/${escapeHtml(filename)}" alt="皮皮互动表情" />`;
  $('pipiMessages').appendChild(wrapper);
  wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  return wrapper;
}

function plainPipiText(content) {
  return String(content || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
}

function ensurePipiConversation() {
  if (!state.pipiConversation) {
    state.pipiConversation = {
      id: `pipi-${Date.now()}`,
      title: '皮皮分身对话',
      messages: []
    };
  }
  return state.pipiConversation;
}

function upsertPipiConversationRecord() {
  const conversation = ensurePipiConversation();
  if (!conversation.messages.length) return;
  const content = conversation.messages.map((message) => `${message.role === 'user' ? '你' : '皮皮'}：${message.content}`).join('\n\n');
  const now = new Date().toLocaleString('zh-CN');
  const existing = state.records.find((item) => item.type === '皮皮分身' && item.conversationKey === conversation.id);
  if (existing) {
    existing.title = conversation.title;
    existing.content = content;
    existing.conversationTitle = conversation.title;
    existing.conversationHistory = [...conversation.messages];
    existing.createdAt = now;
    state.records = [existing, ...state.records.filter((item) => item !== existing)];
  } else {
    state.records.unshift({
      id: conversation.id,
      type: '皮皮分身',
      title: conversation.title,
      content,
      createdAt: now,
      conversationKey: conversation.id,
      conversationTitle: conversation.title,
      conversationHistory: [...conversation.messages]
    });
  }
  renderRecent();
  renderContinue();
  $('adminCallCount').textContent = `${state.records.length} 次`;
}

function resetPipi() {
  $('pipiMessages').innerHTML = '';
  state.pipiUserTurns = 0;
  state.pipiConversation = {
    id: `pipi-${Date.now()}`,
    title: '皮皮分身对话',
    messages: []
  };
  appendMessage('assistant', escapeHtml(state.pipiConfig.welcome_message), [{ title: '学员可见知识库 v0.1' }]);
  appendSticker('hello.png');
}

async function loadPipiConfig() {
  const result = await apiRequest('pipiConfig', {}, { method: 'GET' }).catch(() => null);
  if (!result) return false;
  const changed = Object.keys(result).some((key) => state.pipiConfig[key] !== result[key]);
  state.pipiConfig = { ...state.pipiConfig, ...result };
  if (changed && state.pipiUserTurns === 0) state.pipiWelcomeNeedsRefresh = true;
  applyPipiPresentation();
  return changed;
}

function pickPipiSticker(question, text) {
  if (!state.pipiConfig.stickers_enabled || state.pipiConfig.response_sticker_mode === 'never') return '';
  if (/(晚安|睡觉|睡了|休息|下班|明天再聊|先休息)/.test(question)) return 'goodnight.png';
  if (/谢谢|感谢|辛苦了/.test(question)) return 'thanks.jpg';
  if (/收到|明白了|好的|了解了/.test(question)) return 'received.jpg';
  if (/有帮助|有灵感|我试试|太棒了/.test(question)) return 'idea.jpg';
  if (/恭喜|太棒|很棒|做得好/.test(text)) return 'wow.jpg';
  if (state.pipiConfig.response_sticker_mode === 'always') return 'encourage.jpg';
  return '';
}

function buildFastPipiAnswer(question) {
  const normalized = question.replace(/[\s！!。,.，?？]/g, '').toLowerCase();
  const isGreeting = /^(你好|您好|嗨|哈喽|hello|hi)(呀|啊|皮皮|老师){0,2}$/.test(normalized) || /^(早上好|晚上好)$/.test(normalized);
  const isGoodnight = /^(晚安|先休息了|我先下班了|明天再聊)$/.test(normalized);
  if (!isGreeting && !isGoodnight) return null;
  if (isGoodnight) return state.user?.role === 'training'
    ? '晚安呀，今天辛苦了。明天如果遇到中台使用问题，直接来问我就好。'
    : '晚安呀，今天辛苦了。先好好休息，明天我们再继续把内容做好。';
  return state.user?.role === 'training'
    ? '你好呀，我是皮皮。不会使用中台、生成遇到问题，都可以直接问我。'
    : '你好呀，我是皮皮。你可以直接说说现在的业务和卡住的问题，我陪你一起捋清楚。';
}

function buildPipiAnswer(question) {
  if (state.user?.role === 'training') {
    if (/(选题|怎么用|如何用|生成选题)/.test(question)) {
      return { cites: [{ title: '中台使用指南' }], text: '你可以在左侧进入“选题生成”，填写赛道、业务、选题方向和生成数量，然后点击“生成选题”。生成后可以逐条修改、复制或导出。' };
    }
    if (/(文案|短视频|朋友圈|贴图号)/.test(question)) {
      return { cites: [{ title: '中台使用指南' }], text: '进入“文案智能体”，选择文案类型，填写业务、目标客户和主题/素材，点击生成即可。训练营目前开放短视频文案，生成后可以编辑、复制和导出。' };
    }
    if (/(竞品|找竞品|竞品策略)/.test(question)) {
      return { cites: [{ title: '中台使用指南' }], text: '进入“找竞品”，填写赛道、业务、地域和平台，再点击“生成竞品策略”。皮皮会帮你整理搜索关键词、筛选标准和分析维度。' };
    }
    if (/(记录|哪里|复制|导出|历史)/.test(question)) {
      return { cites: [{ title: '中台使用指南' }], text: '生成内容后可以在当前结果区直接编辑、复制或导出；历史内容可以进入左侧“生成记录”查看。' };
    }
    return { cites: [{ title: '训练营客服指南' }], text: '我可以帮你解决中台使用问题。你可以直接问我：怎么生成选题、怎么写文案、怎么找竞品，或者把你现在看到的提示发给我。' };
  }
  if (/(退款|合同|起诉|保证|一定成交|一定涨粉|一定赚钱|后台|密钥|成本|薪资|转化率|逼单|话术)/.test(question)) {
    return { cites: [], text: '这个问题涉及内部策略或需要交付老师确认，我不想随便给你一个不准确的答案。你可以把具体情况带到陪跑群，我也可以先帮你拆公开的业务判断。' };
  }
  const cites = knowledge.filter((item) => item.match.test(question)).slice(0, 3);
  const used = cites.length ? cites : [knowledge[1]];
  const next = /同城|本地|线下/.test(question)
    ? '你可以先整理 3 个本地客户最常问的问题，拿其中一个做成同城选题。'
    : /朋友圈|私域|发圈/.test(question)
      ? '你可以先发一条真实工作场景，再补一个客户常问的问题，别急着写成招生广告。'
      : /产品|课程|卖什么|太散/.test(question)
        ? '先别急着同时推很多产品。你可以先说说最想服务谁、解决什么问题，我们一起把主线捋出来。'
        : '你可以先告诉我：你做什么教育业务，以及现在最卡的那一步。这样我才能给你更贴近实际的建议。';
  return { cites: used, text: `${used[0].answer}<br><br>${next}` };
}

async function sendPipi() {
  const question = value('pipiInput');
  if (!question) return;
  const conversation = ensurePipiConversation();
  if (!conversation.messages.length) conversation.title = question.slice(0, 28);
  conversation.messages.push({ role: 'user', content: question });
  appendMessage('user', question);
  $('pipiInput').value = '';
  state.pipiUserTurns += 1;
  const fastAnswer = buildFastPipiAnswer(question);
  if (fastAnswer) {
    appendMessage('assistant', fastAnswer);
    appendSticker(pickPipiSticker(question, fastAnswer) || (state.pipiUserTurns === 3 ? 'encourage.jpg' : ''));
    conversation.messages.push({ role: 'assistant', content: plainPipiText(fastAnswer) });
    upsertPipiConversationRecord();
    return;
  }
  setButtonLoading('sendPipi', true, '思考中...');
  const thinkingSticker = appendSticker(state.pipiConfig.thinking_sticker || 'thinking.png');
  try {
    const apiResult = await apiRequest('pipiChat', {
      message: question,
      conversation_id: conversation.id,
      conversation_title: conversation.title,
      conversation_history: conversation.messages
    }).catch(() => null);
    const answer = apiResult ? { text: apiResult.reply, cites: apiResult.cited_knowledge || [] } : buildPipiAnswer(question);
    thinkingSticker?.remove();
    appendMessage('assistant', answer.text, answer.cites);
    appendSticker(pickPipiSticker(question, answer.text) || (state.pipiUserTurns === 3 ? 'encourage.jpg' : ''));
    conversation.messages.push({ role: 'assistant', content: plainPipiText(answer.text) });
    upsertPipiConversationRecord();
  } finally {
    setButtonLoading('sendPipi', false);
  }
}

function buildTopicsPayload() {
  return {
    track: value('topicTrack'),
    business: value('topicBusiness'),
    direction: value('topicDirection') || '真实客户问题',
    count: Math.max(5, Math.min(30, Number(value('topicCount')) || 10))
  };
}

function validateTopicRequiredFields() {
  const track = value('topicTrack');
  const business = value('topicBusiness');
  const validations = [
    ['topicTrack', 'topicTrackError', Boolean(track)],
    ['topicBusiness', 'topicBusinessError', Boolean(business)]
  ];
  validations.forEach(([fieldId, errorId, valid]) => {
    $(fieldId).classList.toggle('field-invalid', !valid);
    $(errorId).classList.toggle('hidden', valid);
  });
  return Boolean(track && business);
}

function mockTopics(payload) {
  const trackLabel = payload.track === 'local' ? '同城 C 端' : payload.track === 'b2b' ? '教育 B 端' : '线上 C 端';
  const angles = payload.track === 'b2b' ? ['招生获客', '咨询转化', '产品设计', '团队执行', '续费转介绍'] : payload.track === 'local' ? ['本地搜索', '家长决策', '到店体验', '口碑转介绍', '差异化表达'] : ['学习规划', '避坑判断', '案例拆解', '方法步骤', '目标拆解'];
  return Array.from({ length: payload.count }, (_, index) => ({
    title: `${payload.business}${angles[index % angles.length]}：${payload.direction}，先看这 ${index % 3 + 2} 个信号`,
    angle: angles[index % angles.length],
    track: trackLabel
  }));
}

async function generateTopics() {
  if (!validateTopicRequiredFields()) {
    const firstInvalid = value('topicTrack') ? $('topicBusiness') : $('topicTrack');
    firstInvalid.focus();
    return;
  }
  const payload = buildTopicsPayload();
  setButtonLoading('generateTopics', true, '生成中...');
  $('topicResults').innerHTML = '<div class="loading-box"><strong>正在生成选题</strong><p>通常需要 20-60 秒，模型返回后会自动展示。</p></div>';
  try {
    const apiResult = await apiRequest('topics', payload);
    const apiTopics = apiResult?.items || apiResult?.topics;
    const topics = Array.isArray(apiTopics) && apiTopics.length ? apiTopics : mockTopics(payload);
    $('topicResults').innerHTML = `${modelBadge(apiResult)}<div class="edit-hint">生成后可直接点进每条选题修改。</div>${topics.map((item, index) => `<article class="topic-item" contenteditable="true"><strong>${index + 1}. ${escapeHtml(item.title)}</strong><div class="meta"><span>${escapeHtml(item.track || payload.track)}</span><span>${escapeHtml(item.angle || item.dimension || '内容角度')}</span><span>可拍</span></div></article>`).join('')}`;
    addRecord('选题生成', `${payload.business}选题`, topics.map((item) => item.title).join('\n'));
  } catch (error) {
    const topics = mockTopics(payload);
    $('topicResults').innerHTML = `${fallbackNotice(error.message)}<div class="edit-hint">下面是本地兜底选题，生成后可直接点进每条选题修改。</div>${topics.map((item, index) => `<article class="topic-item" contenteditable="true"><strong>${index + 1}. ${escapeHtml(item.title)}</strong><div class="meta"><span>${escapeHtml(item.track || payload.track)}</span><span>${escapeHtml(item.angle || item.dimension || '内容角度')}</span><span>本地兜底</span></div></article>`).join('')}`;
    addRecord('选题生成', `${payload.business}选题`, topics.map((item) => item.title).join('\n'));
  } finally {
    setButtonLoading('generateTopics', false);
  }
}

function captureCoachSopDraft() {
  const container = $('coachSopResult');
  if (!state.coachSopDraft || !container) return state.coachSopDraft;
  const text = (selector, fallback = '') => container.querySelector(selector)?.innerText.trim() || fallback;
  const steps = [...container.querySelectorAll('[data-coach-sop-node]')].map((node, index) => {
    const sourceIndex = Number(node.dataset.coachSopNode ?? index);
    const nodeText = (selector, fallback = '') => node.querySelector(selector)?.innerText.trim() || fallback;
    return {
    index: sourceIndex,
    name: nodeText('[data-coach-sop-name]', `步骤 ${sourceIndex + 1}`),
    action: nodeText('[data-coach-sop-action]', ''),
    owner: nodeText('[data-coach-sop-owner]', '交付教练'),
    deliverable: state.coachSopDraft.steps[sourceIndex]?.deliverable || '阶段产出',
    standard: state.coachSopDraft.steps[sourceIndex]?.standard || '确认下一步'
    };
  }).sort((left, right) => left.index - right.index).map(({ index, ...step }) => step);
  state.coachSopDraft = {
    ...state.coachSopDraft,
    title: text('[data-coach-sop-title]', state.coachSopDraft.title),
    goal: text('[data-coach-sop-goal]', state.coachSopDraft.goal),
    steps: steps.length ? steps : state.coachSopDraft.steps
  };
  return state.coachSopDraft;
}

function coachSopNode(step, index) {
  const detail = step.deliverable || step.standard;
  return `<article class="coach-diagram-node" data-coach-sop-node="${index}"><span class="coach-diagram-order">${String(index + 1).padStart(2, '0')}</span><strong contenteditable="true" data-coach-sop-name>${escapeHtml(step.name || `步骤 ${index + 1}`)}</strong><p contenteditable="true" data-coach-sop-action>${escapeHtml(step.action || '')}</p>${detail ? `<button type="button" data-coach-sop-expand="${index}">展开补充</button><div class="coach-diagram-details hidden"><span>${escapeHtml(detail)}</span></div>` : ''}</article>`;
}

function renderCoachMindmapLinks() {
  const map = document.querySelector('.coach-mindmap');
  const svg = map?.querySelector('.coach-mindmap-links');
  const center = map?.querySelector('.coach-mindmap-center');
  if (!map || !svg || !center) return;
  const mapRect = map.getBoundingClientRect();
  const centerRect = center.getBoundingClientRect();
  const width = Math.max(mapRect.width, 1);
  const height = Math.max(mapRect.height, 1);
  const centerX = centerRect.left - mapRect.left + centerRect.width / 2;
  const centerY = centerRect.top - mapRect.top + centerRect.height / 2;
  const radiusX = centerRect.width / 2;
  const radiusY = centerRect.height / 2;
  const paths = [...map.querySelectorAll('.coach-diagram-node')].map((node) => {
    const rect = node.getBoundingClientRect();
    const left = node.closest('.coach-mindmap-side')?.classList.contains('left');
    const direction = left ? -1 : 1;
    const startX = (left ? rect.right : rect.left) - mapRect.left;
    const startY = rect.top - mapRect.top + rect.height / 2;
    const offsetY = Math.max(-radiusY * .78, Math.min(radiusY * .78, startY - centerY));
    const endY = centerY + offsetY;
    const ellipseRatio = Math.sqrt(Math.max(0, 1 - (offsetY / radiusY) ** 2));
    const endX = centerX + direction * radiusX * ellipseRatio;
    const bend = Math.max(36, Math.abs(endX - startX) * .42);
    return `<path d="M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${(startX - direction * bend).toFixed(1)} ${startY.toFixed(1)}, ${(endX + direction * bend).toFixed(1)} ${endY.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}" />`;
  }).join('');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.innerHTML = paths;
}

function renderCoachSopDiagram() {
  const container = $('coachSopResult');
  const sop = state.coachSopDraft;
  if (!sop?.steps?.length) {
    container.innerHTML = '<div class="empty-box">填写左侧信息后，这里会出现可编辑的交付思维导图。</div>';
    return;
  }
  const diagram = `<div class="coach-mindmap"><svg class="coach-mindmap-links" aria-hidden="true"></svg><div class="coach-mindmap-side left">${sop.steps.filter((_, index) => index % 2 === 0).map((step, index) => coachSopNode(step, index * 2)).join('')}</div><section class="coach-mindmap-center"><span>交付工作流</span><strong contenteditable="true" data-coach-sop-title>${escapeHtml(sop.title || '交付工作流')}</strong><small contenteditable="true" data-coach-sop-goal>${escapeHtml(sop.goal || '把工作拆成可执行步骤')}</small></section><div class="coach-mindmap-side right">${sop.steps.filter((_, index) => index % 2 === 1).map((step, index) => coachSopNode(step, index * 2 + 1)).join('')}</div></div>`;
  container.innerHTML = `<div class="coach-diagram-toolbar"><small>思维导图 · 拖动空白处浏览 · 点击文字编辑</small></div>${diagram}`;
  window.requestAnimationFrame(renderCoachMindmapLinks);
}

function renderCoachSop(sop) {
  if (!sop?.steps?.length) {
    state.coachSopDraft = null;
    renderCoachSopDiagram();
    return;
  }
  state.coachSopDraft = {
    title: sop.title || '交付工作流',
    goal: sop.goal || '把工作拆成可执行步骤',
    note: sop.note || '',
    steps: sop.steps.map((step) => ({ ...step }))
  };
  state.coachSopView = 'mindmap';
  renderCoachSopDiagram();
}

function escapeSvg(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function svgLines(text, x, y, maxChars, lineHeight, className = '') {
  const source = String(text || '').trim();
  const parts = source.match(new RegExp(`.{1,${maxChars}}`, 'g')) || [''];
  return parts.slice(0, 3).map((line, index) => `<text class="${className}" x="${x}" y="${y + index * lineHeight}">${escapeSvg(line)}</text>`).join('');
}

function downloadCoachSopDiagram() {
  const sop = captureCoachSopDraft();
  if (!sop?.steps?.length) return showToast('请先生成一份交付导图');
  const isMindmap = state.coachSopView === 'mindmap';
  const rootId = 'sop-root';
  const rootX = isMindmap ? 510 : 60;
  const rootY = isMindmap ? 320 : 80;
  const rootCell = `<mxCell id="${rootId}" value="${escapeSvg(`${sop.title}\n${sop.goal}`)}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#bb6939;fontColor=#ffffff;strokeColor=#9e5632;fontStyle=1;fontSize=16;" vertex="1" parent="1"><mxGeometry x="${rootX}" y="${rootY}" width="260" height="100" as="geometry" /></mxCell>`;
  const nodeCells = sop.steps.map((step, index) => {
    const x = isMindmap ? (index % 2 === 0 ? 120 : 900) : 60 + index * 250;
    const y = isMindmap ? 120 + Math.floor(index / 2) * 190 : 250;
    const value = `${index + 1}. ${step.name}\n${step.action}`;
    return `<mxCell id="sop-${index}" value="${escapeSvg(value)}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fffaf6;strokeColor=#c77c51;fontColor=#4d382c;fontSize=13;align=left;spacing=10;" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="200" height="140" as="geometry" /></mxCell><mxCell id="edge-${index}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#c98762;endArrow=block;endFill=1;" edge="1" parent="1" source="${isMindmap ? rootId : index ? `sop-${index - 1}` : rootId}" target="sop-${index}"><mxGeometry relative="1" as="geometry" /></mxCell>`;
  }).join('');
  const xml = `<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="PIPI AI CENTER" version="24.7.17"><diagram id="pipi-sop" name="${escapeSvg(sop.title)}"><mxGraphModel dx="1420" dy="820" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1000"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${rootCell}${nodeCells}</root></mxGraphModel></diagram></mxfile>`;
  const blob = new Blob([xml], { type: 'application/vnd.jgraph.mxfile+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = timestampName('皮皮交付导图').replace(/\.txt$/, '.drawio');
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function generateCoachSop() {
  const task = value('coachSopTask').trim();
  if (!task) {
    $('coachSopTask').focus();
    showToast('先描述想搭建的工作');
    return;
  }
  setButtonLoading('generateCoachSop', true, '正在整理 SOP...');
  $('coachSopResult').innerHTML = '<div class="loading-box"><strong>正在整理交付流程</strong><p>会生成简洁的步骤导图，支持直接修改。</p></div>';
  try {
    const result = await apiRequest('coachSop', { task, context: value('coachSopContext') });
    renderCoachSop(result.sop);
    addRecord('教练工作流 SOP', result.sop?.title || task, result.sop?.steps?.map((item) => `${item.name}：${item.action}`).join('\n') || '');
    showToast('交付 SOP 已生成，可直接修改和复制');
  } catch (error) {
    $('coachSopResult').innerHTML = errorHtml(error.message);
  } finally {
    setButtonLoading('generateCoachSop', false);
  }
}

function wrapCoachPosterText(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const chars = Array.from(String(text || '').replace(/\s+/g, ' ').trim());
  const lines = [];
  let current = '';
  chars.forEach((char) => {
    const next = `${current}${char}`;
    if (context.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else current = next;
  });
  if (current) lines.push(current);
  lines.slice(0, maxLines).forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return Math.min(lines.length, maxLines) * lineHeight;
}

function coachPosterImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function coachMomentTemplateForRequest() {
  const source = state.coachMomentTemplateDataUrl;
  if (String(source).startsWith('data:image/')) return source;
  const result = await apiRequest('coachMomentsTemplate', {}, { method: 'GET', timeoutMs: 30000, retryCount: 1 });
  if (!result?.image_data_url) throw new Error('固定海报底版读取失败，请刷新页面后重试。');
  return result.image_data_url;
}

async function compactCoachMomentImageForRequest(source, maxSide, quality = 0.88) {
  const image = await coachPosterImage(source);
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

async function renderCoachMomentPoster() {
  const canvas = $('coachMomentPoster');
  const placeholder = $('coachMomentPosterEmpty');
  if (!canvas || !placeholder) return;
  if (!state.coachMomentProcessedImageDataUrl) {
    canvas.classList.add('hidden');
    placeholder.classList.remove('hidden');
    return;
  }
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  const drawCover = (image, x, y, boxWidth, boxHeight) => {
    const scale = Math.max(boxWidth / image.width, boxHeight / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    context.drawImage(image, x + (boxWidth - drawWidth) / 2, y + (boxHeight - drawHeight) / 2, drawWidth, drawHeight);
  };
  if (state.coachMomentProcessedImageDataUrl) {
    try {
      const processedImage = await coachPosterImage(state.coachMomentProcessedImageDataUrl);
      drawCover(processedImage, 0, 0, width, height);
      canvas.classList.remove('hidden');
      placeholder.classList.add('hidden');
      return;
    } catch {
      state.coachMomentProcessedImageDataUrl = '';
      canvas.classList.add('hidden');
      placeholder.classList.remove('hidden');
      placeholder.textContent = '最终成图加载失败，请重新生成。';
    }
  }
}

async function handleCoachMomentPhoto(file) {
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    showToast('请上传 8MB 以内的 JPG、PNG 或 WebP 图片');
    return;
  }
  state.coachMomentImageDataUrl = await readImageFile(file);
  state.coachMomentProcessedImageDataUrl = '';
  $('coachMomentPhotoStatus').textContent = `已选择：${file.name}（生成时会智能处理并嵌入底版）`;
  $('coachMomentPosterEmpty').textContent = '现场图已选择，点击生成后将展示 AI 合成的最终成图。';
  await renderCoachMomentPoster();
}

function defaultCoachMomentImagePrompt() {
  return '以固定海报底版为受保护母版：标题、全部文字、背景纹理、底部手写字及右下人物必须逐像素保持原样。右下人物必须直接保留原始脸部、五官、发型、肤色和白色西装，严禁换脸、重绘、磨皮或变形。唯一可改变区域是中部偏左的现场图相框：严格参考目标版式，使用极细、平直、单层的金色直角矩形边框；不要厚金框、立体边、阴影、圆角或透视。现场图必须完整保留原始宽高比例，以 contain 等比缩放放入相框；不得压缩、拉伸、裁剪、模糊、改色或重绘，比例不同时以深色留白补足。现场图与相框必须都在右下人物后方，不能遮挡人物。输出严格保持底版 1024×1536 的 2:3 比例。';
}

async function generateCoachMoment() {
  const material = value('coachMomentMaterial').trim();
  if (!material) {
    $('coachMomentMaterial').focus();
    showToast('简单写下这次交付就可以了');
    return;
  }
  setButtonLoading('generateCoachMoment', true, '正在整理文案与指令...');
  $('coachMomentCopy').textContent = '正在把这次交付整理成适合发布的朋友圈文案…';
  try {
    const result = await apiRequest('coachMoments', {
      material,
      stage: value('coachMomentStage'),
      protect_privacy: $('coachMomentPrivacy').checked
    });
    $('coachMomentCopy').textContent = result.content || material;
    $('coachMomentImagePrompt').value = defaultCoachMomentImagePrompt();
    $('coachMomentPromptEditor').classList.remove('hidden');
    addRecord('教练交付朋友圈', value('coachMomentStage') || '交付记录', result.content || material);
    showToast('文案与配图指令已生成，请确认后再生成成图');
  } catch (error) {
    $('coachMomentCopy').textContent = `生成失败：${error.message}`;
  } finally {
    setButtonLoading('generateCoachMoment', false);
  }
}

async function generateCoachMomentImage() {
  if (!state.coachMomentImageDataUrl) {
    showToast('请先上传交付现场图');
    return;
  }
  const promptOverride = value('coachMomentImagePrompt').trim();
  if (!promptOverride) {
    $('coachMomentImagePrompt').focus();
    showToast('请先确认配图指令');
    return;
  }
  state.coachMomentProcessedImageDataUrl = '';
  $('coachMomentPosterEmpty').textContent = '正在按已确认的指令生成最终成图，请稍候…';
  await renderCoachMomentPoster();
  setButtonLoading('generateCoachMomentImage', true, '正在生成最终成图...');
  try {
    const [templateImage, sceneImage] = await Promise.all([
      coachMomentTemplateForRequest().then((image) => compactCoachMomentImageForRequest(image, 1536, 0.92)),
      compactCoachMomentImageForRequest(state.coachMomentImageDataUrl, 1600, 0.86)
    ]);
    const imageResult = await apiRequest('coachMomentsImage', {
      template_image: templateImage,
      scene_image: sceneImage,
      prompt_override: promptOverride,
      protect_privacy: $('coachMomentPrivacy').checked
    });
    state.coachMomentProcessedImageDataUrl = imageResult.image_data_url;
    $('coachMomentTemplateStatus').textContent = '智能处理完成：底版文字、背景和人物已作为保留基准。';
    $('coachMomentPhotoStatus').textContent = '智能合成完成：已按确认指令生成最终成图。';
    await renderCoachMomentPoster();
    showToast('最终贴图号成图已生成');
  } catch (error) {
    const message = error.message || '图片服务暂时不可用';
    $('coachMomentPhotoStatus').textContent = `智能处理未完成：${message}`;
    $('coachMomentPosterEmpty').textContent = `未能生成最终成图：${message}`;
  } finally {
    setButtonLoading('generateCoachMomentImage', false);
  }
}

function downloadCoachMomentPoster() {
  if (!state.coachMomentProcessedImageDataUrl) {
    showToast('请先等待 AI 生成最终成图后再下载');
    return;
  }
  const canvas = $('coachMomentPoster');
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = timestampName('皮皮交付贴图号');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const WECHAT_LAYOUT_THEMES = {
  museum: { name: '艺展留白', primary: '#9B8C64', dark: '#30302C', ink: '#3A3933', muted: '#8D897B', paper: '#E9E5CF', soft: '#F7F5EB', accent: '#C6B991', label: 'WHERE ART MEETS EDUCATION', variant: 'museum' },
  slow: { name: '时间漫序', primary: '#202020', dark: '#111111', ink: '#252525', muted: '#7F7F7C', paper: '#FFFFFF', soft: '#F0F0ED', accent: '#CFCFC9', label: 'SLOW TIME SEQUENCE', variant: 'slow' },
  geometry: { name: '几何拼贴', primary: '#E76E4C', dark: '#171512', ink: '#352D28', muted: '#897A6E', paper: '#FFF0D9', soft: '#FFE2B8', accent: '#1C1A18', label: 'EDITORIAL COLLAGE', variant: 'geometry' },
  noir: { name: '墨金档案', primary: '#A97C50', dark: '#252321', ink: '#403B36', muted: '#85796E', paper: '#F6F1EA', soft: '#E9DED1', accent: '#D3B894', label: 'EDITORIAL ARCHIVE', variant: 'noir' },
  nature: { name: '自然手账', primary: '#718B39', dark: '#3E4A24', ink: '#45502B', muted: '#7F885D', paper: '#F5F4E8', soft: '#DFE8A3', accent: '#B5D615', label: 'SUMMER FIELD NOTES', variant: 'nature' },
  gallery: { name: '暖调画册', primary: '#AE7B70', dark: '#4D3731', ink: '#4B3732', muted: '#947D75', paper: '#F7EFEA', soft: '#EBD5D1', accent: '#C69A79', label: 'PORTRAIT GALLERY', variant: 'gallery' }
};

function wechatLayoutText(text) {
  return escapeHtml(String(text || '')).replace(/\n/g, '<br>');
}

function wechatLayoutFilename(extension) {
  const title = state.wechatLayout.layout?.segments?.find((item) => item.index === state.wechatLayout.layout.title_index)?.text || '公众号排版';
  const safe = title.replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 36) || '公众号排版';
  return `${safe}.${extension}`;
}

function buildReferenceWechatLayoutHtml(layout, theme, images = []) {
  const segments = Array.isArray(layout?.segments) ? layout.segments : [];
  const titleIndex = Number(layout?.title_index);
  const subtitleIndex = Number(layout?.subtitle_index);
  const title = segments.find((item) => Number(item.index) === titleIndex)?.text || segments[0]?.text || '公众号文章';
  const subtitle = subtitleIndex >= 0 ? (segments.find((item) => Number(item.index) === subtitleIndex)?.text || '') : '';
  const headingIndexes = new Set((layout?.heading_indexes || []).map(Number));
  const highlightIndexes = new Set((layout?.highlight_indexes || []).map(Number));
  const closingIndex = Number(layout?.closing_index);
  const chapters = [];
  let current = { title: '', items: [] };
  segments.forEach((segment) => {
    const index = Number(segment.index);
    if (index === titleIndex || index === subtitleIndex) return;
    if (headingIndexes.has(index)) {
      if (current.title || current.items.length) chapters.push(current);
      current = { title: segment.text, items: [] };
      return;
    }
    current.items.push({ text: segment.text, highlight: highlightIndexes.has(index), closing: index === closingIndex });
  });
  if (current.title || current.items.length) chapters.push(current);
  if (!chapters.length) chapters.push({ title: '', items: segments.filter((item) => Number(item.index) !== titleIndex).map((item) => ({ text: item.text, highlight: highlightIndexes.has(Number(item.index)), closing: Number(item.index) === closingIndex })) });

  let imageNumber = 0;
  const visualImage = (kind = 'wide') => {
    const image = images[imageNumber];
    imageNumber += 1;
    const number = String(imageNumber).padStart(2, '0');
    const dimensions = kind === 'tall' ? 'min-height:330px' : kind === 'square' ? 'min-height:245px' : 'min-height:250px';
    if (image?.dataUrl) return `<figure class="visual-image visual-image-${kind}"><img src="${image.dataUrl}" alt="文章配图 ${number}"/><figcaption>IMAGE / ${number}</figcaption></figure>`;
    return `<figure class="visual-placeholder visual-placeholder-${kind}" style="${dimensions}"><span>IMAGE / ${number}</span><strong>${kind === 'tall' ? '人物、现场或空间感照片' : kind === 'square' ? '细节、物件或关键瞬间' : '课堂现场 / 学员变化 / 真实过程'}</strong><i>上传图片后，这里会自动替换</i></figure>`;
  };
  const para = (item, extra = '') => `<p class="visual-paragraph ${item.highlight ? 'visual-highlight' : ''} ${item.closing ? 'visual-closing' : ''}" ${extra}>${wechatLayoutText(item.text)}</p>`;
  const itemList = (chapter, className = '') => chapter.items.map((item) => para(item, className ? `class="visual-paragraph ${className} ${item.highlight ? 'visual-highlight' : ''}"` : '')).join('');
  const primaryItems = chapters.flatMap((chapter) => chapter.items);
  const intro = primaryItems[0] ? para(primaryItems[0]) : '';
  const footer = `<footer class="visual-footer"><span>END</span><b>${escapeHtml(theme.name)}</b><span>${theme.label}</span></footer>`;
  const cover = (coverClass, kicker = theme.label) => `<header class="visual-cover ${coverClass}"><span class="visual-cover-index">01</span><span class="visual-kicker">${kicker}</span><h1>${wechatLayoutText(title)}</h1>${subtitle ? `<p>${wechatLayoutText(subtitle)}</p>` : ''}<i></i></header>`;
  const chapterTitle = (chapter, index, className = '') => chapter.title ? `<header class="visual-chapter ${className}"><span>${String(index + 1).padStart(2, '0')}</span><h2>${wechatLayoutText(chapter.title)}</h2></header>` : '';

  let body = '';
  if (theme.variant === 'museum') {
    body = `<header class="museum-hero"><span>WHERE ART<br>MEETS EDUCATION</span><b>01 / EXHIBITION</b><h1>${wechatLayoutText(title)}</h1><i>${subtitle || '把真实的教育经验，布置成一场可以慢读的展览。'}</i></header><main class="visual-main visual-museum"><section class="museum-invitation"><span>AN INVITATION</span><h3>${wechatLayoutText(title)}</h3><p>${subtitle || '把真实的教育经验，整理成一篇值得慢慢读完的文章。'}</p></section>${visualImage('wide')}${chapters.map((chapter, index) => `<section class="museum-room room-${index % 2}">${chapterTitle(chapter, index)}<div class="museum-text-card">${itemList(chapter)}</div>${index % 2 === 0 ? visualImage(index === 0 ? 'square' : 'tall') : ''}</section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'slow') {
    body = `<header class="slow-masthead"><span>${theme.label}</span><h1>${wechatLayoutText(title)}</h1><p>${subtitle || '时间不语，把故事排成一页一页的慢读。'}</p><b>${new Date().getFullYear()} — ${new Date().getFullYear() + 1}</b></header><main class="visual-main visual-slow"><section class="slow-title-page"><b>ROMANCE AND ART</b>${intro}<span>↓</span></section>${visualImage('tall')}${chapters.map((chapter, index) => `<section class="slow-spread spread-${index % 2}"><aside>${chapter.title ? wechatLayoutText(chapter.title) : `CHAPTER ${index + 1}`}</aside><div>${chapterTitle(chapter, index, 'slow-chapter')}<div class="slow-copy">${chapter.items.slice(index === 0 ? 1 : 0).map((item) => para(item)).join('')}</div></div>${index % 2 === 0 ? visualImage('wide') : visualImage('square')}</section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'geometry') {
    body = `<header class="geometry-poster"><span>nining</span><i></i><b>EDITORIAL<br>COLLAGE</b><h1>${wechatLayoutText(title)}</h1></header><main class="visual-main visual-geometry"><section class="geometry-lede"><b>THE IDEA / 01</b>${intro}<span>◼ ◼ ◼</span></section>${chapters.map((chapter, index) => `<section class="geometry-board board-${index % 3}"><div class="geometry-marker">${String(index + 1).padStart(2, '0')}</div>${chapterTitle(chapter, index, 'geometry-chapter')}<div class="geometry-content"><div class="geometry-copy">${chapter.items.slice(index === 0 ? 1 : 0).map((item) => para(item)).join('')}</div>${visualImage(index % 2 ? 'tall' : 'square')}</div></section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'noir') {
    body = `<header class="noir-cover"><span>COLLAGE STYLE</span><h1>${wechatLayoutText(title)}</h1><b>YOU SHOULD USE<br>THE URGENCY OF TIME<br>TO FORGET</b></header><main class="visual-main visual-noir"><section class="noir-manifesto">${intro}<span>EDUCATION / ARCHIVE / ${String(chapters.length).padStart(2, '0')}</span></section>${chapters.map((chapter, index) => `<section class="noir-exhibit">${chapterTitle(chapter, index, 'noir-chapter')}<div class="noir-grid">${index % 2 ? visualImage('tall') : visualImage('square')}<div class="noir-copy">${chapter.items.slice(index === 0 ? 1 : 0).map((item) => para(item)).join('')}</div></div></section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'nature') {
    body = `<header class="nature-banner"><span>SUMMER<br>FIELD NOTES</span><i></i><h1>${wechatLayoutText(title)}</h1><b>01 / A WALK THROUGH</b></header><main class="visual-main visual-nature"><section class="nature-opening"><span>01 / START HERE</span>${intro}</section>${visualImage('wide')}${chapters.map((chapter, index) => `<section class="nature-note note-${index % 2}">${chapterTitle(chapter, index, 'nature-chapter')}<div class="nature-copy">${chapter.items.slice(index === 0 ? 1 : 0).map((item) => para(item)).join('')}</div>${index % 2 === 0 ? visualImage('square') : ''}</section>`).join('')}${footer}</main>`;
  } else {
    body = `<header class="gallery-cover"><span>PORTRAIT<br>GALLERY</span><i></i><h1>${wechatLayoutText(title)}</h1></header><main class="visual-main visual-gallery"><section class="gallery-opening"><div><span>PORTRAIT / 01</span>${intro}</div>${visualImage('tall')}</section>${chapters.map((chapter, index) => `<section class="gallery-spread spread-${index % 2}"><div class="gallery-number">0${index + 2}</div>${chapterTitle(chapter, index, 'gallery-chapter')}${index % 2 ? visualImage('square') : ''}<div class="gallery-copy">${chapter.items.slice(index === 0 ? 1 : 0).map((item) => para(item)).join('')}</div>${index % 2 === 0 ? visualImage('wide') : ''}</section>`).join('')}${footer}</main>`;
  }
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
  *{box-sizing:border-box}.wechat-article{width:677px;max-width:100%;margin:0 auto;overflow:hidden;background:${theme.paper};box-shadow:0 15px 50px rgba(26,22,17,.18);font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif}.visual-main{padding:0 28px 54px}.visual-cover{position:relative;display:flex;min-height:430px;flex-direction:column;justify-content:flex-end;overflow:hidden;padding:52px 42px 46px}.visual-cover h1{position:relative;z-index:1;margin:13px 0 0;font-size:42px;line-height:1.28;letter-spacing:.015em}.visual-cover p{position:relative;z-index:1;margin:20px 0 0;font-size:16px;line-height:1.7}.visual-cover-index{position:absolute;top:28px;right:35px;font-family:Georgia,serif;font-size:41px;font-style:italic}.visual-kicker{position:relative;z-index:1;font-size:10px;font-weight:800;letter-spacing:.22em}.visual-cover i{position:relative;z-index:1;display:block;width:48px;height:5px;margin-top:28px}.visual-chapter{display:flex;align-items:flex-end;gap:13px;margin:58px 0 23px}.visual-chapter span{font-family:Georgia,serif;font-size:29px;font-style:italic}.visual-chapter h2{margin:0;font-size:27px;line-height:1.35}.visual-paragraph{margin:0 0 21px;font-size:16px;line-height:2;letter-spacing:.035em;text-align:justify}.visual-highlight{font-size:20px!important;font-weight:750!important;line-height:1.75!important}.visual-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;margin:32px 0;color:${theme.primary};text-align:center}.visual-placeholder span,.visual-placeholder i{font-size:10px;font-style:normal;letter-spacing:.15em}.visual-placeholder strong{margin:12px 0 7px;font-size:13px}.visual-image{margin:32px 0}.visual-image img{display:block;width:100%;height:auto}.visual-image figcaption{margin-top:9px;font-size:10px;letter-spacing:.15em}.visual-footer{display:flex;justify-content:space-between;gap:8px;margin-top:62px;padding-top:18px;font-size:9px;letter-spacing:.14em}.cover-museum{color:${theme.dark};background:linear-gradient(135deg,${theme.paper} 0 67%,${theme.primary} 67%)}.cover-museum:before{position:absolute;top:47px;left:40px;width:74%;height:1px;background:${theme.primary};content:''}.cover-museum .visual-cover-index{color:${theme.primary};border:1px solid ${theme.primary};border-radius:50%;padding:13px}.cover-museum i{background:${theme.primary}}.visual-museum{color:${theme.ink}}.museum-invitation{margin:0 0 28px;padding:34px 28px;background:#fffdf5;text-align:center}.museum-invitation span{font-size:10px;letter-spacing:.17em}.museum-invitation h3{margin:15px 0 10px;font-size:21px}.museum-invitation p{margin:0;font-size:13px;line-height:1.7}.museum-text-card{position:relative;padding:27px 25px;border:1px solid ${theme.accent};background:#fffdf5}.museum-text-card:before{position:absolute;top:12px;right:12px;bottom:12px;left:12px;border:1px solid ${theme.soft};content:'';pointer-events:none}.museum-text-card .visual-paragraph{position:relative}.museum-room:nth-child(even) .museum-text-card{margin-left:38px;background:${theme.soft}}.visual-museum .visual-placeholder{border:1px dashed ${theme.primary};background:${theme.soft}}.visual-museum .visual-image{padding:11px;border:1px solid ${theme.primary};background:#fff}.visual-museum .visual-image-square{width:64%;margin-left:auto}.visual-museum .visual-footer{border-top:1px solid ${theme.primary};color:${theme.muted}}
  .cover-slow{color:${theme.dark};background:#fff;text-align:center}.cover-slow:before{position:absolute;top:0;right:0;bottom:0;left:0;background:radial-gradient(circle at 15% 70%,#f0f0ed,transparent 34%),linear-gradient(160deg,transparent 45%,#eeeeea 45.5%,transparent 46%);content:''}.cover-slow .visual-cover-index{color:${theme.muted}}.cover-slow .visual-kicker,.cover-slow i{color:${theme.primary};background:${theme.primary}}.cover-slow .visual-cover-index{background:transparent}.visual-slow{padding-right:48px;padding-left:48px;color:${theme.ink}}.slow-opening{padding:48px 12px 40px;border-bottom:1px solid ${theme.accent};text-align:center}.slow-opening .visual-paragraph{font-family:Georgia,'Songti SC',serif;font-size:22px;line-height:1.8;text-align:center}.slow-opening span{font-size:10px;letter-spacing:.15em}.slow-sequence{margin-top:18px}.slow-chapter{display:block;text-align:center}.slow-chapter span{display:block;margin-bottom:8px}.slow-chapter h2{font-family:Georgia,'Songti SC',serif;font-size:30px;font-weight:500}.slow-copy .visual-paragraph{padding:0 10px;font-family:Georgia,'Songti SC',serif;font-size:17px}.visual-slow .visual-image{width:78%;margin-right:auto;margin-left:auto}.visual-slow .visual-image figcaption{text-align:center}.visual-slow .visual-placeholder{width:78%;margin-right:auto;margin-left:auto;border-top:1px solid ${theme.primary};border-bottom:1px solid ${theme.primary};background:#f7f7f4}.visual-slow .visual-footer{border-top:1px solid ${theme.primary};color:${theme.muted}}
  .cover-geometry{color:#fff;background:linear-gradient(130deg,${theme.primary} 0 57%,${theme.accent} 57% 69%,${theme.paper} 69%)}.cover-geometry:after{position:absolute;top:34px;right:35px;width:67px;height:67px;border-radius:50%;background:${theme.paper};content:''}.cover-geometry .visual-cover-index{z-index:2;color:${theme.dark}}.cover-geometry i{background:${theme.accent}}.visual-geometry{color:${theme.ink}}.geometry-lede{margin:0 -28px;padding:34px 42px;background:${theme.dark};color:#fff}.geometry-lede b{display:block;margin-bottom:12px;color:${theme.primary};font-size:10px;letter-spacing:.18em}.geometry-lede .visual-paragraph{font-size:20px;line-height:1.8;text-align:left}.geometry-lede span{color:${theme.primary};letter-spacing:.4em}.geometry-board{margin:42px 0 0}.geometry-board .visual-chapter{margin-bottom:0;padding:21px 23px;background:${theme.primary};color:#fff}.geometry-board .visual-chapter span{color:${theme.accent}}.geometry-content{display:grid;grid-template-columns:minmax(0,1fr) 42%;gap:0;align-items:start}.geometry-copy{padding:28px 22px;background:${theme.soft}}.geometry-copy .visual-highlight{padding:18px;border-left:6px solid ${theme.primary};background:#fff}.geometry-content .visual-image,.geometry-content .visual-placeholder{margin:0;min-height:100%;height:100%}.geometry-content .visual-image img{height:100%;min-height:300px;object-fit:cover}.geometry-content .visual-placeholder{padding:25px;background:${theme.primary};color:#fff}.board-1 .geometry-content{grid-template-columns:42% minmax(0,1fr)}.board-1 .geometry-copy{grid-column:2}.board-1 .visual-image,.board-1 .visual-placeholder{grid-column:1;grid-row:1}.visual-geometry .visual-footer{border-top:5px solid ${theme.primary};color:${theme.muted}}
  .cover-noir{color:#fff;background:${theme.dark}}.cover-noir:before{position:absolute;top:-120px;right:-100px;width:340px;height:340px;border:1px solid ${theme.primary};border-radius:50%;content:''}.cover-noir .visual-cover-index,.cover-noir .visual-kicker{color:${theme.primary}}.cover-noir i{background:${theme.primary}}.visual-noir{color:#eef7f5;background:${theme.paper}}.noir-manifesto{margin:0 -28px;padding:42px 42px 35px;border-bottom:1px solid ${theme.primary};background:${theme.dark}}.noir-manifesto .visual-paragraph{font-size:21px;font-weight:700;line-height:1.75;text-align:left}.noir-manifesto span{color:${theme.primary};font-size:10px;letter-spacing:.16em}.visual-noir .visual-placeholder{border:1px dashed ${theme.primary};background:${theme.soft};color:${theme.primary}}.visual-noir .visual-image{border:1px solid ${theme.primary};padding:8px}.visual-noir .visual-image figcaption{color:${theme.primary}}.noir-exhibit{padding:1px 0 3px}.noir-chapter{margin-bottom:20px;padding:17px 0;border-top:1px solid ${theme.primary};border-bottom:1px solid ${theme.primary}}.noir-chapter span{color:${theme.primary}}.noir-grid{display:grid;grid-template-columns:minmax(0,1fr) 43%;gap:12px}.noir-copy{padding:24px;background:${theme.soft}}.noir-copy .visual-paragraph{color:#edf7f5}.noir-copy .visual-highlight{padding:16px;background:${theme.primary};color:${theme.dark}}.noir-grid .visual-image,.noir-grid .visual-placeholder{margin:0}.noir-grid .visual-image img{height:100%;min-height:280px;object-fit:cover}.noir-grid .visual-placeholder{padding:20px;background:#123743}.visual-noir .visual-footer{border-top:1px solid ${theme.primary};color:${theme.primary}}
  .cover-nature{color:#fff;background:linear-gradient(155deg,${theme.primary} 0 61%,${theme.soft} 61%)}.cover-nature:before{position:absolute;right:-60px;bottom:-90px;width:250px;height:250px;border:18px solid ${theme.accent};border-radius:50%;content:''}.cover-nature .visual-kicker{color:${theme.accent}}.cover-nature i{background:${theme.accent}}.visual-nature{color:${theme.ink}}.nature-opening{margin:0 -10px;padding:34px 26px 28px;border-radius:0 40px 0 40px;background:${theme.soft}}.nature-opening span{display:block;margin-bottom:12px;color:${theme.primary};font-size:10px;font-weight:800;letter-spacing:.15em}.nature-opening .visual-paragraph{font-size:20px;font-weight:700;line-height:1.8;text-align:left}.visual-nature .visual-placeholder{border-radius:46px 5px 46px 5px;background:#fff;border:1px dashed ${theme.primary}}.visual-nature .visual-image{padding:10px 10px 24px;border-radius:36px 4px 36px 4px;background:#fff;box-shadow:0 9px 22px rgba(54,64,26,.12)}.nature-note{position:relative;margin-top:44px;padding:28px 24px 5px;border-radius:42px 4px 42px 4px;background:#fff}.nature-note:before{position:absolute;top:-11px;left:26px;width:22px;height:22px;border-radius:50%;background:${theme.accent};content:''}.note-1{border-radius:4px 42px 4px 42px;background:${theme.soft}}.nature-chapter{margin-top:0}.nature-chapter span{color:${theme.primary}}.nature-copy .visual-highlight{padding:18px 20px;border-radius:0 24px 0 24px;background:${theme.primary};color:#fff}.visual-nature .visual-footer{border-top:1px solid ${theme.primary};color:${theme.muted}}
  .cover-gallery{color:#fff;background:${theme.dark}}.cover-gallery:before{position:absolute;top:35px;right:40px;width:142px;height:184px;border:1px solid ${theme.accent};content:''}.cover-gallery .visual-kicker{color:${theme.accent}}.cover-gallery i{background:${theme.accent}}.visual-gallery{color:${theme.ink}}.gallery-opening{display:grid;grid-template-columns:minmax(0,1fr) 43%;gap:17px;margin-top:36px;align-items:end}.gallery-opening > div{padding:23px;background:${theme.soft}}.gallery-opening span{display:block;margin-bottom:14px;color:${theme.primary};font-family:Georgia,serif;font-size:12px;font-style:italic}.gallery-opening .visual-paragraph{font-family:Georgia,'Songti SC',serif;font-size:19px;line-height:1.8;text-align:left}.gallery-opening .visual-image,.gallery-opening .visual-placeholder{margin:0}.gallery-opening .visual-image img{min-height:300px;height:100%;object-fit:cover}.gallery-opening .visual-placeholder{padding:20px;background:#fff;border:1px solid ${theme.accent}}.gallery-spread{position:relative;margin-top:56px}.gallery-chapter{padding-bottom:14px;border-bottom:2px solid ${theme.primary}}.gallery-chapter span{color:${theme.primary}}.gallery-chapter h2{font-family:Georgia,'Songti SC',serif;font-size:29px;font-weight:500}.gallery-copy{padding:4px 15px 0 22px;border-left:2px solid ${theme.primary}}.gallery-copy .visual-paragraph{font-family:Georgia,'Songti SC',serif;font-size:17px}.gallery-copy .visual-highlight{padding:18px;background:${theme.soft}}.gallery-spread > .visual-image{width:74%;margin-right:auto;margin-left:auto;padding:11px;background:#fff;box-shadow:0 9px 24px rgba(67,48,42,.13)}.spread-1 > .visual-image{width:58%;margin-left:0}.visual-gallery .visual-footer{border-top:1px solid ${theme.primary};color:${theme.muted}}
  .museum-hero{position:relative;min-height:470px;padding:45px 40px;color:${theme.dark};background:linear-gradient(117deg,${theme.paper} 0 72%,${theme.primary} 72%)}.museum-hero:before{position:absolute;top:38px;right:32px;bottom:35px;left:32px;border:1px solid ${theme.accent};content:''}.museum-hero span{position:absolute;top:66px;left:56px;font-size:10px;font-weight:800;letter-spacing:.16em;line-height:1.65}.museum-hero b{position:absolute;right:52px;bottom:45px;font-family:Georgia,serif;font-size:28px;font-style:italic}.museum-hero h1{position:absolute;right:47px;bottom:126px;left:56px;margin:0;font-size:43px;line-height:1.25}.museum-hero i{position:absolute;right:64px;bottom:75px;left:56px;font-size:14px;font-style:normal;line-height:1.7}.museum-room.room-1{margin-left:46px}.museum-room.room-1 .museum-text-card{margin-left:0!important}
  .slow-masthead{min-height:480px;padding:53px 45px;background:#fff;color:${theme.dark};text-align:center}.slow-masthead span{display:block;font-family:Georgia,serif;font-size:22px;letter-spacing:-.05em}.slow-masthead h1{margin:46px 0 15px;font-family:Georgia,'Songti SC',serif;font-size:47px;font-weight:500;line-height:1.18}.slow-masthead p{margin:0 auto;max-width:260px;font-size:14px;line-height:1.8}.slow-masthead b{display:block;margin-top:76px;font-family:Georgia,serif;font-size:24px;font-weight:400}.slow-title-page{padding:75px 20px 64px;text-align:center}.slow-title-page>b{display:block;margin-bottom:38px;font-family:Georgia,serif;font-size:21px;font-weight:400}.slow-title-page .visual-paragraph{font-family:Georgia,'Songti SC',serif;font-size:19px;text-align:center}.slow-title-page>span{display:block;margin-top:38px;font-size:26px}.slow-spread{display:grid;grid-template-columns:70px minmax(0,1fr);gap:18px;margin:65px 0 0}.slow-spread>aside{padding-top:8px;font-family:Georgia,'Songti SC',serif;font-size:28px;line-height:1.15;writing-mode:vertical-rl}.slow-spread .visual-chapter{margin-top:0}.slow-spread .visual-image,.slow-spread .visual-placeholder{grid-column:1 / -1;width:100%;margin:17px 0 0}.slow-spread.spread-1>aside{order:2}.slow-spread.spread-1>div{order:1}.slow-spread.spread-1>.visual-image,.slow-spread.spread-1>.visual-placeholder{order:3}
  .geometry-poster{position:relative;min-height:420px;padding:42px 40px;color:${theme.dark};background:${theme.paper};overflow:hidden}.geometry-poster:before{position:absolute;top:0;right:0;width:57%;height:100%;background:${theme.primary};content:''}.geometry-poster span{position:absolute;top:45px;left:42px;font-size:31px;font-weight:800;writing-mode:vertical-rl}.geometry-poster i{position:absolute;top:55px;left:100px;width:67px;height:67px;border-radius:50%;background:${theme.accent};box-shadow:0 0 0 21px ${theme.dark}}.geometry-poster b{position:absolute;top:55px;right:35px;color:#fff;font-size:11px;letter-spacing:.16em;line-height:1.65}.geometry-poster h1{position:absolute;right:35px;bottom:44px;left:144px;margin:0;color:#fff;font-size:40px;line-height:1.2}.geometry-marker{position:absolute;top:-18px;right:22px;z-index:2;display:grid;width:45px;height:45px;place-items:center;border-radius:50%;background:${theme.accent};font-weight:900}.geometry-board{position:relative}.geometry-board.board-2 .geometry-content{grid-template-columns:1fr}.geometry-board.board-2 .visual-image,.geometry-board.board-2 .visual-placeholder{min-height:220px;height:auto}.geometry-board.board-2 .geometry-copy{padding:36px 35px;background:#fff}
  .noir-cover{min-height:440px;padding:47px 43px;color:#fff;background:${theme.dark};overflow:hidden}.noir-cover:before,.noir-cover:after{position:absolute;content:''}.noir-cover:before{top:34px;right:35px;width:154px;height:185px;border:1px solid ${theme.primary}}.noir-cover:after{right:-95px;bottom:-115px;width:340px;height:340px;border:1px solid ${theme.primary};border-radius:50%}.noir-cover span{position:relative;z-index:1;color:${theme.primary};font-size:10px;font-weight:800;letter-spacing:.2em}.noir-cover h1{position:relative;z-index:1;margin:175px 0 0;font-size:40px;line-height:1.26}.noir-cover b{position:relative;z-index:1;display:block;margin-top:28px;color:${theme.primary};font-size:10px;letter-spacing:.13em;line-height:1.7}.noir-grid>.visual-image,.noir-grid>.visual-placeholder{order:-1}.noir-exhibit:nth-child(even) .noir-grid{grid-template-columns:43% minmax(0,1fr)}
  .nature-banner{position:relative;min-height:440px;padding:45px 42px;overflow:hidden;background:${theme.soft};color:${theme.dark}}.nature-banner:before{position:absolute;top:0;right:0;width:52%;height:100%;background:${theme.primary};content:''}.nature-banner span{position:absolute;top:44px;left:42px;font-size:11px;font-weight:900;letter-spacing:.18em;line-height:1.75}.nature-banner i{position:absolute;top:113px;right:85px;width:110px;height:110px;border:13px solid ${theme.accent};border-radius:50%}.nature-banner h1{position:absolute;right:35px;bottom:80px;left:55%;margin:0;color:#fff;font-size:37px;line-height:1.25}.nature-banner b{position:absolute;bottom:42px;left:42px;color:${theme.primary};font-size:10px;letter-spacing:.15em}.nature-note.note-1{margin-right:34px}.nature-note.note-0{margin-left:34px}
  .gallery-cover{position:relative;min-height:440px;padding:42px;color:${theme.dark};background:${theme.soft}}.gallery-cover:before{position:absolute;top:0;right:0;width:42%;height:100%;background:${theme.primary};content:''}.gallery-cover span{position:absolute;top:44px;left:42px;font-family:Georgia,serif;font-size:13px;font-style:italic;line-height:1.5}.gallery-cover i{position:absolute;top:89px;right:62px;width:118px;height:164px;border:1px solid ${theme.accent};background:rgba(255,255,255,.18)}.gallery-cover h1{position:absolute;right:42px;bottom:57px;left:42px;margin:0;font-family:Georgia,'Songti SC',serif;font-size:43px;font-weight:500;line-height:1.2}.gallery-number{position:absolute;top:-28px;right:0;color:${theme.primary};font-family:Georgia,serif;font-size:43px;font-style:italic}.gallery-spread.spread-1{padding-right:45px}.gallery-spread.spread-0{padding-left:45px}
  @media(max-width:520px){body{margin:0!important;padding:0!important;background:${theme.paper}!important}.wechat-article{width:100%!important;box-shadow:none!important}.visual-main{padding-right:20px!important;padding-left:20px!important}.visual-cover{min-height:360px!important;padding:42px 26px 36px!important}.visual-cover h1{font-size:32px!important}.visual-cover-index{right:22px!important}.visual-chapter h2{font-size:24px!important}.visual-paragraph{font-size:16px!important}.visual-highlight{font-size:19px!important}.visual-slow{padding-right:28px!important;padding-left:28px!important}.geometry-lede,.noir-manifesto{margin-right:-20px!important;margin-left:-20px!important;padding-right:27px!important;padding-left:27px!important}.geometry-content,.noir-grid,.gallery-opening{grid-template-columns:1fr!important}.geometry-content .visual-image,.geometry-content .visual-placeholder,.board-1 .visual-image,.board-1 .visual-placeholder,.board-1 .geometry-copy{grid-column:auto!important;grid-row:auto!important}.geometry-content .visual-image img,.noir-grid .visual-image img{min-height:220px!important}.gallery-opening .visual-image img{min-height:260px!important}.visual-museum .visual-image-square,.visual-slow .visual-image,.visual-slow .visual-placeholder,.gallery-spread > .visual-image,.spread-1 > .visual-image{width:100%!important}.museum-room:nth-child(even) .museum-text-card{margin-left:0!important}.museum-hero,.slow-masthead,.geometry-poster,.noir-cover,.nature-banner,.gallery-cover{min-height:370px!important}.museum-hero h1,.slow-masthead h1,.geometry-poster h1,.noir-cover h1,.nature-banner h1,.gallery-cover h1{font-size:32px!important}.museum-room.room-1,.nature-note.note-0,.nature-note.note-1,.gallery-spread.spread-0,.gallery-spread.spread-1{margin-left:0!important;margin-right:0!important;padding-left:0!important;padding-right:0!important}.slow-spread{grid-template-columns:52px minmax(0,1fr)!important;gap:12px!important}.slow-spread>aside{font-size:23px!important}.geometry-poster span{left:25px!important}.geometry-poster i{left:72px!important}.geometry-poster h1{left:115px!important}.nature-banner h1{left:47%!important}.gallery-cover h1{right:25px!important;left:25px!important}}
  </style></head><body><main class="wechat-article">${body}</main></body></html>`;
}

function buildWechatVisualLongformHtml(layout, theme, images = []) {
  const segments = Array.isArray(layout?.segments) ? layout.segments : [];
  const titleIndex = Number(layout?.title_index);
  const subtitleIndex = Number(layout?.subtitle_index);
  const title = segments.find((item) => Number(item.index) === titleIndex)?.text || segments[0]?.text || '公众号文章';
  const subtitle = subtitleIndex >= 0 ? segments.find((item) => Number(item.index) === subtitleIndex)?.text || '' : '';
  const headingIndexes = new Set((layout?.heading_indexes || []).map(Number));
  const highlightIndexes = new Set((layout?.highlight_indexes || []).map(Number));
  const closingIndex = Number(layout?.closing_index);
  const leadItems = [];
  const chapters = [];
  let current = null;
  segments.forEach((segment) => {
    const index = Number(segment.index);
    if (index === titleIndex || index === subtitleIndex) return;
    if (headingIndexes.has(index)) {
      if (current) chapters.push(current);
      current = { title: segment.text, items: [] };
      return;
    }
    const item = { text: segment.text, highlight: highlightIndexes.has(index), closing: index === closingIndex };
    if (current) current.items.push(item);
    else leadItems.push(item);
  });
  if (current) chapters.push(current);
  if (!chapters.length) {
    chapters.push({ title: '正文', items: [...leadItems] });
    leadItems.length = 0;
  }

  const safeTitle = wechatLayoutText(title);
  const titleSize = title.length > 32 ? 30 : title.length > 23 ? 34 : title.length > 15 ? 38 : 43;
  let imageCursor = 0;
  const media = (shape = 'wide', label = 'ARTICLE IMAGE') => {
    const image = images[imageCursor];
    imageCursor += 1;
    const number = String(imageCursor).padStart(2, '0');
    if (image?.dataUrl) return `<figure class="vl-media vl-${shape}"><img src="${image.dataUrl}" alt="文章配图 ${number}"><figcaption>FIG. ${number} · ${label}</figcaption></figure>`;
    return `<figure class="vl-media vl-placeholder vl-${shape}"><div><span>FIG. ${number}</span><i></i><strong>${label}</strong><small>上传图片后自动替换此视觉位</small></div></figure>`;
  };
  const paragraph = (item) => item.highlight
    ? `<blockquote>${wechatLayoutText(item.text)}</blockquote>`
    : `<p class="${item.closing ? 'vl-closing' : ''}">${wechatLayoutText(item.text)}</p>`;
  const paragraphs = (items) => items.map(paragraph).join('');
  const lead = leadItems.length ? `<section class="vl-lead">${paragraphs(leadItems)}</section>` : '';
  const chapterHeading = (chapter, index) => `<header class="vl-chapter"><span>${String(index + 1).padStart(2, '0')}</span><h2>${wechatLayoutText(chapter.title || `章节 ${index + 1}`)}</h2></header>`;
  const footer = `<footer class="vl-footer"><span>END</span><strong>${escapeHtml(theme.name)}</strong><span>${theme.label}</span></footer>`;
  let body = '';

  if (theme.variant === 'museum') {
    body = `<header class="vl-cover museum-cover"><div class="museum-frame"><span>${theme.label}</span><b>EXHIBITION · 01</b><h1>${safeTitle}</h1>${subtitle ? `<p>${wechatLayoutText(subtitle)}</p>` : ''}</div></header><main class="vl-body museum-body">${lead}<section class="museum-opening"><small>AN INVITATION</small><strong>${safeTitle}</strong><i></i></section>${media('wide', 'EDUCATION & LIFE')}${chapters.map((chapter, index) => `<section class="museum-chapter ${index % 2 ? 'is-offset' : ''}">${chapterHeading(chapter, index)}<div class="museum-copy">${paragraphs(chapter.items)}</div>${index % 2 === 0 ? media(index % 3 ? 'portrait' : 'square', 'EXHIBIT DETAIL') : ''}</section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'slow') {
    body = `<header class="vl-cover slow-cover"><span>${theme.label}</span><h1>${safeTitle}</h1>${subtitle ? `<p>${wechatLayoutText(subtitle)}</p>` : ''}<b>${new Date().getFullYear()} — ${new Date().getFullYear() + 1}</b><i>READ SLOWLY</i></header><main class="vl-body slow-body">${lead}${media('portrait', 'A MOMENT IN TIME')}${chapters.map((chapter, index) => `<section class="slow-chapter"><aside><b>${String(index + 1).padStart(2, '0')}</b><span>SEQUENCE</span></aside><div>${chapterHeading(chapter, index)}<div class="slow-copy">${paragraphs(chapter.items)}</div></div>${index % 2 === 0 ? media('wide', 'TIME & STORY') : media('square', 'STORY DETAIL')}</section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'geometry') {
    body = `<header class="vl-cover geometry-cover"><span>EDITORIAL<br>COLLAGE</span><i></i><b>01</b><h1>${safeTitle}</h1>${subtitle ? `<p>${wechatLayoutText(subtitle)}</p>` : ''}</header><main class="vl-body geometry-body">${lead}<section class="geometry-opening"><strong>THE<br>IDEA</strong>${media('square', 'VISUAL NOTE')}</section>${chapters.map((chapter, index) => `<section class="geometry-panel panel-${index % 3}">${chapterHeading(chapter, index)}<div class="geometry-copy">${paragraphs(chapter.items)}</div>${media(index % 2 ? 'portrait' : 'wide', 'CHAPTER IMAGE')}<span class="geometry-index">${String(index + 1).padStart(2, '0')}</span></section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'noir') {
    body = `<header class="vl-cover archive-cover"><span>${theme.label}</span><b>ARCHIVE / ${new Date().getFullYear()}</b><h1>${safeTitle}</h1>${subtitle ? `<p>${wechatLayoutText(subtitle)}</p>` : ''}<i></i></header><main class="vl-body archive-body">${lead}${media('wide', 'DOCUMENTARY IMAGE')}${chapters.map((chapter, index) => `<section class="archive-chapter">${chapterHeading(chapter, index)}<div class="archive-rule"></div><div class="archive-copy">${paragraphs(chapter.items)}</div>${index % 2 === 0 ? media('square', 'ARCHIVE OBJECT') : ''}</section>`).join('')}${footer}</main>`;
  } else if (theme.variant === 'nature') {
    body = `<header class="vl-cover nature-cover"><span>${theme.label}</span><i></i><b>FIELD NOTE · 01</b><h1>${safeTitle}</h1>${subtitle ? `<p>${wechatLayoutText(subtitle)}</p>` : ''}</header><main class="vl-body nature-body">${lead}${media('wide', 'SUMMER FIELD')}${chapters.map((chapter, index) => `<section class="nature-chapter ${index % 2 ? 'is-right' : ''}">${chapterHeading(chapter, index)}<div class="nature-copy">${paragraphs(chapter.items)}</div>${index % 2 === 0 ? media('square', 'A QUIET MOMENT') : ''}</section>`).join('')}${footer}</main>`;
  } else {
    body = `<header class="vl-cover gallery-cover-safe"><span>${theme.label}</span>${media('wide', 'PORTRAIT / COVER')}<h1>${safeTitle}</h1>${subtitle ? `<p>${wechatLayoutText(subtitle)}</p>` : ''}</header><main class="vl-body gallery-body">${lead}${chapters.map((chapter, index) => `<section class="gallery-chapter-safe ${index % 2 ? 'image-first' : ''}">${chapterHeading(chapter, index)}<div class="gallery-copy-safe">${paragraphs(chapter.items)}</div>${media(index % 2 ? 'portrait' : 'square', 'PORTRAIT STORY')}<span class="gallery-index">${String(index + 1).padStart(2, '0')}</span></section>`).join('')}${footer}</main>`;
  }

  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
  *{box-sizing:border-box}body{margin:0;padding:20px;background:#e9e5df;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif}.wechat-article{width:677px;max-width:100%;margin:0 auto;overflow:hidden;background:${theme.paper};box-shadow:0 14px 46px rgba(48,38,31,.16)}.vl-cover{position:relative;min-height:370px;overflow:hidden;padding:42px}.vl-cover h1{position:relative;z-index:2;margin:0;font-size:${titleSize}px;line-height:1.32;letter-spacing:.015em;overflow-wrap:anywhere}.vl-cover p{position:relative;z-index:2;margin:16px 0 0;font-size:15px;line-height:1.8}.vl-body{padding:36px 30px 48px}.vl-lead{margin:0 0 30px;padding:24px 26px;background:${theme.soft}}.vl-lead p{font-size:19px!important;font-weight:600;line-height:1.8!important}.vl-body p{margin:0 0 18px;color:${theme.ink};font-size:16px;line-height:1.95;letter-spacing:.025em;text-align:justify}.vl-body blockquote{margin:25px 0;padding:22px 24px;border-left:5px solid ${theme.primary};background:${theme.soft};color:${theme.dark};font-size:20px;font-weight:700;line-height:1.75}.vl-closing{font-weight:650}.vl-chapter{display:flex;gap:15px;align-items:flex-start;margin-bottom:20px}.vl-chapter span{flex:none;color:${theme.primary};font-family:Georgia,serif;font-size:26px;font-style:italic}.vl-chapter h2{margin:0;color:${theme.dark};font-size:26px;line-height:1.4}.vl-media{position:relative;margin:28px 0;overflow:hidden;background:${theme.soft}}.vl-media img{display:block;width:100%;height:100%;object-fit:cover}.vl-media figcaption{position:absolute;right:12px;bottom:10px;margin:0;padding:5px 8px;color:#fff;background:rgba(20,18,16,.62);font-size:9px;letter-spacing:.12em}.vl-wide{height:280px}.vl-square{width:62%;height:285px}.vl-portrait{width:58%;height:340px}.vl-placeholder.vl-wide{height:150px}.vl-placeholder.vl-square{height:180px}.vl-placeholder.vl-portrait{height:215px}.vl-placeholder{display:flex;align-items:center;justify-content:center;border:1px dashed ${theme.accent};color:${theme.primary};text-align:center}.vl-placeholder div{padding:20px}.vl-placeholder span,.vl-placeholder strong,.vl-placeholder small{display:block}.vl-placeholder span{font:italic 22px Georgia,serif}.vl-placeholder i{display:block;width:38px;height:1px;margin:12px auto;background:${theme.primary}}.vl-placeholder strong{font-size:11px;letter-spacing:.16em}.vl-placeholder small{margin-top:6px;color:${theme.muted};font-size:10px}.vl-footer{display:flex;justify-content:space-between;gap:8px;margin-top:46px;padding-top:18px;border-top:1px solid ${theme.accent};color:${theme.muted};font-size:9px;letter-spacing:.14em}
  .museum-cover{background:${theme.paper};color:${theme.dark}}.museum-frame{position:absolute;top:35px;right:35px;bottom:35px;left:35px;padding:31px 28px;border:1px solid ${theme.accent}}.museum-frame:after{position:absolute;right:-1px;bottom:-1px;width:34%;height:42%;background:${theme.primary};content:''}.museum-frame>span{font-size:9px;font-weight:800;letter-spacing:.18em}.museum-frame>b{position:absolute;top:31px;right:28px;color:${theme.primary};font:italic 18px Georgia,serif}.museum-frame h1{margin-top:168px;max-width:88%}.museum-frame p{max-width:72%;color:${theme.muted}}.museum-opening{margin:-14px 0 36px;padding:35px 28px;border:1px solid ${theme.accent};background:#fffdf8;text-align:center}.museum-opening small,.museum-opening strong{display:block}.museum-opening small{font-size:9px;letter-spacing:.2em}.museum-opening strong{margin-top:16px;font-size:20px;line-height:1.55}.museum-opening i{display:block;width:36px;height:1px;margin:18px auto 0;background:${theme.primary}}.museum-chapter{margin-top:52px}.museum-copy{padding:28px 27px;border:1px solid ${theme.accent};background:#fffdf8}.museum-chapter.is-offset{margin-left:52px}.museum-chapter .vl-square,.museum-chapter .vl-portrait{margin-left:auto;padding:9px;border:1px solid ${theme.accent};background:#fff}
  .slow-cover{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;color:#171717;text-align:center}.slow-cover>span{font:22px Georgia,serif;letter-spacing:-.03em}.slow-cover h1{max-width:520px;margin-top:55px;font-family:Georgia,'Songti SC',serif;font-weight:500}.slow-cover p{max-width:330px}.slow-cover b{margin-top:62px;font:normal 21px Georgia,serif}.slow-cover i{margin-top:13px;font:normal 9px Arial,sans-serif;letter-spacing:.16em}.slow-body{padding-right:48px;padding-left:48px;background:#fff}.slow-body .vl-lead{background:#f5f5f2;text-align:center}.slow-body .vl-lead p{text-align:center}.slow-body>.vl-portrait{margin-right:auto;margin-left:auto}.slow-chapter{display:grid;grid-template-columns:92px minmax(0,1fr);gap:26px;margin-top:72px;padding-top:25px;border-top:1px solid #d7d7d2}.slow-chapter>aside b,.slow-chapter>aside span{display:block}.slow-chapter>aside b{font:italic 34px Georgia,serif}.slow-chapter>aside span{margin-top:7px;font-size:8px;letter-spacing:.15em}.slow-chapter .vl-chapter span{display:none}.slow-chapter .vl-chapter h2{font-family:Georgia,'Songti SC',serif;font-size:29px;font-weight:500}.slow-chapter>.vl-media{grid-column:1/-1}.slow-chapter>.vl-square{width:65%;margin-right:auto;margin-left:auto}.slow-copy p{font-family:Georgia,'Songti SC',serif;font-size:17px}
  .geometry-cover{color:#fff;background:linear-gradient(135deg,${theme.primary} 0 64%,${theme.dark} 64%)}.geometry-cover>span{font-size:10px;font-weight:800;letter-spacing:.2em;line-height:1.6}.geometry-cover>i{position:absolute;top:49px;right:54px;width:76px;height:76px;border-radius:50%;background:${theme.accent}}.geometry-cover>b{position:absolute;top:70px;right:80px;z-index:1;color:${theme.dark};font-size:12px}.geometry-cover h1{margin-top:185px;max-width:89%}.geometry-cover p{max-width:78%;color:#fff6eb}.geometry-opening{display:grid;grid-template-columns:34% 66%;align-items:stretch;margin-bottom:48px}.geometry-opening>strong{display:flex;align-items:flex-end;padding:24px;color:#fff;background:${theme.dark};font-size:32px;line-height:1.08}.geometry-opening .vl-media{width:100%;height:270px;margin:0}.geometry-panel{position:relative;display:grid;grid-template-columns:46% 54%;margin-top:48px;border:1px solid ${theme.primary};background:#fff}.geometry-panel .vl-chapter{grid-column:1/-1;margin:0;padding:22px 24px;background:${theme.primary};color:#fff}.geometry-panel .vl-chapter span{color:${theme.accent}}.geometry-panel .vl-chapter h2{color:#fff}.geometry-copy{padding:27px 24px}.geometry-panel>.vl-media{width:100%;height:100%;min-height:310px;margin:0}.geometry-panel.panel-1 .geometry-copy{grid-column:2}.geometry-panel.panel-1>.vl-media{grid-column:1;grid-row:2}.geometry-panel.panel-2{grid-template-columns:1fr}.geometry-index{position:absolute;right:16px;bottom:12px;color:${theme.accent};font:bold 34px Georgia,serif}
  .archive-cover{color:#f8f3eb;background:${theme.dark}}.archive-cover:before{position:absolute;top:35px;right:35px;width:160px;height:185px;border:1px solid ${theme.primary};content:''}.archive-cover>span{color:${theme.primary};font-size:10px;font-weight:800;letter-spacing:.2em}.archive-cover>b{position:absolute;top:51px;right:55px;color:${theme.primary};font-size:9px;letter-spacing:.14em}.archive-cover h1{margin-top:195px;max-width:90%}.archive-cover p{max-width:75%;color:#d9cbbb}.archive-cover i{display:block;width:55px;height:4px;margin-top:27px;background:${theme.primary}}.archive-body{background:${theme.paper}}.archive-body>.vl-wide{border:8px solid ${theme.dark}}.archive-chapter{margin-top:58px}.archive-chapter .vl-chapter{padding-bottom:17px;border-bottom:1px solid ${theme.primary}}.archive-rule{width:38px;height:4px;margin:0 0 25px;background:${theme.dark}}.archive-copy{padding:24px 26px;border:1px solid ${theme.accent};background:#fff}.archive-chapter>.vl-square{margin-left:auto;border:8px solid ${theme.dark}}.archive-body blockquote{color:#f8f3eb;background:${theme.dark};border-left-color:${theme.primary}}
  .nature-cover{color:#fff;background:${theme.primary}}.nature-cover:before{position:absolute;right:-55px;bottom:-75px;width:245px;height:245px;border:18px solid ${theme.accent};border-radius:50%;content:''}.nature-cover>span{color:${theme.accent};font-size:10px;font-weight:900;letter-spacing:.18em}.nature-cover>i{display:block;width:42px;height:4px;margin-top:24px;background:${theme.accent}}.nature-cover>b{position:absolute;top:48px;right:42px;font-size:9px;letter-spacing:.15em}.nature-cover h1{margin-top:180px;max-width:86%}.nature-cover p{max-width:72%;color:#f1f4df}.nature-body{background:${theme.paper}}.nature-body>.vl-wide{border-radius:52px 5px 52px 5px}.nature-chapter{margin-top:52px;padding:30px 28px 8px;border-radius:40px 6px 40px 6px;background:#fff}.nature-chapter.is-right{margin-left:42px;border-radius:6px 40px 6px 40px;background:${theme.soft}}.nature-chapter .vl-chapter span{display:grid;width:42px;height:42px;place-items:center;border-radius:50%;color:#fff;background:${theme.primary};font-size:16px}.nature-chapter>.vl-square{border-radius:36px 5px 36px 5px}.nature-body blockquote{border:0;border-radius:4px 30px 4px 30px;color:#fff;background:${theme.primary}}
  .gallery-cover-safe{padding-bottom:43px;color:${theme.dark};background:${theme.paper}}.gallery-cover-safe>span{display:block;margin-bottom:28px;color:${theme.primary};font:italic 13px Georgia,serif;letter-spacing:.12em}.gallery-cover-safe>.vl-media{width:74%;height:250px;margin:0 0 35px auto;border:10px solid #fff;box-shadow:0 9px 24px rgba(80,54,45,.12)}.gallery-cover-safe h1{max-width:92%;font-family:Georgia,'Songti SC',serif;font-weight:500}.gallery-cover-safe p{max-width:75%;color:${theme.muted}}.gallery-body{background:${theme.paper}}.gallery-body .vl-lead{margin-left:44px;background:${theme.soft}}.gallery-chapter-safe{position:relative;display:grid;grid-template-columns:57% 43%;margin-top:65px;padding-top:28px;border-top:2px solid ${theme.primary}}.gallery-chapter-safe .vl-chapter{grid-column:1/-1;padding-right:65px}.gallery-copy-safe{padding:15px 28px 5px 0}.gallery-chapter-safe>.vl-media{width:100%;height:360px;margin:0;border:9px solid #fff;box-shadow:0 9px 24px rgba(80,54,45,.12)}.gallery-chapter-safe.image-first .gallery-copy-safe{grid-column:2;padding-right:0;padding-left:28px}.gallery-chapter-safe.image-first>.vl-media{grid-column:1;grid-row:2}.gallery-index{position:absolute;top:17px;right:0;color:${theme.primary};font:italic 36px Georgia,serif}.gallery-body blockquote{border-left:0;border-bottom:2px solid ${theme.primary};background:${theme.soft}}
  .museum-frame h1{margin-top:120px}.museum-opening{margin-top:-8px;margin-bottom:28px;padding-top:28px;padding-bottom:28px}.museum-chapter,.slow-chapter,.archive-chapter,.nature-chapter{margin-top:44px}.gallery-chapter-safe{margin-top:48px}.slow-cover h1{margin-top:38px}.slow-cover b{margin-top:42px}.geometry-cover h1{margin-top:135px}.geometry-opening{margin-bottom:36px}.geometry-opening .vl-placeholder{height:150px}.geometry-panel{margin-top:38px}.geometry-panel>.vl-placeholder{height:190px;min-height:190px}.archive-cover h1{margin-top:145px}.nature-cover h1{margin-top:130px}.gallery-cover-safe>.vl-placeholder{height:150px}.gallery-chapter-safe>.vl-placeholder{height:190px}
  @media(max-width:520px){body{padding:0}.wechat-article{width:100%;box-shadow:none}.vl-cover{min-height:340px;padding:34px 24px}.vl-cover h1{font-size:30px!important}.vl-body{padding:30px 20px 40px}.vl-body p{font-size:16px}.vl-body blockquote{padding:21px 20px;font-size:18px}.vl-wide{height:235px}.vl-square,.vl-portrait{width:100%;height:270px}.vl-placeholder.vl-wide{height:135px}.vl-placeholder.vl-square{height:160px}.vl-placeholder.vl-portrait{height:185px}.museum-frame{top:18px;right:20px;bottom:18px;left:20px;padding:23px 20px}.museum-frame h1{margin-top:105px}.museum-chapter.is-offset,.nature-chapter.is-right{margin-left:0}.slow-body{padding-right:25px;padding-left:25px}.slow-chapter{grid-template-columns:60px minmax(0,1fr);gap:15px}.geometry-opening,.geometry-panel,.gallery-chapter-safe{grid-template-columns:1fr}.geometry-opening>strong{min-height:110px}.geometry-panel .geometry-copy,.geometry-panel.panel-1 .geometry-copy,.geometry-panel.panel-1>.vl-media,.gallery-chapter-safe.image-first .gallery-copy-safe,.gallery-chapter-safe.image-first>.vl-media{grid-column:1;grid-row:auto}.geometry-panel>.vl-media,.gallery-chapter-safe>.vl-media{height:235px;min-height:0}.geometry-panel>.vl-placeholder,.gallery-chapter-safe>.vl-placeholder{height:160px;min-height:160px}.gallery-copy-safe,.gallery-chapter-safe.image-first .gallery-copy-safe{padding:10px 0}.gallery-cover-safe>.vl-media{width:100%;height:210px}.gallery-cover-safe>.vl-placeholder{height:135px}.nature-chapter{padding-right:20px;padding-left:20px}}
  </style></head><body><article class="wechat-article">${body}</article></body></html>`;
}

function buildWechatLayoutHtml(layout, themeCode, images = []) {
  const theme = WECHAT_LAYOUT_THEMES[themeCode] || WECHAT_LAYOUT_THEMES.museum;
  if (state.wechatLayout.mode === 'visual') return buildWechatVisualLongformHtml(layout, theme, images);
  const segments = Array.isArray(layout?.segments) ? layout.segments : [];
  const byIndex = new Map(segments.map((item) => [Number(item.index), item]));
  const title = byIndex.get(Number(layout?.title_index))?.text || segments[0]?.text || '公众号文章';
  const subtitle = Number(layout?.subtitle_index) >= 0 ? byIndex.get(Number(layout.subtitle_index))?.text || '' : '';
  const headings = new Set(layout?.heading_indexes || []);
  const highlights = new Set(layout?.highlight_indexes || []);
  const imageAfter = new Set(layout?.image_after_indexes || []);
  let chapter = 0;
  let imageCursor = 0;
  let bodyStarted = false;
  let contentOrdinal = 0;
  const content = [];
  const serif = theme.variant === 'slow' ? "Georgia,'Times New Roman','Songti SC',serif" : "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif";
  const darkText = theme.darkMode ? '#EFF7F5' : theme.ink;
  const paragraphStyle = `margin:0 0 22px;color:${darkText};font-size:${theme.variant === 'slow' ? '17px' : '16px'};line-height:2.02;letter-spacing:.035em;text-align:justify;font-family:${serif};`;
  const chapterLayout = (number, text) => {
    if (theme.variant === 'geometry') return `<section style="position:relative;margin:48px 0 30px;padding:22px 22px 19px;background:${theme.primary};color:#fff;"><span style="position:absolute;top:-13px;right:18px;display:grid;width:42px;height:42px;place-items:center;border-radius:50%;color:${theme.dark};background:${theme.accent};font-size:11px;font-weight:900;">${String(number).padStart(2, '0')}</span><span style="display:block;margin-bottom:10px;font-size:9px;font-weight:800;letter-spacing:.2em;">SECTION</span><h2 style="margin:0;color:#fff;font-size:25px;line-height:1.4;">${text}</h2></section>`;
    if (theme.variant === 'noir') return `<section style="margin:52px 0 30px;padding:18px 0;border-top:1px solid ${theme.primary};border-bottom:1px solid ${theme.primary};"><span style="display:block;margin-bottom:8px;color:${theme.primary};font-family:Arial,sans-serif;font-size:10px;font-weight:900;letter-spacing:.23em;">${String(number).padStart(2, '0')} / CHAPTER</span><h2 style="margin:0;color:${theme.dark};font-size:26px;line-height:1.42;">${text}</h2></section>`;
    if (theme.variant === 'nature') return `<section style="margin:48px 0 28px;padding:17px 20px;border-left:10px solid ${theme.primary};background:${theme.soft};"><span style="display:block;margin-bottom:7px;color:${theme.primary};font-size:10px;font-weight:900;letter-spacing:.15em;">FIELD NOTE · ${String(number).padStart(2, '0')}</span><h2 style="margin:0;color:${theme.dark};font-size:24px;line-height:1.45;">${text}</h2></section>`;
    if (theme.variant === 'gallery') return `<section style="margin:48px 0 28px;padding:0 0 15px;border-bottom:2px solid ${theme.primary};"><span style="display:inline-block;margin-bottom:10px;color:${theme.primary};font-family:Georgia,serif;font-size:22px;font-style:italic;">${String(number).padStart(2, '0')}</span><h2 style="margin:0;color:${theme.dark};font-size:26px;font-family:Georgia,'Songti SC',serif;line-height:1.45;">${text}</h2></section>`;
    if (theme.variant === 'slow') return `<section style="margin:56px 0 30px;text-align:center;"><span style="display:block;margin-bottom:8px;color:${theme.muted};font-family:Georgia,serif;font-size:16px;font-style:italic;">${String(number).padStart(2, '0')}</span><h2 style="margin:0;color:${theme.dark};font-family:Georgia,'Songti SC',serif;font-size:29px;font-weight:500;line-height:1.38;">${text}</h2><span style="display:block;width:34px;height:1px;margin:17px auto 0;background:${theme.primary};"></span></section>`;
    return `<section style="margin:48px 0 28px;padding:0 0 14px;border-bottom:1px solid ${theme.accent};"><span style="display:block;margin-bottom:8px;color:${theme.primary};font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;">CHAPTER ${String(number).padStart(2, '0')}</span><h2 style="margin:0;color:${theme.dark};font-size:25px;font-weight:700;line-height:1.45;letter-spacing:.02em;">${text}</h2></section>`;
  };
  const highlightLayout = (text) => {
    if (theme.variant === 'slow') return `<section style="margin:38px 0;padding:14px 8px;border-top:1px solid ${theme.accent};border-bottom:1px solid ${theme.accent};"><p style="margin:0;color:${theme.dark};font-family:Georgia,'Songti SC',serif;font-size:22px;font-weight:500;line-height:1.75;text-align:center;">${text}</p></section>`;
    if (theme.variant === 'noir') return `<section style="margin:36px 0;padding:28px 24px;background:${theme.primary};"><p style="margin:0;color:${theme.dark};font-size:20px;font-weight:800;line-height:1.75;letter-spacing:.04em;">${text}</p></section>`;
    if (theme.variant === 'nature') return `<section style="margin:34px 0;padding:25px 25px 24px;border-radius:0 34px 0 34px;background:${theme.primary};"><p style="margin:0;color:#fff;font-size:19px;font-weight:700;line-height:1.8;letter-spacing:.04em;">${text}</p></section>`;
    return `<section style="position:relative;margin:34px 0;padding:26px 28px;border-left:5px solid ${theme.primary};background:${theme.soft};"><span style="position:absolute;top:10px;right:18px;color:${theme.accent};font-family:Georgia,serif;font-size:38px;line-height:1;">”</span><p style="margin:0;padding-right:16px;color:${theme.dark};font-size:19px;font-weight:700;line-height:1.8;letter-spacing:.04em;">${text}</p></section>`;
  };
  const paragraphLayout = (text, ordinal, intro = false) => {
    const side = ordinal % 2 === 0 ? 'left' : 'right';
    if (theme.variant === 'museum') return `<section style="position:relative;margin:${intro ? '0 0 38px' : '28px 0'};padding:${intro ? '27px 25px 29px' : '22px 24px'};border:1px solid ${theme.accent};background:${ordinal % 2 ? theme.soft : '#FDFCF5'};"><span style="position:absolute;${side}:14px;top:-10px;color:${theme.primary};background:${theme.paper};padding:0 7px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:.16em;">EXHIBIT · ${String(ordinal + 1).padStart(2, '0')}</span><p style="${paragraphStyle}margin:0;">${text}</p></section>`;
    if (theme.variant === 'slow') return `<section style="margin:${intro ? '0 0 46px' : '34px 0'};padding:${intro ? '0 16px 30px' : '0 16px'};${intro ? `border-bottom:1px solid ${theme.accent};` : ''}"><span style="display:block;margin-bottom:9px;color:${theme.muted};font-family:Georgia,serif;font-size:12px;font-style:italic;">${String(ordinal + 1).padStart(2, '0')} / ${ordinal % 2 ? 'AFTERNOON' : 'MORNING'}</span><p style="${paragraphStyle}margin:0;font-size:${intro ? '20px' : '17px'};font-family:Georgia,'Songti SC',serif;">${text}</p></section>`;
    if (theme.variant === 'geometry') return `<section style="display:grid;grid-template-columns:${ordinal % 2 ? '1fr 52px' : '52px 1fr'};gap:15px;margin:${intro ? '0 0 34px' : '25px 0'};align-items:start;"><span style="display:grid;${ordinal % 2 ? '' : 'grid-column:1;'}width:52px;height:52px;place-items:center;color:${ordinal % 2 ? '#fff' : theme.dark};background:${ordinal % 2 ? theme.dark : theme.primary};font-size:12px;font-weight:900;">${String(ordinal + 1).padStart(2, '0')}</span><p style="${paragraphStyle}grid-column:${ordinal % 2 ? '1' : '2'};margin:0;padding:${intro ? '19px 18px' : '8px 0'};${intro ? `background:${theme.soft};border-top:5px solid ${theme.primary};` : ''}">${text}</p></section>`;
    if (theme.variant === 'noir') return `<section style="position:relative;margin:${intro ? '0 0 38px' : '28px 0'};padding:${intro ? '25px 24px 26px' : '21px 22px'};border:${intro ? `1px solid ${theme.primary}` : `1px solid ${theme.soft}`};background:${ordinal % 2 ? theme.soft : theme.paper};"><span style="position:absolute;${side}:18px;top:-9px;color:${theme.primary};background:${theme.paper};padding:0 7px;font-family:Arial,sans-serif;font-size:9px;font-weight:900;letter-spacing:.16em;">ARCHIVE ${String(ordinal + 1).padStart(2, '0')}</span><p style="${paragraphStyle}margin:0;">${text}</p></section>`;
    if (theme.variant === 'nature') return `<section style="position:relative;margin:${intro ? '0 0 35px' : '27px 0'};padding:${intro ? '24px 24px 26px' : '21px 23px'};border-radius:${ordinal % 2 ? '28px 5px 28px 5px' : '5px 28px 5px 28px'};background:${ordinal % 2 ? '#fff' : theme.soft};"><span style="position:absolute;${side}:18px;top:-12px;display:grid;width:27px;height:27px;place-items:center;border-radius:50%;color:#fff;background:${theme.primary};font-size:13px;">${ordinal % 2 ? '⌁' : '•'}</span><p style="${paragraphStyle}margin:0;">${text}</p></section>`;
    if (theme.variant === 'gallery') return `<section style="margin:${intro ? '0 0 38px' : '30px 0'};padding:${intro ? '26px 24px' : '0 0 0 22px'};border-left:${intro ? '0' : `2px solid ${theme.primary}`};background:${intro ? theme.soft : 'transparent'};"><span style="display:block;margin-bottom:10px;color:${theme.primary};font-family:Georgia,serif;font-size:13px;font-style:italic;">Story / ${String(ordinal + 1).padStart(2, '0')}</span><p style="${paragraphStyle}margin:0;font-family:Georgia,'Songti SC',serif;font-size:${intro ? '19px' : '17px'};">${text}</p></section>`;
    return `<p style="${paragraphStyle}">${text}</p>`;
  };
  const renderImage = () => {
    const image = images[imageCursor];
    imageCursor += 1;
    const imageBorder = theme.variant === 'geometry' ? `border:10px solid ${theme.primary};` : theme.variant === 'noir' ? `border:1px solid ${theme.primary};` : theme.variant === 'gallery' ? `border:12px solid #fff;box-shadow:0 10px 24px rgba(75,50,42,.14);` : theme.variant === 'museum' ? `border:18px solid ${theme.soft};outline:1px solid ${theme.accent};outline-offset:-8px;` : '';
    const imageWidth = theme.variant === 'slow' ? '76%' : theme.variant === 'nature' ? '88%' : '100%';
    const imageAlign = theme.variant === 'slow' ? 'margin-left:auto;margin-right:auto;' : theme.variant === 'nature' ? 'margin-left:0;' : '';
    const placeholderShape = theme.variant === 'geometry' ? `clip-path:polygon(0 0,92% 0,100% 16%,100% 100%,8% 100%,0 84%);` : theme.variant === 'nature' ? 'border-radius:42px 4px 42px 4px;' : '';
    if (image?.dataUrl) return `<section style="margin:40px 0 44px;text-align:${theme.variant === 'slow' ? 'center' : 'left'};"><img src="${image.dataUrl}" alt="文章配图" style="display:block;width:${imageWidth};height:auto;${imageAlign}${imageBorder}"/><p style="margin:12px 0 0;color:${theme.muted};font-size:10px;line-height:1.6;text-align:${theme.variant === 'slow' ? 'center' : 'left'};letter-spacing:.14em;">FIG. ${String(imageCursor).padStart(2, '0')} · ARTICLE IMAGE</p></section>`;
    return `<section style="display:flex;min-height:${theme.variant === 'slow' ? '280px' : '220px'};width:${imageWidth};${imageAlign}margin-top:40px;margin-bottom:44px;align-items:center;justify-content:center;border:1px dashed ${theme.accent};${placeholderShape}background:${theme.soft};color:${theme.primary};text-align:center;"><div><strong style="display:block;font-size:13px;letter-spacing:.1em;">建议插入文章图片</strong><span style="display:block;margin-top:7px;font-size:11px;color:${theme.darkMode ? '#B8CED0' : theme.muted};">课堂现场 / 学员变化 / 细节特写</span></div></section>`;
  };
  segments.forEach((segment) => {
    const index = Number(segment.index);
    if (index === Number(layout?.title_index) || index === Number(layout?.subtitle_index)) return;
    const text = wechatLayoutText(segment.text);
    if (headings.has(index)) {
      chapter += 1;
      content.push(chapterLayout(chapter, text));
    } else if (highlights.has(index)) {
      content.push(highlightLayout(text));
    } else if (/^(?:[-*•·]|\d+[.)、])\s*/.test(segment.text)) {
      content.push(`<section style="margin:18px 0 24px;padding:16px 20px;border:1px solid ${theme.soft};background:#fff;"><p style="${paragraphStyle}margin:0;">${text}</p></section>`);
    } else if (!bodyStarted) {
      bodyStarted = true;
      content.push(paragraphLayout(text, contentOrdinal, true));
      contentOrdinal += 1;
    } else if (index === Number(layout?.closing_index)) {
      content.push(`<section style="margin:46px 0 0;padding:32px 30px;background:${theme.dark};${theme.variant === 'nature' ? 'border-radius:32px 0 32px 0;' : ''}"><span style="display:block;margin-bottom:13px;color:${theme.accent};font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:.2em;">写在最后</span><p style="margin:0;color:#FFF9F3;font-size:18px;font-weight:600;line-height:1.9;letter-spacing:.04em;">${text}</p></section>`);
    } else {
      content.push(paragraphLayout(text, contentOrdinal));
      contentOrdinal += 1;
    }
    if (imageAfter.has(index)) content.push(renderImage());
  });
  const coverBackground = theme.variant === 'museum' ? `linear-gradient(135deg,${theme.paper} 0 68%,${theme.primary} 68% 100%)` : theme.variant === 'slow' ? '#fff' : theme.variant === 'geometry' ? `linear-gradient(120deg,${theme.primary} 0 56%,${theme.accent} 56% 72%,${theme.paper} 72%)` : theme.variant === 'nature' ? `linear-gradient(160deg,${theme.primary} 0 64%,${theme.soft} 64%)` : theme.dark;
  const coverText = theme.variant === 'slow' ? theme.dark : theme.variant === 'museum' ? theme.dark : '#FFF9F3';
  const coverTitleFont = theme.variant === 'slow' || theme.variant === 'gallery' ? "Georgia,'Songti SC',serif" : "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif";
  const coverDecoration = theme.variant === 'museum' ? `<span style="position:absolute;top:32px;right:32px;width:88px;height:88px;border:1px solid ${theme.primary};border-radius:50%;opacity:.55;"></span>` : theme.variant === 'slow' ? `<span style="position:absolute;top:30px;right:32px;color:${theme.muted};font-family:Georgia,serif;font-size:34px;font-style:italic;">01</span>` : theme.variant === 'geometry' ? `<span style="position:absolute;top:28px;right:31px;width:56px;height:56px;border-radius:50%;background:${theme.paper};"></span>` : theme.variant === 'nature' ? `<span style="position:absolute;top:25px;right:28px;color:${theme.soft};font-size:34px;">〰</span>` : '';
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>*{box-sizing:border-box}@media(max-width:520px){body{padding:0!important;background:${theme.paper}!important}.wechat-article{width:100%!important;box-shadow:none!important}.wechat-cover{min-height:330px!important;padding:44px 24px 36px!important}.wechat-cover h1{font-size:31px!important}.wechat-content{padding:38px 24px 46px!important}}</style></head><body style="margin:0;background:#EAE5DF;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;"><main class="wechat-article" style="box-sizing:border-box;width:677px;max-width:100%;margin:0 auto;background:${theme.paper};box-shadow:0 12px 45px rgba(58,42,31,.12);"><section class="wechat-cover" style="position:relative;min-height:390px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;padding:52px 32px 42px;background:${coverBackground};">${coverDecoration}<span style="position:relative;display:block;margin-bottom:26px;color:${theme.variant === 'slow' || theme.variant === 'museum' ? theme.primary : theme.accent};font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:.24em;">${theme.label}</span><h1 style="position:relative;margin:0;color:${coverText};font-family:${coverTitleFont};font-size:38px;font-weight:${theme.variant === 'slow' ? '500' : '750'};line-height:1.34;letter-spacing:.02em;">${wechatLayoutText(title)}</h1>${subtitle ? `<p style="position:relative;margin:22px 0 0;padding-top:18px;border-top:1px solid ${theme.accent};color:${theme.variant === 'slow' || theme.variant === 'museum' ? theme.muted : theme.soft};font-size:16px;line-height:1.75;letter-spacing:.05em;">${wechatLayoutText(subtitle)}</p>` : ''}<span style="position:relative;display:block;width:52px;height:6px;margin-top:34px;background:${theme.primary};"></span></section><article class="wechat-content" style="padding:44px 24px 52px;">${content.join('')}<footer style="margin-top:46px;padding-top:22px;border-top:1px solid ${theme.soft};color:${theme.muted};font-family:Arial,sans-serif;font-size:10px;letter-spacing:.16em;text-align:center;">END · ${escapeHtml(theme.name)}</footer></article></main></body></html>`;
}

function renderWechatLayoutImages() {
  const container = $('wechatLayoutImageList');
  if (!container) return;
  const images = state.wechatLayout.images || [];
  container.innerHTML = images.length ? images.map((item, index) => `<div class="wechat-image-thumb"><img src="${item.dataUrl}" alt="文章图片 ${index + 1}"/><button type="button" data-remove-wechat-image="${index}" title="移除">×</button></div>`).join('') : '<span>暂未上传，预览中会保留图片位置</span>';
}

function refreshWechatLayoutPreview() {
  const activeLayout = state.wechatLayout.layouts?.[state.wechatLayout.theme] || state.wechatLayout.layout;
  if (!activeLayout) return;
  const html = buildWechatLayoutHtml(activeLayout, state.wechatLayout.theme, state.wechatLayout.images);
  state.wechatLayout.html = html;
  const frame = $('wechatLayoutPreview');
  frame.onload = () => {
    try {
      frame.style.height = `${Math.max(760, frame.contentDocument.documentElement.scrollHeight + 12)}px`;
    } catch {}
  };
  frame.srcdoc = html;
  frame.classList.remove('hidden');
  $('wechatLayoutEmpty').classList.add('hidden');
  ['copyWechatLayout', 'exportWechatPng', 'exportWechatMarkdown', 'exportWechatHtml'].forEach((id) => { $(id).disabled = false; });
}

function renderWechatLayoutWorkspace() {
  document.querySelectorAll('[data-wechat-mode]').forEach((button) => button.classList.toggle('active', button.dataset.wechatMode === state.wechatLayout.mode));
  document.querySelectorAll('[data-wechat-theme]').forEach((button) => button.classList.toggle('active', button.dataset.wechatTheme === state.wechatLayout.theme));
  renderWechatLayoutImages();
  if (state.wechatLayout.layout || Object.keys(state.wechatLayout.layouts || {}).length) refreshWechatLayoutPreview();
}

async function generateWechatLayout() {
  const article = value('wechatLayoutArticle').trim();
  if (article.length < 30) {
    $('wechatLayoutStatus').textContent = '请先粘贴至少 30 个字的完整文章。';
    $('wechatLayoutArticle').focus();
    return;
  }
  state.wechatLayout.article = article;
  setButtonLoading('generateWechatLayout', true, '正在识别文章结构…');
  $('wechatLayoutStatus').textContent = '正在识别标题、章节、金句和图片位置；不会改写原文。';
  $('wechatLayoutModelStatus').textContent = '智能分析中';
  try {
    const result = await apiRequest('wechatLayout', { article, theme: state.wechatLayout.theme });
    state.wechatLayout.layout = result.layout;
    state.wechatLayout.layouts = {};
    state.wechatLayout.result = result;
    refreshWechatLayoutPreview();
    $('wechatLayoutModelStatus').textContent = result.model_skipped ? '快速结构识别 · 已完成' : result.degraded ? '本地结构识别 · 已完成' : '模型识别 · 已完成';
    $('wechatLayoutStatus').textContent = `排版完成：识别 ${result.layout?.segments?.length || 0} 个内容段落。现在可切换不同视觉模板。`;
    addRecord('公众号排版', result.layout?.segments?.find((item) => item.index === result.layout.title_index)?.text || '公众号排版', article);
  } catch (error) {
    $('wechatLayoutModelStatus').textContent = '排版失败';
    $('wechatLayoutStatus').textContent = error.message || '排版失败，请稍后重试。';
  } finally {
    setButtonLoading('generateWechatLayout', false);
  }
}

async function handleWechatLayoutImages(files) {
  const selected = [...(files || [])].filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type)).slice(0, Math.max(0, 6 - state.wechatLayout.images.length));
  const images = [];
  for (const file of selected) {
    if (file.size > 8 * 1024 * 1024) continue;
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });
    images.push({ name: file.name, dataUrl });
  }
  state.wechatLayout.images.push(...images);
  renderWechatLayoutImages();
  if (state.wechatLayout.layout) refreshWechatLayoutPreview();
  $('wechatLayoutStatus').textContent = images.length ? `已加入 ${images.length} 张图片，系统会按顺序放入文章图片位。` : '图片未加入：请使用 JPG、PNG 或 WebP，单张不超过 8MB。';
}

function downloadWechatLayoutFile(filename, content, type) {
  const blob = new Blob([content || ''], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function exportWechatLayoutPng() {
  const frame = $('wechatLayoutPreview');
  const documentRef = frame.contentDocument;
  const article = documentRef?.querySelector('.wechat-article');
  if (!article) return showToast('请先完成一篇公众号排版');
  setButtonLoading('exportWechatPng', true, '正在生成长图…');
  try {
    const width = 677;
    const height = Math.ceil(article.getBoundingClientRect().height);
    const styles = [...documentRef.querySelectorAll('style')].map((style) => style.textContent || '').join('\n');
    const articleXml = new XMLSerializer().serializeToString(article);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${styles}</style>${articleXml}</div></foreignObject></svg>`;
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('视觉长图渲染失败'));
      element.src = svgUrl;
    });
    const scale = Math.max(.65, Math.min(2, 16000 / Math.max(height, 1)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(svgUrl);
    const png = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1));
    if (!png) throw new Error('视觉长图生成失败');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(png);
    link.download = wechatLayoutFilename('png');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast('视觉长图已导出');
  } catch (error) {
    showToast(error.message || '视觉长图生成失败');
  } finally {
    setButtonLoading('exportWechatPng', false);
  }
}

async function copyWechatLayoutRichText() {
  const frame = $('wechatLayoutPreview');
  const article = frame.contentDocument?.querySelector('.wechat-article');
  if (!article) return;
  const html = article.outerHTML;
  const plain = article.innerText;
  try {
    if (window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' })
      })]);
      showToast('公众号格式已复制，可粘贴到编辑器');
      return;
    }
    await navigator.clipboard.writeText(plain);
    showToast('当前浏览器已复制纯文字，可导出 HTML 保留完整样式');
  } catch (error) {
    alert(`复制失败：${error.message}`);
  }
}

function mockCopy(payload) {
  if (payload.type === 'moments') {
    return `今天想和${payload.audience}聊一个很常见的情况：${payload.material}。\n\n很多时候，问题不是不努力，而是还没判断清楚到底卡在哪个环节。\n\n如果是${payload.business}，我会建议先看三个地方：过程有没有被记录，反馈有没有被复盘，下一步动作有没有足够小。\n\n先把问题说清楚，信任才会慢慢发生。`;
  }
  if (payload.type === 'imageText') {
    return `封面：${payload.material}\n\n第1页：先别急着找方法\n第2页：先看现象、原因、动作\n第3页：${payload.business}真正要解决的是可感知结果\n第4页：给${payload.audience}一个能马上理解的判断\n结尾：收藏这组判断，下次遇到类似问题先按这个顺序排查。`;
  }
  if (payload.type === 'article') {
    return `标题：${payload.material}\n\n开头：先从${payload.audience}最常遇到的具体问题切入。\n\n一、现象：${payload.business}中，这个问题通常会表现为哪些具体情况。\n\n二、判断：不要只看表面结果，还要拆出背后的原因和关键误区。\n\n三、方法：给出 2-3 个可以执行的检查和调整动作。\n\n结尾：把问题说清楚、把动作做具体，教育内容才更容易真正帮助到人。`;
  }
  return `标题：${payload.material}\n\n开头3秒：很多${payload.audience}以为问题出在不够努力，但真实情况可能不是这样。\n\n正文：做${payload.business}，先别急着加量。第一步看现象，第二步找原因，第三步把动作缩小到能执行。只要这三步没拆清楚，后面再努力也容易重复消耗。\n\n结尾CTA：如果你也卡在这个问题，可以先把具体情况发来，我们一起判断下一步。`;
}

async function generateCopy() {
  const material = value('copyMaterial').trim();
  if (!material) {
    $('copyMaterial').focus();
    return;
  }
  const activeSession = state.copySessions.find((item) => item.id === state.activeCopySessionId);
  const payload = {
    agent: value('copyAgent') || 'local_city',
    type: value('copyType'),
    business: value('copyBusiness') || '教育业务',
    audience: value('copyAudience') || '目标客户',
    material,
    history: (activeSession?.messages || []).slice(-6).map((message) => ({ user: message.prompt, assistant: message.content }))
  };
  if (state.user.role === 'training' && payload.type !== 'short') {
    alert('训练营学员暂时只开放短视频文案。');
    $('copyType').value = 'short';
    return;
  }
  const typeName = payload.type === 'moments' ? '朋友圈文案' : payload.type === 'imageText' ? '小绿书文案' : payload.type === 'article' ? '公众号文案' : '短视频文案';
  const generationId = `copy-generation-${Date.now()}`;
  state.copyGeneration = { id: generationId, payload, typeName };
  renderCopyConversation(activeSession, payload.material);
  $('copyMaterial').value = '';
  setButtonLoading('generateCopy', true, '…');
  try {
    const apiResult = await apiRequest('copywriting', payload);
    const content = apiResult?.content || apiResult?.message || mockCopy(payload);
    const session = saveCopySession(payload, typeName, content);
    if (state.copyGeneration?.id === generationId) state.copyGeneration = null;
    if (state.page === 'copy' && state.copyView === 'compose') renderCopyConversation(session);
    addRecord(typeName, `${payload.business}${typeName}`, content, { conversationKey: session.id, conversationTitle: session.title });
  } catch (error) {
    if (API_CONFIG.useMockWhenEmpty) {
      const content = mockCopy(payload);
      const session = saveCopySession(payload, typeName, content);
      if (state.copyGeneration?.id === generationId) state.copyGeneration = null;
      if (state.page === 'copy' && state.copyView === 'compose') renderCopyConversation(session);
      addRecord(typeName, `${payload.business}${typeName}`, content, { conversationKey: session.id, conversationTitle: session.title });
    } else {
      if (state.copyGeneration?.id === generationId) state.copyGeneration = null;
      if (state.page === 'copy' && state.copyView === 'compose') renderCopyConversation(activeSession, payload.material, errorHtml(error.message));
    }
  } finally {
    if (state.copyGeneration?.id === generationId) state.copyGeneration = null;
    setButtonLoading('generateCopy', false);
  }
}

function formatCompetitorMetric(metric) {
  const amount = Number(metric) || 0;
  return amount >= 10000 ? `${(amount / 10000).toFixed(amount >= 100000 ? 0 : 1)}万` : String(amount);
}

function renderCompetitorTrends() {
  const container = $('competitorHotRanking');
  const meta = $('competitorTrendMeta');
  if (!container || !meta) return;
  const trends = state.competitorTrends;
  if (trends.loading) {
    container.innerHTML = '<div class="competitor-trend-state"><strong>正在同时读取抖音与小红书教育热词…</strong><span>两个平台分别联网更新，本次不调用大模型。</span></div>';
    meta.textContent = '双平台实时读取中';
    return;
  }
  if (trends.error) {
    container.innerHTML = `<div class="competitor-trend-state error"><strong>热词榜暂时未读取</strong><span>${escapeHtml(trends.error)}</span><button class="secondary mini" type="button" data-competitor-trends-retry>重试</button></div>`;
    meta.textContent = 'TikHub 连接异常';
    return;
  }
  const platforms = trends.platforms || {};
  const hasPlatformItems = Object.values(platforms).some((item) => Array.isArray(item?.items) && item.items.length);
  if (!hasPlatformItems && !trends.items.length) {
    container.innerHTML = '<div class="competitor-trend-state"><strong>等待首次读取</strong><span>进入本页后自动获取抖音与小红书各 Top 10。</span></div>';
    return;
  }
  const formatUpdatedAt = (value) => {
    if (!value) return '更新时间待同步';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '更新时间待同步';
    return `更新至今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  };
  const renderPlatform = (platform, label, scope) => {
    const details = platforms[platform] || (platform === 'douyin' ? { ...(trends.meta || {}), items: trends.items || [] } : {});
    const items = Array.isArray(details.items) ? details.items.slice(0, 10) : [];
    const list = items.length
      ? items.map((item) => `<button type="button" data-competitor-keyword="${escapeHtml(item.keyword)}" data-competitor-trend-channel="${platform}"><b>${String(item.rank).padStart(2, '0')}</b><span>${escapeHtml(item.keyword)}</span><small>${item.heat ? `热度 ${formatCompetitorMetric(item.heat)}` : '去搜索 →'}</small></button>`).join('')
      : `<div class="competitor-trend-platform-empty"><strong>${escapeHtml(label)}暂未读取</strong><span>${escapeHtml(details.error || '可点击右上角重试')}</span></div>`;
    return `<section class="competitor-trend-platform"><header><div><span>${escapeHtml(label)}</span><strong>教育内容热词 Top 10</strong><small>${escapeHtml(scope)}</small></div><time>${escapeHtml(formatUpdatedAt(details.refreshed_at))}</time></header><div class="competitor-trend-list">${list}</div></section>`;
  };
  container.innerHTML = `${renderPlatform('douyin', '抖音', '实时教育搜索榜')}${renderPlatform('xiaohongshu', '小红书', '教育搜索联想热词')}`;
  const details = trends.meta || {};
  meta.textContent = `${details.cached ? '当前为最新缓存' : '已联网更新'} · 每 30 分钟自动刷新`;
}

async function loadCompetitorTrends() {
  state.competitorTrends = { ...state.competitorTrends, loading: true, error: '' };
  renderCompetitorTrends();
  try {
    const result = await apiRequest('competitorTrends', {}, { method: 'GET' });
    state.competitorTrends = {
      loaded: true,
      loading: false,
      platforms: result?.platforms || {},
      items: Array.isArray(result?.items) ? result.items.slice(0, 10) : [],
      meta: result || null,
      error: ''
    };
  } catch (error) {
    state.competitorTrends = { loaded: false, loading: false, platforms: {}, items: [], meta: null, error: error.message || '热词榜读取失败' };
  }
  renderCompetitorTrends();
}

function renderCompetitorQuota() {
  const quotaLabel = $('competitorQuotaStatus');
  const searchButton = $('competitorSearchButton');
  const resultCount = $('competitorResultCount');
  const channelSelect = $('competitorChannel');
  if (!quotaLabel || !searchButton || !resultCount || !channelSelect) return;
  const quota = state.competitorQuota;
  if (quota.loading && !quota.loaded) quotaLabel.textContent = '正在读取今日额度…';
  else quotaLabel.textContent = `今日已用 ${Number(quota.used || 0)} / ${Number(quota.limit || 100)} 条 · 剩余 ${Number(quota.remaining ?? 100)} 条`;
  const exhausted = quota.loaded && Number(quota.remaining) <= 0;
  searchButton.disabled = exhausted || Boolean(state.competitorFinder.loading);
  resultCount.disabled = exhausted || Boolean(state.competitorFinder.loading);
  channelSelect.disabled = exhausted || Boolean(state.competitorFinder.loading);
  if (exhausted) searchButton.textContent = '今日额度已用完';
  else if (!state.competitorFinder.loading) searchButton.textContent = '开始搜索';
}

async function loadCompetitorQuota() {
  state.competitorQuota = { ...state.competitorQuota, loading: true };
  renderCompetitorQuota();
  try {
    const result = await apiRequest('competitorQuota', {}, { method: 'GET' });
    state.competitorQuota = { ...state.competitorQuota, ...result, loaded: true, loading: false };
  } catch {
    state.competitorQuota = { ...state.competitorQuota, loading: false };
  }
  renderCompetitorQuota();
}

function renderCompetitorFinder() {
  const container = $('competitorSearchResults');
  const status = $('competitorSearchStatus');
  if (!container || !status) return;
  const finder = state.competitorFinder;
  if (finder.loading) {
    container.innerHTML = `<div class="competitor-empty"><strong>正在搜索${escapeHtml(finder.channelLabel || '抖音')}教育精品内容…</strong><span>正在为你筛选更匹配的内容，请稍候。</span></div>`;
    return;
  }
  if (!finder.items.length) {
    container.innerHTML = '<div class="competitor-empty"><strong>还没有搜索结果</strong><span>可从上方教育热搜开始，或输入一个更具体的教育关键词。</span></div>';
    return;
  }
  status.textContent = `已从${finder.channelLabel || '抖音'}找到 ${finder.items.length} 条“${finder.keyword}”教育精品内容，均通过教育相关性过滤。今日剩余 ${Number(state.competitorQuota.remaining ?? 100)} 条。`;
  container.innerHTML = finder.items.map((item) => {
    const transcript = finder.transcripts[item.id];
    const sourceUrl = item.source_url || item.sourceUrl || '';
    const coverContent = `${item.cover_url || item.coverUrl ? `<img src="${escapeHtml(item.cover_url || item.coverUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" />` : '<span>原视频画面加载中</span>'}<b>${sourceUrl ? '▶ 打开原内容' : escapeHtml(item.channel_label || finder.channelLabel || '平台内容')}</b>`;
    const cover = sourceUrl
      ? `<a class="competitor-video-cover" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer" aria-label="打开原内容：${escapeHtml(item.title || '竞品视频')}">${coverContent}</a>`
      : `<div class="competitor-video-cover unavailable" aria-label="${escapeHtml(item.channel_label || finder.channelLabel || '平台')}内容暂时没有网页外链">${coverContent}</div>`;
    const sourceAction = sourceUrl
      ? `<a class="secondary" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">打开原内容</a>`
      : '<button class="secondary" type="button" disabled>暂无网页外链</button>';
    const transcriptAction = item.can_transcribe
      ? `<button class="primary" data-competitor-extract="${escapeHtml(item.id)}">${transcript ? '重新提取' : '提取文案'}</button>`
      : '<button class="primary" type="button" disabled>暂不支持提取</button>';
    return `<article class="competitor-video-card">
      ${cover}
      <div class="competitor-video-channel"><span>${escapeHtml(item.channel_label || finder.channelLabel || '抖音')}</span></div>
      <div class="competitor-video-top"><span>爆款指数 <b>${Number(item.score || item.match_score || 60)}</b></span><small>教育匹配 ${Number(item.education_score || 0)} · ${item.duration ? `${item.duration} 秒` : '视频内容'}</small></div>
      <h3 title="${escapeHtml(item.title || '')}">${escapeHtml(item.title || '未命名内容')}</h3>
      <p class="competitor-author">${escapeHtml(item.author || '未知账号')}</p>
      <div class="competitor-metrics"><span>赞 ${formatCompetitorMetric(item.likes)}</span><span>评 ${formatCompetitorMetric(item.comments)}</span><span>转 ${formatCompetitorMetric(item.shares)}</span><span>藏 ${formatCompetitorMetric(item.collects)}</span></div>
      <div class="competitor-card-actions">
        ${sourceAction}
        ${transcriptAction}
      </div>
      ${transcript?.loading ? '<div class="competitor-transcript loading">正在提取视频口播，请稍候…</div>' : ''}
      ${transcript?.error ? `<div class="competitor-transcript error">提取失败：${escapeHtml(transcript.error)}</div>` : ''}
      ${transcript?.content ? `<div class="competitor-transcript"><strong>${transcript.degraded ? '原平台发布文案' : '视频口播文案'}</strong>${transcript.notice ? `<small>${escapeHtml(transcript.notice)}</small>` : ''}<p>${escapeHtml(transcript.content)}</p><div><button class="secondary" data-competitor-copy="${escapeHtml(item.id)}">一键复制</button><button class="primary" data-competitor-to-agent="${escapeHtml(item.id)}">带着文案去智能体</button></div></div>` : ''}
    </article>`;
  }).join('');
}

async function searchCompetitorFinder(keyword = value('competitorSearchInput'), options = {}) {
  const normalizedKeyword = String(keyword || '').trim();
  const searchSource = options.source === 'trend' ? 'trend' : 'manual';
  const requestedCount = [5, 10, 20].includes(Number(value('competitorResultCount'))) ? Number(value('competitorResultCount')) : 10;
  const requestedChannel = ['douyin', 'wechat_channels', 'xiaohongshu'].includes(options.channel) ? options.channel : value('competitorChannel');
  const channel = ['douyin', 'wechat_channels', 'xiaohongshu'].includes(requestedChannel) ? requestedChannel : 'douyin';
  const channelLabels = { douyin: '抖音', wechat_channels: '视频号', xiaohongshu: '小红书' };
  const channelLabel = channelLabels[channel];
  if ($('competitorChannel')) $('competitorChannel').value = channel;
  if (!normalizedKeyword) {
    $('competitorSearchInput')?.focus();
    return;
  }
  state.competitorFinder = { keyword: normalizedKeyword, requestedCount, channel, channelLabel, source: searchSource, loading: true, items: [], transcripts: {} };
  $('competitorRadar')?.classList.add('searching');
  if ($('competitorRadarStatus')) $('competitorRadarStatus').textContent = '● 正在扫描';
  if ($('competitorRadarKeyword')) $('competitorRadarKeyword').textContent = normalizedKeyword;
  if ($('competitorRadarReadout')) $('competitorRadarReadout').textContent = '匹配竞品信号';
  $('competitorSearchInput').value = normalizedKeyword;
  $('competitorSearchStatus').textContent = `正在从${channelLabel}搜索 ${requestedCount} 条教育视频…`;
  renderCompetitorQuota();
  renderCompetitorFinder();
  try {
    const result = await apiRequest('competitorSearch', { keyword: normalizedKeyword, channel, limit: requestedCount, source: searchSource, minimum_score: 60 });
    state.competitorFinder.items = Array.isArray(result?.items) ? result.items : [];
    state.competitorFinder.searchKeyword = result?.search_keyword || normalizedKeyword;
    state.competitorFinder.channel = result?.channel || channel;
    state.competitorFinder.channelLabel = result?.channel_label || channelLabel;
    if (result?.quota) state.competitorQuota = { ...state.competitorQuota, ...result.quota, loaded: true, loading: false };
    competitorRadarSignalWords = Array.from(new Set([normalizedKeyword, ...state.competitorFinder.items.slice(0, 4).map((item) => item.author), '高赞内容', '高收藏', '同赛道账号', '口播结构'].map((item) => String(item || '').trim().slice(0, 10)).filter(Boolean))).slice(0, 10);
    if (!state.competitorFinder.items.length) $('competitorSearchStatus').textContent = `${channelLabel}本次确实没有返回与“${result?.search_keyword || normalizedKeyword}”相关的教育内容。请检查关键词是否过长、过于冷门，或换成具体学科和人群。`;
  } catch (error) {
    $('competitorSearchStatus').textContent = `搜索失败：${error.message}`;
  } finally {
    state.competitorFinder.loading = false;
    $('competitorRadar')?.classList.remove('searching');
    if ($('competitorRadarStatus')) $('competitorRadarStatus').textContent = '● 雷达待命';
    if ($('competitorRadarReadout')) $('competitorRadarReadout').textContent = '扫描完成';
    renderCompetitorQuota();
    renderCompetitorFinder();
  }
}

async function extractCompetitorTranscript(id) {
  const transcript = state.competitorFinder.transcripts[id] || {};
  state.competitorFinder.transcripts[id] = { ...transcript, loading: true, error: '' };
  renderCompetitorFinder();
  try {
    const result = await apiRequest('competitorTranscript', { video_id: id });
    state.competitorFinder.transcripts[id] = { content: result?.transcript || '', degraded: Boolean(result?.degraded), notice: result?.notice || '' };
    if (!result?.transcript) throw new Error('未识别到可复制的口播文案');
  } catch (error) {
    state.competitorFinder.transcripts[id] = { error: error.message || '文案提取失败' };
  }
  renderCompetitorFinder();
}

function openCompetitorCopyInAgent(id) {
  const item = state.competitorFinder.items.find((entry) => String(entry.id) === String(id));
  const transcript = state.competitorFinder.transcripts[id]?.content;
  if (!item || !transcript) return;
  $('copyAgent').value = 'education_vertical';
  state.activeCopySessionId = null;
  setPage('copy');
  setCopyView('compose');
  $('copyMaterial').value = `请参考下面竞品视频的表达结构和切入角度，结合我的真实业务改写成一条自己的教育短视频文案。不要照搬原句，也不要虚构事实。\n\n竞品标题：${item.title}\n竞品口播文案：\n${transcript}`;
  $('copyMaterial').focus();
}

function renderSalesProfiles() {
  const container = $('salesProfileGrid');
  if (!container) return;
  container.innerHTML = Object.values(salesProfiles).map((profile, index) => `
    <button type="button" class="sales-profile-card ${index === 0 ? 'active' : ''}" data-sales-profile="${profile.code}">
      <span class="sales-profile-disc">${escapeHtml(profile.disc)}</span>
      <strong>${escapeHtml(profile.name)}</strong>
      <small>${escapeHtml(profile.short)}</small>
      <p>${escapeHtml(profile.description)}</p>
      <small class="sales-profile-focus">先看：${escapeHtml(profile.methodology.first_fact)}</small>
      <div>${profile.tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join('')}</div>
    </button>`).join('');
}

function setSalesView(view) {
  const isChat = view === 'chat';
  const isStep = view === 'step';
  $('salesSetupView').classList.toggle('hidden', isChat || isStep);
  $('salesStepView').classList.toggle('hidden', !isStep);
  $('salesChatView').classList.toggle('hidden', !isChat);
  if (view === 'setup') {
    clearSalesOutcomeTimer();
    state.salesSession = null;
    state.salesEmojiPickerOpen = false;
    renderSalesProfiles();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSalesMethodStep(code) {
  if (!getSalesMethodDetails()[code]) return;
  state.activeSalesMethod = code;
  setSalesView('step');
  renderSalesMethodStep();
}

function renderSalesMethodStep() {
  const details = getSalesMethodDetails();
  const detail = details[state.activeSalesMethod] || details.icebreak;
  $('salesStepNumber').textContent = detail.number;
  $('salesStepLibraryName').textContent = detail.library;
  $('salesStepTitle').textContent = detail.title;
  $('salesStepDesc').textContent = detail.desc;
  $('salesLibraryTitle').textContent = `通用${detail.library}`;
  $('salesStepNav').innerHTML = Object.entries(details).map(([code, item]) => `<button type="button" class="${code === state.activeSalesMethod ? 'active' : ''}" data-sales-method="${code}"><span>${item.number}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.library)}</small></button>`).join('');
  $('salesLibraryList').innerHTML = detail.items.map((item, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><p>${escapeHtml(item)}</p><button type="button" class="secondary mini" data-copy-sales-library="${index}">复制</button></article>`).join('');
  $('salesStepResult').classList.add('hidden');
}

async function generateSalesStepGuide() {
  const details = getSalesMethodDetails();
  const detail = details[state.activeSalesMethod] || details.icebreak;
  const payload = {
    action: 'guide',
    step_code: state.activeSalesMethod,
    step: { title: detail.title, library: detail.library, description: detail.desc },
    track: value('salesCoachTrack') || '教育 C 端',
    business: value('salesCoachBusiness') || '教育业务',
    context: value('salesCoachContext') || '暂无更多家长信息'
  };
  setButtonLoading('generateSalesStepGuide', true, '生成中...');
  $('salesStepResult').classList.remove('hidden');
  $('salesStepResultContent').innerHTML = '<div class="loading-box"><strong>正在整理本步话术</strong><p>会结合你的赛道、业务和家长情况生成。</p></div>';
  try {
    const result = await apiRequest('salesSimulation', payload);
    const content = result?.content || detail.items.join('\n');
    $('salesStepResultContent').textContent = content;
    addRecord('销售模拟', `${detail.title} · ${payload.business}`, content);
  } catch (error) {
    $('salesStepResultContent').textContent = `${detail.title}参考：\n\n${detail.items.map((item) => `- ${item}`).join('\n')}`;
  } finally {
    setButtonLoading('generateSalesStepGuide', false);
  }
}

function renderSalesChat() {
  const session = state.salesSession;
  if (!session) return;
  const profile = salesProfiles[session.profileCode] || salesProfiles.rational;
  const isLocked = Boolean(session.awaitingReply || session.blocked || session.disengaged || session.reviewing || session.completed);
  $('salesScenarioCard').innerHTML = `<span class="sales-profile-disc">${escapeHtml(profile.disc)} · 沟通假设</span><strong>${escapeHtml(profile.name)}</strong><p>${escapeHtml(profile.short)}</p><small>${escapeHtml(session.business)} · ${escapeHtml(session.product)}</small><div class="sales-scenario-method"><span>本轮重点</span><b>${escapeHtml(profile.methodology.coaching_focus)}</b></div>`;
  $('salesChatTitle').textContent = `${profile.name} · 模拟对话`;
  $('salesLiveStatus').textContent = session.blocked ? '已拉黑' : session.disengaged ? '用户不想理你' : session.reviewing ? '报告生成中' : session.completed ? '已完成' : session.awaitingReply ? '对方输入中' : '进行中';
  $('salesLiveStatus').classList.toggle('typing', Boolean(session.awaitingReply));
  $('salesLiveStatus').classList.toggle('blocked', Boolean(session.blocked));
  $('salesLiveStatus').classList.toggle('disengaged', Boolean(session.disengaged));
  $('salesInput').disabled = isLocked;
  $('toggleSalesEmojiPicker').disabled = isLocked;
  $('sendSalesMessage').disabled = isLocked;
  $('endSalesSimulation').disabled = isLocked;
  $('salesEmojiPicker').classList.toggle('hidden', !state.salesEmojiPickerOpen || isLocked);
  $('toggleSalesEmojiPicker').setAttribute('aria-expanded', String(state.salesEmojiPickerOpen && !isLocked));
  $('salesOutcomeOverlay').classList.toggle('hidden', !session.showDisengagedOutcomeOverlay);
  const userTurns = session.messages.filter((item) => item.role === 'user').length;
  const stepIndex = Math.min(salesSixSteps.length - 1, Math.max(0, userTurns));
  $('salesProgressText').textContent = `建议第 ${stepIndex + 1} 步`;
  $('salesProgressBar').style.width = `${Math.max(12, ((stepIndex + 1) / salesSixSteps.length) * 100)}%`;
  $('salesSixSteps').innerHTML = salesSixSteps.map((step, index) => `<li class="${index < stepIndex ? 'done' : index === stepIndex ? 'current' : ''}"><span>${index + 1}</span><div><strong>${step.title}</strong><small>${step.hint}</small></div></li>`).join('');
  const completedMessages = session.messages.map((message) => `<article class="sales-message ${message.role}"><span class="sales-message-label">${message.role === 'user' ? '你' : profile.name}</span><div>${escapeHtml(message.content)}</div></article>`).join('');
  const pendingReply = session.awaitingReply ? `
    <article class="sales-message parent pending" aria-label="${escapeHtml(profile.name)}正在思考">
      <span class="sales-message-label">${escapeHtml(profile.name)}</span>
      <div class="sales-thinking"><span>对方正在输入中</span><i></i><i></i><i></i></div>
    </article>` : '';
  const outcomeNotice = session.blocked
    ? '<div class="sales-blocked-notice"><strong>本次沟通已结束</strong><span>对方已将你拉黑</span></div>'
    : session.disengaged
      ? '<div class="sales-blocked-notice disengaged"><strong>本次沟通已结束</strong><span>用户不想继续理你</span></div>'
      : '';
  $('salesMessages').innerHTML = completedMessages + pendingReply + outcomeNotice;
  const messages = $('salesMessages');
  messages.scrollTop = messages.scrollHeight;
}

function mockSalesReply(session) {
  const replies = {
    rational: '我比较关注的是，孩子现在到底差在哪里，老师能不能看出来，以及这套课程具体怎么判断有没有效果。价格我也会和另外两家一起比较。',
    anxious: '我最担心的是时间不够了，孩子现在一提英语就抗拒。老师你先告诉我，多久能看到变化，具体怎么安排？',
    hesitant: '听起来方法还可以，但我担心孩子坚持不下来。之前也报过课，刚开始说得很好，后来就没人管了。',
    expressive: '我其实也希望孩子能找到自信一点的学习方式。您平时是怎么和孩子沟通的？我比较在意老师能不能真正理解孩子。'
  };
  return replies[session.profileCode] || replies.rational;
}

function hasEmoji(text) {
  return /\p{Extended_Pictographic}/u.test(text);
}

function stripEmojis(text) {
  return String(text || '').replace(/\p{Extended_Pictographic}/gu, '').replace(/[\uFE0F\u200D]/g, '').replace(/\s{2,}/g, ' ').trim();
}

function keepFirstEmoji(text) {
  let seen = false;
  return String(text || '').replace(/\p{Extended_Pictographic}/gu, (emoji) => {
    if (seen) return '';
    seen = true;
    return emoji;
  }).replace(/[\uFE0F\u200D]{2,}/g, '').replace(/\s{2,}/g, ' ').trim();
}

function formatParentReply(reply, session) {
  const profileCode = session.profileCode;
  const userTurns = session.messages.filter((item) => item.role === 'user').length;
  const recentParentReplies = session.messages.filter((item) => item.role === 'parent').slice(-2);
  const hasRecentEmoji = recentParentReplies.some((item) => hasEmoji(item.content));
  const canUseEmoji = profileCode !== 'rational' && userTurns >= 3 && userTurns % 3 === 0 && !hasRecentEmoji;
  let content = String(reply || '');
  if (hasEmoji(content)) {
    return canUseEmoji ? keepFirstEmoji(content) : stripEmojis(content);
  }
  if (canUseEmoji && parentEmojiByProfile[profileCode]) content = `${content} ${parentEmojiByProfile[profileCode]}`;
  return content;
}

function renderSalesEmojiPicker() {
  $('salesEmojiGrid').innerHTML = salesEmojiSet.map((emoji) => `<button type="button" data-sales-emoji="${emoji}" aria-label="发送 ${emoji}">${emoji}</button>`).join('');
}

function toggleSalesEmojiPicker() {
  const session = state.salesSession;
  if (!session || session.awaitingReply || session.blocked || session.disengaged || session.reviewing || session.completed) return;
  state.salesEmojiPickerOpen = !state.salesEmojiPickerOpen;
  renderSalesChat();
}

function insertSalesEmoji(emoji) {
  const session = state.salesSession;
  if (!emoji || !session || session.awaitingReply || session.blocked || session.disengaged || session.reviewing || session.completed) return;
  $('salesInput').value += emoji;
  state.salesEmojiPickerOpen = false;
  renderSalesChat();
  $('salesInput').focus();
}

function isAbusiveSalesMessage(message) {
  return /傻[逼b]|煞[笔b]|废物|垃圾|神经病|有病|滚蛋|去死|弄死你|打死你|干死你|操你|艹你|你妈|裸照|约炮|睡你|陪睡/i.test(message);
}

function assessSalesConversationOutcome(message) {
  if (isAbusiveSalesMessage(message)) {
    return {
      ...salesConversationOutcomes.blocked,
      parent_reply: '我不接受这样的沟通方式，这次就先到这里。'
    };
  }
  if (/(?:那(?:你)?|你)(?:就)?别(?:报名|报了|买了|考虑了?|聊了?)|爱报不报|不报(?:名)?(?:就)?算了|不买(?:就)?算了|不报拉倒|随便你(?:报不报名)?|别再(?:问|联系|找)我/i.test(message)) {
    return {
      ...salesConversationOutcomes.disengaged,
      parent_reply: '我感受到您更希望我马上做决定，而不是先了解孩子的情况。那这次我先不考虑了。'
    };
  }
  return null;
}

function buildLocalSalesReport(session) {
  const profile = salesProfiles[session.profileCode] || salesProfiles.rational;
  const methodology = profile.methodology || {};
  const messages = session.messages.filter((item) => item.role === 'user').map((item) => item.content).join('\n');
  const count = (pattern) => (messages.match(pattern) || []).length;
  const questionCount = count(/[？?]/g);
  const discoverySubScores = {
    need: { score: Math.max(30, Math.min(88, 34 + Math.min(4, questionCount) * 8 + Math.min(3, count(/孩子|现状|情况|成绩|目标|之前|试过|为什么|多久|担心|着急|希望/g)) * 7)), feedback: '看是否问到了现状、目标、过往尝试和最急的问题。' },
    payment: { score: Math.max(30, Math.min(88, 34 + Math.min(3, count(/价格|预算|投入|费用|效果|价值|担心|顾虑|时间/g)) * 10)), feedback: '看是否确认了投入条件、价值判断和付费风险。' },
    decision: { score: Math.max(30, Math.min(88, 34 + Math.min(3, count(/决策|家人|商量|确定|什么时候|下一步|预约|确认|时间/g)) * 11)), feedback: '看是否确认了决策条件、时间点和可执行的下一步。' }
  };
  const rawDimensions = [
    ['icebreak', 42 + count(/理解|辛苦|重视|认真|细致|观察|谢谢|愿意/g) * 9, '先用一条来自家长表达的具体观察建立信任，避免空泛夸奖。'],
    ['discovery', Math.round(Object.values(discoverySubScores).reduce((sum, item) => sum + item.score, 0) / 3), '围绕需求力、付费力和决策力拿到事实，再介绍方案。', discoverySubScores],
    ['diagnosis', 38 + Math.min(3, count(/核心|问题|不是.*而是|所以|判断|更需要|原因/g)) * 13, '把听到的事实复述成一个清晰判断，再说明为什么。'],
    ['case_match', 38 + Math.min(3, count(/案例|同年级|相似|方案|课程|测评|体验|安排|适合/g)) * 13, '案例和产品都要回到家长刚说的具体问题上。'],
    ['objection', 38 + Math.min(3, count(/担心|顾虑|预算|价格|时间|理解|确实|谨慎|更在意/g)) * 13, '听到异议时，先确认家长真正担心的风险，再给可验证的回应。'],
    ['close', 38 + Math.min(3, count(/下一步|预约|测评|体验|时间|资料|确认|联系/g)) * 13, '最后给一个低门槛、可执行的下一步，而不是只停在介绍。']
  ];
  const dimensions = salesScoreDimensions.map((dimension) => {
    const matched = rawDimensions.find((item) => item[0] === dimension.code);
    return { ...dimension, score: Math.max(35, Math.min(88, Math.round(matched[1]))), feedback: matched[2], ...(matched[3] ? { sub_scores: matched[3] } : {}) };
  });
  const overall = Math.round(dimensions.reduce((total, item) => total + item.score * item.weight / 100, 0));
  const strong = dimensions.filter((item) => item.score >= 64).sort((a, b) => b.score - a.score);
  const weak = [...dimensions].sort((a, b) => a.score - b.score);
  const drill = weak[0];
  return applySalesOutcomeToReport({
    overall_score: overall,
    level: overall >= 80 ? '成交进阶' : overall >= 65 ? '稳定推进' : '待夯实',
    summary: `本轮完成了 ${session.messages.filter((item) => item.role === 'user').length} 次学员表达。评分先看对话里是否出现有效事实、判断和推进动作，不按话多给分。针对${profile.disc}画像，本轮还会看：${methodology.coaching_focus}`,
    dimensions,
    strengths: strong.length ? strong.slice(0, 2).map((item) => `${item.name}有可见动作，继续保持对话基于事实推进。`) : ['本轮有开始建立沟通，但有效销转动作还需要更完整地展开。'],
    gaps: [`${profile.disc}画像的沟通重点：${methodology.coaching_focus}`, ...weak.slice(0, 2).map((item) => `${item.name}目前证据不足：${item.feedback}`)].slice(0, 3),
    next_drill: {
      title: `专项练习：${drill.name}`,
      action: `${drill.feedback} ${methodology.coaching_focus}`,
      sample: methodology.drill_sample || (drill.code === 'discovery' ? '孩子现在最让您着急的是哪一件事？之前为了解决它，您们具体试过什么？' : '我先把您刚才的担心确认清楚，再给您一个更贴近情况的建议。')
    }
  }, session.outcome);
}

function clearSalesOutcomeTimer() {
  if (state.salesOutcomeTimer) {
    window.clearTimeout(state.salesOutcomeTimer);
    state.salesOutcomeTimer = null;
  }
}

function continueToSalesReport() {
  const session = state.salesSession;
  if (!session || !session.showDisengagedOutcomeOverlay) return;
  clearSalesOutcomeTimer();
  session.showDisengagedOutcomeOverlay = false;
  renderSalesChat();
  endSalesSimulation();
}

async function endSalesSessionForOutcome(session, outcome) {
  await new Promise((resolve) => setTimeout(resolve, 620));
  session.awaitingReply = false;
  session[outcome.code] = true;
  session.outcome = resolveSalesOutcome(outcome);
  session.messages.push({ role: 'parent', content: outcome.parent_reply });
  session.showDisengagedOutcomeOverlay = outcome.code === 'disengaged';
  setButtonLoading('sendSalesMessage', false);
  renderSalesChat();
  if (session.showDisengagedOutcomeOverlay) {
    clearSalesOutcomeTimer();
    return;
  }
  await endSalesSimulation();
}

async function sendSalesMessage() {
  const message = value('salesInput');
  if (!message || !state.salesSession || state.salesSession.awaitingReply || state.salesSession.blocked || state.salesSession.disengaged || state.salesSession.reviewing || state.salesSession.completed) return;
  const session = state.salesSession;
  session.messages.push({ role: 'user', content: message });
  session.awaitingReply = true;
  state.salesEmojiPickerOpen = false;
  $('salesInput').value = '';
  renderSalesChat();
  setButtonLoading('sendSalesMessage', true, '…');
  const outcome = assessSalesConversationOutcome(message);
  if (outcome) {
    await endSalesSessionForOutcome(session, outcome);
    return;
  }
  try {
    const result = await apiRequest('salesSimulation', {
      action: 'reply',
      profile_code: session.profileCode,
      profile: salesProfiles[session.profileCode],
      business: session.business,
      product: session.product,
      difficulty: session.difficulty,
      message,
      history: session.messages.slice(-12)
    });
    session.messages.push({ role: 'parent', content: formatParentReply(result?.content || mockSalesReply(session), session) });
  } catch (error) {
    session.messages.push({ role: 'parent', content: formatParentReply(mockSalesReply(session), session) });
  } finally {
    session.awaitingReply = false;
    setButtonLoading('sendSalesMessage', false);
    renderSalesChat();
  }
}

async function startSalesSimulation() {
  const activeProfile = document.querySelector('.sales-profile-card.active')?.dataset.salesProfile || 'rational';
  state.salesSession = {
    profileCode: activeProfile,
    business: value('salesBusiness') || '教育业务',
    product: value('salesProduct') || '待沟通产品',
    difficulty: value('salesDifficulty') || 'normal',
    awaitingReply: false,
    blocked: false,
    disengaged: false,
    showDisengagedOutcomeOverlay: false,
    reviewing: false,
    completed: false,
    outcome: salesConversationOutcomes.normal,
    messages: [{ role: 'parent', content: salesProfiles[activeProfile].opening }]
  };
  setSalesView('chat');
  state.salesEmojiPickerOpen = false;
  renderSalesChat();
}

async function endSalesSimulation() {
  const session = state.salesSession;
  if (!session || session.awaitingReply || session.reviewing || session.completed || session.messages.filter((item) => item.role === 'user').length < 1) return;
  session.reviewing = true;
  renderSalesChat();
  setButtonLoading('endSalesSimulation', true, '生成中...');
  $('salesReview').classList.remove('hidden');
  $('salesReview').innerHTML = '<div class="loading-box"><strong>正在生成多维评分报告</strong><p>会检查信任、挖需、诊断、匹配、异议处理和成交推进。</p></div>';
  try {
    const result = await apiRequest('salesSimulation', {
      action: 'review',
      profile_code: session.profileCode,
      profile: salesProfiles[session.profileCode],
      business: session.business,
      product: session.product,
      difficulty: session.difficulty,
      conversation_outcome: session.outcome,
      history: session.messages
    });
    const report = result?.report || buildLocalSalesReport(session);
    session.report = report;
    session.completed = true;
    $('salesReview').innerHTML = renderSalesReportMarkup(report);
    addRecord('销售模拟报告', `${salesProfiles[session.profileCode].name} · ${Math.round(Number(report.overall_score) || 0)} 分`, report.summary || '');
  } catch (error) {
    const report = buildLocalSalesReport(session);
    session.report = report;
    session.completed = true;
    $('salesReview').innerHTML = renderSalesReportMarkup(report);
    addRecord('销售模拟报告', `${salesProfiles[session.profileCode].name} · ${Math.round(Number(report.overall_score) || 0)} 分`, report.summary || '');
  } finally {
    session.reviewing = false;
    setButtonLoading('endSalesSimulation', false);
    renderSalesChat();
  }
}

function bindEvents() {
  $('openLoginModal').addEventListener('click', () => {
    setLoginMode('login');
    $('loginModal').classList.remove('hidden');
  });
  $('closeLoginModal').addEventListener('click', () => $('loginModal').classList.add('hidden'));
  $('loginModal').addEventListener('click', (event) => {
    if (event.target === $('loginModal')) $('loginModal').classList.add('hidden');
  });
  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('[data-page]');
    if (button && state.user) setPage(button.dataset.page);
    const filterButton = event.target.closest('[data-agent-filter]');
    if (filterButton) {
      state.copyAgentFilter = filterButton.dataset.agentFilter;
      document.querySelectorAll('[data-agent-filter]').forEach((item) => item.classList.toggle('active', item === filterButton));
      filterCopyAgents();
    }
    const agentButton = event.target.closest('[data-copy-agent]');
    if (agentButton && state.user) {
      $('copyAgent').value = agentButton.dataset.copyAgent;
      state.activeCopySessionId = null;
      renderCopyConversation(null);
      document.querySelectorAll('[data-copy-agent]').forEach((item) => item.classList.toggle('active', item === agentButton));
      setCopyView('compose');
    }
    const keywordButton = event.target.closest('[data-competitor-keyword]');
    if (keywordButton && state.user) searchCompetitorFinder(keywordButton.dataset.competitorKeyword, { source: 'trend', channel: keywordButton.dataset.competitorTrendChannel });
    const trendRetryButton = event.target.closest('[data-competitor-trends-retry]');
    if (trendRetryButton && state.user) loadCompetitorTrends();
    const extractButton = event.target.closest('[data-competitor-extract]');
    if (extractButton && state.user) extractCompetitorTranscript(extractButton.dataset.competitorExtract);
    const copyButton = event.target.closest('[data-competitor-copy]');
    if (copyButton) copyText(state.competitorFinder.transcripts[copyButton.dataset.competitorCopy]?.content || '');
    const toAgentButton = event.target.closest('[data-competitor-to-agent]');
    if (toAgentButton && state.user) openCompetitorCopyInAgent(toAgentButton.dataset.competitorToAgent);
  });
  $('loginButton').addEventListener('click', loginWithPassword);
  $('registerButton').addEventListener('click', registerAccount);
  $('showLoginMode').addEventListener('click', () => setLoginMode('login'));
  $('showRegisterMode').addEventListener('click', () => setLoginMode('register'));
  $('loginPassword').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') loginWithPassword();
  });
  $('registerPasswordConfirm').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') registerAccount();
  });
  $('logoutButton').addEventListener('click', logout);
  $('toggleRole').addEventListener('click', () => {
    if (!state.user || state.user.role === 'admin') return;
    state.user = state.user.role === 'coaching' ? { ...demoUsers.train, token: 'mock-token-training' } : { ...demoUsers.coach, token: 'mock-token-coaching' };
    applyUser();
    setPage('home');
  });
  $('sendPipi').addEventListener('click', sendPipi);
  $('pipiInput').addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendPipi();
    }
  });
  $('newPipiSession').addEventListener('click', resetPipi);
  $('quickQuestions').addEventListener('click', (event) => {
    const button = event.target.closest('[data-question]');
    if (button) {
      $('pipiInput').value = button.dataset.question;
      sendPipi();
    }
  });
  $('generateTopics').addEventListener('click', generateTopics);
  ['topicTrack', 'topicBusiness'].forEach((id) => {
    $(id).addEventListener(id === 'topicTrack' ? 'change' : 'input', validateTopicRequiredFields);
  });
  $('copyTopics').addEventListener('click', () => copyText($('topicResults').innerText));
  $('exportTopics').addEventListener('click', () => downloadText(timestampName('皮皮选题'), $('topicResults').innerText));
  $('generateCoachSop').addEventListener('click', generateCoachSop);
  $('exportCoachSop').addEventListener('click', downloadCoachSopDiagram);
  $('coachSopResult').addEventListener('click', (event) => {
    const expandButton = event.target.closest('[data-coach-sop-expand]');
    if (expandButton) {
      const details = expandButton.parentElement.querySelector('.coach-diagram-details');
      details.classList.toggle('hidden');
      expandButton.textContent = details.classList.contains('hidden') ? '展开详情' : '收起详情';
    }
  });
  let coachDiagramDrag = null;
  $('coachSopResult').addEventListener('pointerdown', (event) => {
    if (event.target.closest('[contenteditable="true"], button')) return;
    coachDiagramDrag = { x: event.clientX, y: event.clientY, left: $('coachSopResult').scrollLeft, top: $('coachSopResult').scrollTop };
    $('coachSopResult').classList.add('dragging');
    $('coachSopResult').setPointerCapture?.(event.pointerId);
  });
  $('coachSopResult').addEventListener('pointermove', (event) => {
    if (!coachDiagramDrag) return;
    $('coachSopResult').scrollLeft = coachDiagramDrag.left - (event.clientX - coachDiagramDrag.x);
    $('coachSopResult').scrollTop = coachDiagramDrag.top - (event.clientY - coachDiagramDrag.y);
  });
  ['pointerup', 'pointercancel'].forEach((eventName) => $('coachSopResult').addEventListener(eventName, () => {
    coachDiagramDrag = null;
    $('coachSopResult').classList.remove('dragging');
  }));
  window.addEventListener('resize', () => window.requestAnimationFrame(renderCoachMindmapLinks));
  $('selectCoachMomentPhoto').addEventListener('click', () => $('coachMomentPhoto').click());
  $('coachMomentPhoto').addEventListener('change', (event) => handleCoachMomentPhoto(event.target.files?.[0]));
  $('generateCoachMoment').addEventListener('click', generateCoachMoment);
  $('generateCoachMomentImage').addEventListener('click', generateCoachMomentImage);
  $('copyCoachMoment').addEventListener('click', () => copyText($('coachMomentCopy').innerText));
  $('downloadCoachMoment').addEventListener('click', downloadCoachMomentPoster);
  $('coachMomentCopy').addEventListener('input', () => renderCoachMomentPoster());
  $('coachMomentStage').addEventListener('input', () => renderCoachMomentPoster());
  $('coachMomentPrivacy').addEventListener('change', () => {
    if (state.coachMomentProcessedImageDataUrl) {
      state.coachMomentProcessedImageDataUrl = '';
      $('coachMomentPhotoStatus').textContent = '隐私设置已更新，请重新生成图片以应用新的处理方式。';
    }
    renderCoachMomentPoster();
  });
  document.querySelectorAll('[data-coach-tool-target]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-coach-tool-target]').forEach((item) => item.classList.toggle('active', item === button));
    document.getElementById(button.dataset.coachToolTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  $('generateCopy').addEventListener('click', generateCopy);
  $('backToCopyAgents').addEventListener('click', () => setCopyView('gallery'));
  $('copyNewSession').addEventListener('click', () => {
    state.activeCopySessionId = null;
    renderCopyConversation(null);
    $('copyMaterial').value = '';
    renderCopySessions();
  });
  document.body.addEventListener('click', (event) => {
    const starter = event.target.closest('[data-copy-starter]');
    if (starter) {
      $('copyMaterial').value = starter.dataset.copyStarter;
      $('copyMaterial').focus();
    }
    const session = event.target.closest('[data-copy-session]');
    if (session) restoreCopySession(session.dataset.copySession);
  });
  $('agentSearch').addEventListener('input', filterCopyAgents);
  $('copyMaterial').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      generateCopy();
    }
  });
  $('copyCopywriting').addEventListener('click', () => copyText($('copyResult').innerText));
  $('exportCopywriting').addEventListener('click', () => downloadText(timestampName('皮皮文案'), $('copyResult').innerText));
  $('backFromWechatLayout').addEventListener('click', () => setCopyView('gallery'));
  $('generateWechatLayout').addEventListener('click', generateWechatLayout);
  $('selectWechatLayoutImages').addEventListener('click', () => $('wechatLayoutImages').click());
  $('wechatLayoutImages').addEventListener('change', (event) => {
    handleWechatLayoutImages(event.target.files).catch((error) => { $('wechatLayoutStatus').textContent = error.message; });
    event.target.value = '';
  });
  $('wechatThemePicker').addEventListener('click', (event) => {
    const button = event.target.closest('[data-wechat-theme]');
    if (!button) return;
    state.wechatLayout.theme = button.dataset.wechatTheme;
    document.querySelectorAll('[data-wechat-theme]').forEach((item) => item.classList.toggle('active', item === button));
    if (state.wechatLayout.layout || Object.keys(state.wechatLayout.layouts || {}).length) {
      refreshWechatLayoutPreview();
      $('wechatLayoutStatus').textContent = `已切换为“${WECHAT_LAYOUT_THEMES[state.wechatLayout.theme].name}”版式，不会重新调用模型。`;
    }
  });
  $('wechatOutputMode').addEventListener('click', (event) => {
    const button = event.target.closest('[data-wechat-mode]');
    if (!button) return;
    state.wechatLayout.mode = button.dataset.wechatMode;
    document.querySelectorAll('[data-wechat-mode]').forEach((item) => item.classList.toggle('active', item === button));
    if (state.wechatLayout.layout || Object.keys(state.wechatLayout.layouts || {}).length) {
      refreshWechatLayoutPreview();
      $('wechatLayoutStatus').textContent = state.wechatLayout.mode === 'visual'
        ? '已切换为视觉长图：使用杂志式构图，适合导出或作为图片发布。'
        : '已切换为可编辑正文：结构更稳，适合复制进公众号继续编辑。';
    }
  });
  $('wechatLayoutImageList').addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove-wechat-image]');
    if (!button) return;
    state.wechatLayout.images.splice(Number(button.dataset.removeWechatImage), 1);
    renderWechatLayoutImages();
    if (state.wechatLayout.layout || Object.keys(state.wechatLayout.layouts || {}).length) refreshWechatLayoutPreview();
  });
  $('resetWechatLayout').addEventListener('click', () => {
    state.wechatLayout.layout = null;
    state.wechatLayout.layouts = {};
    state.wechatLayout.html = '';
    state.wechatLayout.result = null;
    $('wechatLayoutPreview').classList.add('hidden');
    $('wechatLayoutPreview').srcdoc = '';
    $('wechatLayoutEmpty').classList.remove('hidden');
    ['copyWechatLayout', 'exportWechatPng', 'exportWechatMarkdown', 'exportWechatHtml'].forEach((id) => { $(id).disabled = true; });
    $('wechatLayoutModelStatus').textContent = '等待排版';
    $('wechatLayoutStatus').textContent = '可以修改成稿、风格或图片后重新生成。';
  });
  $('copyWechatLayout').addEventListener('click', copyWechatLayoutRichText);
  $('exportWechatPng').addEventListener('click', exportWechatLayoutPng);
  $('exportWechatHtml').addEventListener('click', () => downloadWechatLayoutFile(wechatLayoutFilename('html'), state.wechatLayout.html, 'text/html;charset=utf-8'));
  $('exportWechatMarkdown').addEventListener('click', () => downloadWechatLayoutFile(wechatLayoutFilename('md'), state.wechatLayout.article || value('wechatLayoutArticle'), 'text/markdown;charset=utf-8'));
  $('competitorSearchButton').addEventListener('click', () => searchCompetitorFinder());
  $('competitorSearchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') searchCompetitorFinder();
  });
  renderSalesProfiles();
  renderSalesEmojiPicker();
  $('startSalesSimulation').addEventListener('click', startSalesSimulation);
  $('sendSalesMessage').addEventListener('click', sendSalesMessage);
  $('toggleSalesEmojiPicker').addEventListener('click', toggleSalesEmojiPicker);
  $('continueToSalesReport').addEventListener('click', continueToSalesReport);
  $('endSalesSimulation').addEventListener('click', endSalesSimulation);
  $('backToSalesSetup').addEventListener('click', () => setSalesView('setup'));
  $('backToSalesSetupFromStep').addEventListener('click', () => setSalesView('setup'));
  $('generateSalesStepGuide').addEventListener('click', generateSalesStepGuide);
  $('copySalesStepResult').addEventListener('click', () => copyText($('salesStepResultContent').innerText));
  $('salesPage').addEventListener('click', (event) => {
    const methodButton = event.target.closest('[data-sales-method]');
    const libraryCopyButton = event.target.closest('[data-copy-sales-library]');
    const emojiButton = event.target.closest('[data-sales-emoji]');
    if (methodButton) openSalesMethodStep(methodButton.dataset.salesMethod);
    if (emojiButton) insertSalesEmoji(emojiButton.dataset.salesEmoji);
    if (libraryCopyButton) {
      const details = getSalesMethodDetails();
      const detail = details[state.activeSalesMethod] || details.icebreak;
      const item = detail.items[Number(libraryCopyButton.dataset.copySalesLibrary)];
      if (item) copyText(item);
    }
  });
  $('salesInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendSalesMessage();
    }
  });
  $('salesProfileGrid').addEventListener('click', (event) => {
    const card = event.target.closest('[data-sales-profile]');
    if (!card) return;
    document.querySelectorAll('.sales-profile-card').forEach((item) => item.classList.toggle('active', item === card));
  });
  $('personalPage').addEventListener('click', async (event) => {
    const tab = event.target.closest('[data-personal-tab]');
    const saveProfile = event.target.closest('#savePersonalProfile');
    const selectAvatar = event.target.closest('#selectPersonalAvatar');
    const createPersona = event.target.closest('#createPersona');
    const savePersona = event.target.closest('#savePersona');
    const deletePersona = event.target.closest('#deletePersona');
    const addKnowledge = event.target.closest('#addPersonalKnowledge');
    const selectKnowledgeFile = event.target.closest('#selectPersonalKnowledgeFile');
    const toggleKnowledge = event.target.closest('[data-personal-knowledge-toggle]');
    const deleteKnowledge = event.target.closest('[data-personal-knowledge-delete]');
    const clearHistory = event.target.closest('#clearPersonalHistory');
    try {
      if (tab) {
        state.personalTab = tab.dataset.personalTab;
        renderPersonalCenter();
        return;
      }
      if (saveProfile) {
        const profile = await apiRequest('personalProfile', {
          name: value('personalName'), bio: value('personalBio'), business_description: value('personalBusiness')
        }, { method: 'PATCH' });
        state.personal.profile = profile;
        state.user.name = profile.name;
        saveAuthSession();
        applyUser();
        showToast('资料已保存');
      }
      if (selectAvatar) $('personalAvatarFile').click();
      if (createPersona) {
        state.personal.persona = {};
        renderPersonalCenter();
      }
      if (savePersona) {
        const result = await apiRequest('personalPersona', {
          name: value('personaName'), identity: value('personaIdentity'), audience: value('personaAudience'), service: value('personaService'), story: value('personaStory')
        }, { method: 'PUT' });
        state.personal.persona = result.persona;
        renderPersonalCenter();
        showToast('个人人设已保存，AI 创作会自动使用');
      }
      if (deletePersona) {
        if (!confirm('确定删除个人人设吗？删除后无法恢复。')) return;
        await apiRequest('personalPersona', {}, { method: 'DELETE' });
        state.personal.persona = null;
        renderPersonalCenter();
        showToast('个人人设已删除');
      }
      if (addKnowledge) {
        const title = value('personalKnowledgeTitle');
        const content = value('personalKnowledgeContent');
        if (!title || !content) throw new Error('请填写文档标题和内容');
        const item = await apiRequest('personalKnowledge', { title, content, category: value('personalKnowledgeCategory') || '团队产出' });
        state.personal.knowledge.unshift(item);
        renderPersonalCenter();
        showToast('已加入个人知识库，AI 创作会自动参考');
      }
      if (selectKnowledgeFile) $('personalKnowledgeFile').click();
      if (toggleKnowledge) {
        const item = await apiRequest('personalKnowledge', { status: toggleKnowledge.dataset.nextStatus }, { method: 'PATCH', path: `/api/user/knowledge/${toggleKnowledge.dataset.personalKnowledgeToggle}` });
        state.personal.knowledge = state.personal.knowledge.map((entry) => entry.id === item.id ? item : entry);
        renderPersonalCenter();
        showToast(item.status === 'active' ? '知识已启用' : '知识已暂停');
      }
      if (deleteKnowledge) {
        if (!confirm('确定删除这条个人知识吗？删除后无法恢复。')) return;
        await apiRequest('personalKnowledge', {}, { method: 'DELETE', path: `/api/user/knowledge/${deleteKnowledge.dataset.personalKnowledgeDelete}` });
        state.personal.knowledge = state.personal.knowledge.filter((entry) => entry.id !== deleteKnowledge.dataset.personalKnowledgeDelete);
        renderPersonalCenter();
        showToast('知识已删除');
      }
      if (clearHistory) {
        if (!confirm('确定清空你自己的全部生成记录吗？此操作无法恢复。')) return;
        await apiRequest('records', {}, { method: 'DELETE' });
        state.records = [];
        renderRecent();
        renderContinue();
        renderHistory();
        $('adminCallCount').textContent = '0 次';
        showToast('生成记录已清空');
      }
    } catch (error) {
      alert(error.message);
    }
  });
  $('personalPage').addEventListener('change', async (event) => {
    if (event.target.id === 'personalKnowledgeFile') {
      const [file] = event.target.files;
      if (!file) return;
      const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
      if (!['txt', 'md', 'csv', 'rtf', 'docx'].includes(extension) || file.size > 5 * 1024 * 1024) {
        alert('文档仅支持 TXT、MD、CSV、RTF、DOCX，且单份不超过 5MB');
        event.target.value = '';
        return;
      }
      const status = $('personalKnowledgeUploadStatus');
      try {
        if (status) status.textContent = `正在读取《${file.name}》...`;
        const item = await apiRequest('personalKnowledgeUpload', { file_name: file.name, data_url: await readImageFile(file) });
        state.personal.knowledge.unshift(item);
        renderPersonalCenter();
        showToast('文档已加入知识库，所有智能体会自动参考');
      } catch (error) {
        if (status) status.textContent = error.message || '文档上传失败，请重试。';
        else alert(error.message);
      } finally {
        event.target.value = '';
      }
      return;
    }
    if (event.target.id !== 'personalAvatarFile') return;
    const [file] = event.target.files;
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      alert('头像仅支持 JPG、PNG、WebP，且图片不超过 2MB');
      event.target.value = '';
      return;
    }
    try {
      const profile = await apiRequest('personalAvatar', { data_url: await readImageFile(file) });
      state.personal.profile = profile;
      applyUser();
      renderPersonalCenter();
      showToast('头像已更新');
    } catch (error) {
      alert(error.message);
    }
  });
  $('refreshAdminConfig').addEventListener('click', loadAdminConfig);
  $('addModel').addEventListener('click', async () => {
    const modelCode = value('newModelCode');
    if (!modelCode) return;
    try {
      await postAdmin('adminModels', { provider_code: value('newModelProvider'), display_name: modelCode, model_code: modelCode, status: 'active' });
      $('newModelCode').value = '';
    } catch (error) {
      alert(error.message);
    }
  });
  $('addUser').addEventListener('click', async () => {
    const name = value('newUserName');
    const phone = value('newUserPhone');
    const password = value('newUserPassword');
    if (!name || !phone || password.length < 8) {
      alert('请填写学员姓名、手机号和至少 8 位的初始密码');
      return;
    }
    try {
      await postAdmin('adminUsers', {
        name,
        phone,
        password,
        role: value('newUserRole'),
        paid_product: value('newUserProduct'),
        expires_at: value('newUserExpires')
      });
      ['newUserName', 'newUserPhone', 'newUserPassword', 'newUserProduct', 'newUserExpires'].forEach((id) => { $(id).value = ''; });
    } catch (error) {
      alert(error.message);
    }
  });
  $('refreshSiliconModels').addEventListener('click', () => refreshProviderModels('siliconflow'));
  $('refreshArkModels').addEventListener('click', () => alert('Ark Plan 已接入 OpenAI-compatible Plan 接口。文案智能体当前展示为 Doubao Seed 2.1，实际调用 Plan 可用入口 ark-code-latest；Ark Plan 不使用 /models 自动探测。'));
  $('addPrompt').addEventListener('click', async () => {
    const name = value('newPromptName');
    const content = value('newPromptContent');
    if (!name || !content) return;
    try {
      await postAdmin('adminPrompts', { name, content, feature_code: value('newPromptFeature'), version: 'v1', status: 'active' });
      $('newPromptName').value = '';
      $('newPromptContent').value = '';
    } catch (error) {
      alert(error.message);
    }
  });
  $('adminPage').addEventListener('click', async (event) => {
    const moduleButton = event.target.closest('[data-admin-module]');
    const modelManagementTabButton = event.target.closest('[data-model-management-tab]');
    const providerButton = event.target.closest('[data-provider-toggle]');
    const modelButton = event.target.closest('[data-model-toggle]');
    const modelPriceSaveButton = event.target.closest('[data-model-price-save]');
    const usageDateApplyButton = event.target.closest('#applyUsageDateFilter');
    const promptButton = event.target.closest('[data-prompt-toggle]');
    const promptOpenButton = event.target.closest('[data-prompt-open]');
    const salesReportOpenButton = event.target.closest('[data-sales-report-open]');
    const userToggleButton = event.target.closest('[data-user-toggle]');
    const userSaveButton = event.target.closest('[data-user-save]');
    if (moduleButton) {
      state.adminModule = moduleButton.dataset.adminModule;
      renderAdminConfig();
    }
    if (modelManagementTabButton) {
      state.modelManagementTab = modelManagementTabButton.dataset.modelManagementTab;
      renderAdminConfig();
    }
    if (promptOpenButton) {
      state.selectedPromptId = Number(promptOpenButton.dataset.promptOpen);
      renderPromptEditor();
    }
    if (salesReportOpenButton) {
      state.selectedSalesReportId = salesReportOpenButton.dataset.salesReportOpen;
      renderSalesReports();
    }
    if (providerButton) {
      try { await patchAdmin(`/api/admin/ai/providers/${providerButton.dataset.providerToggle}`, { status: providerButton.dataset.nextStatus }); } catch (error) { alert(error.message); }
    }
    if (modelButton) {
      try { await patchAdmin(`/api/admin/ai/models/${modelButton.dataset.modelToggle}`, { status: modelButton.dataset.nextStatus }); } catch (error) { alert(error.message); }
    }
    if (modelPriceSaveButton) {
      const modelId = modelPriceSaveButton.dataset.modelPriceSave;
      const inputPrice = document.querySelector(`[data-model-input-price="${modelId}"]`);
      const outputPrice = document.querySelector(`[data-model-output-price="${modelId}"]`);
      await patchAdmin(`/api/admin/ai/models/${modelId}`, {
        input_price_cny_per_million: inputPrice?.value || 0,
        output_price_cny_per_million: outputPrice?.value || 0
      });
      showToast('模型单价已保存，成本统计已更新');
    }
    if (usageDateApplyButton) {
      const preset = value('usageDatePreset') || 'custom';
      if (preset !== 'custom') setUsageDatePreset(preset);
      const startDate = preset === 'custom' ? value('usageDateStart') : state.usageDateFilter.startDate;
      const endDate = preset === 'custom' ? value('usageDateEnd') : state.usageDateFilter.endDate;
      if (!startDate || !endDate || startDate > endDate) return alert('请选择有效的起止日期');
      state.usageDateFilter = { preset, startDate, endDate };
      await loadAdminConfig();
    }
    if (promptButton) {
      try { await patchAdmin(`/api/admin/prompts/${promptButton.dataset.promptToggle}`, { status: promptButton.dataset.nextStatus }); } catch (error) { alert(error.message); }
    }
    if (userToggleButton) {
      try {
        await patchAdmin(`/api/admin/users/${userToggleButton.dataset.userToggle}`, { status: userToggleButton.dataset.nextStatus });
      } catch (error) {
        alert(error.message);
      }
    }
    if (userSaveButton) {
      const userId = userSaveButton.dataset.userSave;
      const roleInput = document.querySelector(`[data-user-role="${userId}"]`);
      const expiresInput = document.querySelector(`[data-user-expires="${userId}"]`);
      try {
        await patchAdmin(`/api/admin/users/${userId}`, {
          ...(roleInput ? { role: roleInput.value } : {}),
          expires_at: expiresInput?.value || ''
        });
      } catch (error) {
        alert(error.message);
      }
    }
  });
}

renderQuickQuestions();
bindEvents();
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.user) refreshActiveFrontendConfig();
});
initSilkMotion();
initCompetitorRadar();
restoreAuthSession();
