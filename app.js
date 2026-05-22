const phone = document.querySelector("#phone");
const form = document.querySelector("#composerForm");
const input = document.querySelector("#messageInput");
const chatList = document.querySelector(".chat-list");
const profileCards = document.querySelectorAll(".profile-card[data-person]");
const healthTitle = document.querySelector("[data-health-title]");
const nicknameField = document.querySelector(".nickname-field");
const historyItems = document.querySelectorAll(".history-item[data-thread]");
const scenarioOptions = document.querySelectorAll(".scenario-option[data-scenario]");
const guideBubble = document.querySelector(".guide-bubble");
const guideBubbleImg = guideBubble?.querySelector("img");

const guideBubbles = {
  unselected: "./assets/guide-unselected.png",
  selected: "./assets/guide-selected-mom.png",
  tempFromSelected: "./assets/guide-temp-from-selected.png",
  selfFromUnselected: "./assets/guide-self-from-unselected.png?v=20260522-unselected-tab-guide-v2",
  momFromUnselected: "./assets/guide-mom-from-unselected.png?v=20260522-unselected-tab-guide-v2"
};

const guideBubbleDataKeys = {
  tempFromSelected: "temp-from-selected",
  selfFromUnselected: "self-from-unselected",
  momFromUnselected: "mom-from-unselected"
};

let guideScenario = "unselected";
let guideTransitionTimer = 0;

const chatContent = {
  temp: [
    { role: "user", text: "肚子疼一般是因为什么" },
    { role: "ai", text: "肚子疼的原因很多，常见包括饮食不洁、胃肠痉挛、消化不良、急性胃肠炎，也可能和阑尾炎、胆囊或泌尿系统问题有关。" },
    { role: "user", text: "今天早上开始的，拉了两次" },
    { role: "ai", text: "如果是今天突然开始并伴随腹泻，优先考虑胃肠道感染或饮食刺激。先补水、清淡饮食，观察是否发热、呕吐或便血。" },
    { role: "user", text: "肚脐周围一阵一阵疼" },
    { role: "ai", text: ["阵发性肚脐周围疼痛更像肠痉挛或肠道炎症，但如果疼痛逐渐转移到右下腹、持续加重，需警惕阑尾炎。", "你现在有没有发烧？按压右下腹会不会明显更疼？"] },
    { role: "user", text: "没有发烧，就是有点恶心" },
    { role: "ai", text: "先少量多次喝温水或口服补液盐，暂时避免油腻、辛辣、奶茶酒精。如果 6-8 小时内疼痛加重、持续呕吐或出现血便，建议及时就医。" }
  ],
  self: [
    { role: "user", text: "喉咙干痒，咽口水的时候有点疼" },
    { role: "ai", text: "喉咙干痒伴咽痛，常见于上呼吸道感染早期、咽炎、过敏或空气干燥刺激。先看有没有发热、咳嗽、鼻塞流涕。" },
    { role: "user", text: "没有发烧，但晚上咳嗽会明显一点" },
    { role: "ai", text: "夜间咳嗽加重可能和咽喉部刺激、鼻后滴漏或胃酸反流有关。可以先多喝水、保持室内湿度，睡前避免辛辣和过饱。" },
    { role: "user", text: "需要吃消炎药吗" },
    { role: "ai", text: ["不建议一开始就自行吃抗生素。多数咽痛是病毒或刺激导致，抗生素帮助不大。", "如果出现高热、扁桃体化脓、颈部淋巴结明显肿痛，或者症状超过 3 天加重，再考虑去医院评估。"] },
    { role: "user", text: "那我先喝水观察" },
    { role: "ai", text: "可以。今天先清淡饮食、减少讲话和熬夜。如果咽痛明显，可以用温盐水漱口；若出现呼吸困难、吞咽困难或持续高热，需要尽快就医。" }
  ],
  mom: [
    { role: "user", text: "妈妈前几天去医院测血压偏高" },
    { role: "ai", text: "医院测出血压偏高需要重视，先看具体数值和持续情况，再判断是否需要立即用药。" },
    { role: "user", text: "医生让回家自己测，连续测了一周" },
    { role: "ai", text: "在家测血压能避免「白大衣高血压」的误判，这个做法很对。" },
    { role: "user", text: "妈妈最近血压一直在 160/95 左右" },
    { role: "ai", text: ["妈妈的血压偏高，已经达到 2 级高血压标准了。结合她既往的冠心病史，需要重点关注血压管理，避免心脑血管事件风险。", "她目前在服用什么降压药？最近有没有出现头晕、胸闷或者下肢水肿的情况？"] },
    { role: "user", text: "最近偶尔头晕，药还没开始吃" },
    { role: "ai", text: "如果连续一周多次达到 160/95 左右，不建议继续拖。建议带着家庭血压记录复诊，由医生评估是否启动降压药，同时观察头晕是否和血压波动相关。" }
  ]
};

const historyThreads = {
  "self-brain": {
    person: "self",
    messages: [
      { role: "user", text: "脑出血昏迷一般要看哪些病情细节" },
      { role: "ai", text: "要重点看出血部位、出血量、是否破入脑室、是否有脑疝风险，以及目前意识评分和生命体征是否稳定。" },
      { role: "user", text: "CT 写的是基底节区出血，量大概 20ml，现在还昏迷" },
      { role: "ai", text: ["基底节区 20ml 出血需要严密观察，昏迷提示病情较重。要关注复查 CT 是否继续出血、瞳孔变化、血压控制和呼吸情况。", "如果出现瞳孔不等大、呼吸不稳、血压剧烈波动，需要立即让医生评估是否有颅压升高或手术指征。"] },
      { role: "user", text: "家属现在最应该问医生什么" },
      { role: "ai", text: "可以问：出血是否扩大、目前 GCS 评分、是否需要 ICU、血压目标、是否有手术或气管插管可能，以及未来 24-72 小时最担心的风险。" }
    ]
  },
  "temp-throat-today": {
    person: "temp",
    messages: [
      { role: "user", text: "喉咙干痒，咽口水的时候有点疼" },
      { role: "ai", text: "喉咙干痒伴轻微咽痛，常见于咽炎、上呼吸道感染早期、过敏或空气干燥刺激。" },
      { role: "user", text: "今天刚开始，没有发烧" },
      { role: "ai", text: "暂时可以先多喝温水、少说话、避免辛辣和熬夜。没有发热或化脓时，一般不建议自行用抗生素。" },
      { role: "user", text: "需要去医院吗" },
      { role: "ai", text: "如果 2-3 天明显加重、出现高热、吞咽困难、呼吸不适，或者扁桃体有白点脓苔，建议线下就诊。" }
    ]
  },
  "mom-brain": {
    person: "mom",
    messages: [
      { role: "user", text: "妈妈脑出血后一直昏迷，想了解病情细节" },
      { role: "ai", text: "这种情况要先确认出血位置、出血量、是否做过手术，以及目前是否在 ICU、有没有自主呼吸。" },
      { role: "user", text: "医生说出血量不小，已经上呼吸机了" },
      { role: "ai", text: ["上呼吸机说明妈妈的意识和呼吸功能都需要支持，病情属于重症。接下来重点看 24-72 小时内出血是否稳定、脑水肿是否加重。", "建议把妈妈的 CT 报告、手术记录和每日生命体征记录整理好，方便和主管医生沟通。"] },
      { role: "user", text: "家属还能做什么" },
      { role: "ai", text: "家属主要配合医生控制血压、血糖、感染风险，了解治疗目标和可能并发症。不要频繁移动患者，也不要自行使用偏方。" }
    ]
  },
  "temp-throat-yesterday": {
    person: "temp",
    messages: [
      { role: "user", text: "喉咙干痒，咽口水的时候有点疼，昨天晚上开始的" },
      { role: "ai", text: "从时间看更像急性咽喉刺激或感染早期。先看有没有鼻塞、流涕、咳嗽、反酸或过敏接触。" },
      { role: "user", text: "有点鼻塞，早上起来更干" },
      { role: "ai", text: "鼻塞和晨起咽干可能和鼻后滴漏、张口呼吸有关。可以用生理盐水洗鼻，保持室内湿度，睡前少吃辛辣。" },
      { role: "user", text: "能喝冰的吗" },
      { role: "ai", text: "如果喝冰的会加重疼痛或咳嗽，就先避免。温水、淡盐水漱口会更稳妥。" }
    ]
  },
  "temp-pregnancy": {
    person: "temp",
    messages: [
      { role: "user", text: "怀孕五周多，彩超说孕囊小" },
      { role: "ai", text: "孕五周多时孕囊大小个体差异较大，也可能和排卵晚、实际孕周偏小有关。需要结合末次月经、HCG 和孕酮趋势一起看。" },
      { role: "user", text: "现在还没看到胎心胎芽" },
      { role: "ai", text: "五周多看不到胎心胎芽并不少见，一般会建议 7-10 天后复查彩超，同时看 HCG 是否按预期增长。" },
      { role: "user", text: "有一点褐色分泌物" },
      { role: "ai", text: "少量褐色分泌物先减少活动、避免同房，并尽快联系产科医生评估。如果出血增多、腹痛明显或头晕，要及时就医。" }
    ]
  },
  "self-back-pain": {
    person: "self",
    messages: [
      { role: "user", text: "熬夜会引起背痛吗" },
      { role: "ai", text: "会有可能。熬夜会让肌肉更紧张、恢复变差，如果同时久坐、低头或睡姿不好，就容易出现背部酸痛。" },
      { role: "user", text: "我最近都是凌晨两三点睡，肩胛骨中间疼" },
      { role: "ai", text: "肩胛骨中间疼常见于斜方肌、菱形肌紧张。可以先热敷、拉伸胸背部，减少久坐，每 40 分钟活动一下。" },
      { role: "user", text: "什么情况需要看医生" },
      { role: "ai", text: "如果疼痛持续超过一周不缓解，或伴随胸闷、气短、手臂麻木无力、发热、外伤史，需要尽快线下评估。" }
    ]
  },
  "temp-mouth-ulcer": {
    person: "temp",
    messages: [
      { role: "user", text: "口腔溃疡是什么原因" },
      { role: "ai", text: "常见原因包括局部咬伤、熬夜压力大、辛辣刺激、维生素或微量元素摄入不足，也可能和免疫状态波动有关。" },
      { role: "user", text: "我这次长在舌头边上，很疼" },
      { role: "ai", text: "舌缘溃疡疼痛会比较明显。先避免辣、烫、硬的食物，可以用口腔溃疡贴或局部止痛凝胶缓解。" },
      { role: "user", text: "多久能好" },
      { role: "ai", text: "普通复发性溃疡多在 7-14 天内愈合。如果超过两周不愈合、反复同一位置、溃疡很大或伴发热，要去口腔科检查。" }
    ]
  },
  "temp-stomach-noise": {
    person: "temp",
    messages: [
      { role: "user", text: "肚子咕咕叫是什么原因" },
      { role: "ai", text: "肚子咕咕叫多是肠鸣音，可能和饥饿、进食过快、产气食物、肠道蠕动增加或轻微消化不良有关。" },
      { role: "user", text: "吃完饭后更明显，还有点胀气" },
      { role: "ai", text: "饭后明显加重加上胀气，常见于吃太快、豆类奶制品摄入多、胃肠动力紊乱。先少量多餐，减少碳酸饮料和产气食物。" },
      { role: "user", text: "没有腹痛腹泻" },
      { role: "ai", text: "没有腹痛、腹泻、发热或便血通常问题不大。若持续数周、体重下降或大便习惯改变，再考虑消化科就诊。" }
    ]
  },
  "mom-sugar": {
    person: "mom",
    messages: [
      { role: "user", text: "妈妈空腹血糖 7.2 要紧吗" },
      { role: "ai", text: "空腹血糖 7.2 mmol/L 已经高于正常范围，需要结合是否重复测量、餐后血糖和糖化血红蛋白一起判断。" },
      { role: "user", text: "她最近口渴多，体重也轻了一点" },
      { role: "ai", text: "口渴和体重下降需要重视，建议尽快到内分泌科复查空腹血糖、餐后 2 小时血糖和糖化血红蛋白。" }
    ]
  },
  "self-eye-dry": {
    person: "self",
    messages: [
      { role: "user", text: "眼睛干涩酸胀怎么缓解" },
      { role: "ai", text: "常见原因是用眼时间长、环境干燥或干眼。先减少连续看屏幕时间，每 20 分钟远眺，必要时可以用不含防腐剂的人工泪液。" },
      { role: "user", text: "最近戴隐形眼镜比较久" },
      { role: "ai", text: "先减少隐形眼镜佩戴时间。如果有明显红痛、畏光、分泌物增多或视力下降，需要尽快眼科检查。" }
    ]
  },
  "temp-allergy": {
    person: "temp",
    messages: [
      { role: "user", text: "身上突然起红疹很痒" },
      { role: "ai", text: "突然出现瘙痒红疹，常见于荨麻疹或过敏反应。先回想是否接触新食物、药物、护肤品或虫咬。" },
      { role: "user", text: "吃了没吃过的坚果" },
      { role: "ai", text: "先停止继续吃，避免抓挠。如果出现嘴唇眼睑肿、胸闷、喘不过气或头晕，需要立刻就医。" }
    ]
  },
  "mom-knee": {
    person: "mom",
    messages: [
      { role: "user", text: "妈妈膝盖下楼梯疼" },
      { role: "ai", text: "中老年人下楼梯膝盖疼，常见于髌股关节压力增大、骨关节炎或半月板问题。" },
      { role: "user", text: "平地走路还好，就是下楼疼" },
      { role: "ai", text: "可以先减少爬楼、下蹲和久站，注意膝周肌肉训练。如果肿胀、卡住或疼痛持续，建议骨科评估。" }
    ]
  },
  "self-sleep": {
    person: "self",
    messages: [
      { role: "user", text: "最近总是睡不踏实" },
      { role: "ai", text: "睡不踏实可能和压力、作息不规律、咖啡因、睡前刷手机或焦虑有关。先固定起床时间，睡前一小时减少屏幕刺激。" },
      { role: "user", text: "半夜会醒两三次" },
      { role: "ai", text: "如果持续超过两周，或伴随明显焦虑、心慌、白天困倦影响工作，可以考虑线下评估睡眠和情绪状态。" }
    ]
  },
  "temp-cough": {
    person: "temp",
    messages: [
      { role: "user", text: "咳嗽两周一直不好" },
      { role: "ai", text: "咳嗽超过两周，要看是否有痰、发热、胸痛、喘息、鼻后滴漏或反酸。不同原因处理不同。" },
      { role: "user", text: "没有发烧，晚上躺下会咳" },
      { role: "ai", text: "夜间躺下咳嗽可能和鼻后滴漏或胃酸反流有关。若持续不缓解，建议呼吸科或耳鼻喉科评估。" }
    ]
  },
  "mom-dizziness": {
    person: "mom",
    messages: [
      { role: "user", text: "妈妈起床头晕站不稳" },
      { role: "ai", text: "起床时头晕站不稳，要考虑体位性低血压、耳石症、低血糖或脑血管风险，尤其需要结合年龄和基础病。" },
      { role: "user", text: "她有高血压，早上更明显" },
      { role: "ai", text: "建议记录卧位和站立后的血压变化。如果伴随说话不清、肢体无力、走路偏斜，要立即就医排查脑血管问题。" }
    ]
  },
  "self-neck": {
    person: "self",
    messages: [
      { role: "user", text: "脖子僵硬转动会疼" },
      { role: "ai", text: "多见于颈部肌肉劳损、睡姿不当或长时间低头。可以先热敷、轻柔活动，避免用力扳脖子。" },
      { role: "user", text: "低头办公一天后更明显" },
      { role: "ai", text: "建议调整屏幕高度，每 30-40 分钟活动颈肩。如果出现手麻无力、头晕明显或疼痛放射到手臂，需要就诊。" }
    ]
  },
  "temp-diarrhea": {
    person: "temp",
    messages: [
      { role: "user", text: "吃海鲜后拉肚子" },
      { role: "ai", text: "吃海鲜后腹泻，常见于食物不洁、胃肠炎或食物不耐受。先补水，观察是否发热、腹痛加重或便血。" },
      { role: "user", text: "拉了三次，有点恶心" },
      { role: "ai", text: "可以先清淡饮食、少量多次喝水或补液盐。若持续呕吐、高热、便血或明显脱水，需要及时就医。" }
    ]
  },
  "mom-chest": {
    person: "mom",
    messages: [
      { role: "user", text: "妈妈胸口偶尔发闷" },
      { role: "ai", text: "胸口发闷需要重视，尤其妈妈如果有高血压、冠心病或糖尿病风险，要警惕心血管问题。" },
      { role: "user", text: "走快一点会明显，休息会好" },
      { role: "ai", text: "活动后胸闷、休息缓解更需要尽快心内科评估。若胸闷持续超过 10 分钟、出汗、胸痛或放射到左肩臂，应立即急诊。" }
    ]
  }
};

const healthContent = {
  mom: {
    title: "【妈妈】的咨询记录"
  },
  self: {
    title: "【本人】的咨询记录"
  }
};

if (phone) {
  phone.dataset.screen = "chat";
  phone.dataset.chat = phone.dataset.chat || "temp";
  phone.dataset.healthPerson = phone.dataset.healthPerson || "mom";
  phone.dataset.panel = phone.dataset.panel || "none";
}

function appendMessage(message) {
  if (!chatList) return;

  if (message.role === "user") {
    const row = document.createElement("div");
    row.className = "message-row user-row";
    const bubble = document.createElement("p");
    bubble.className = "bubble";
    bubble.textContent = message.text;
    row.appendChild(bubble);
    chatList.appendChild(row);
    return;
  }

  const paragraphs = Array.isArray(message.text) ? message.text : [message.text];
  if (paragraphs.length === 1) {
    const text = document.createElement("p");
    text.className = "ai-msg";
    text.textContent = paragraphs[0];
    chatList.appendChild(text);
    return;
  }

  const block = document.createElement("div");
  block.className = "ai-block";
  paragraphs.forEach((paragraph) => {
    const text = document.createElement("p");
    text.textContent = paragraph;
    block.appendChild(text);
  });
  chatList.appendChild(block);
}

function scrollChatToBottom() {
  if (!chatList) return;
  window.requestAnimationFrame(() => {
    chatList.scrollTop = chatList.scrollHeight;
  });
}

function renderMessages(messages, scrollPosition = "top") {
  if (!chatList) return;
  chatList.replaceChildren();
  messages.forEach(appendMessage);
  if (scrollPosition === "bottom") {
    scrollChatToBottom();
    return;
  }
  chatList.scrollTop = 0;
}

function renderChat(kind, scrollPosition = "top") {
  renderMessages(chatContent[kind], scrollPosition);
}

function setActiveHistory(threadId) {
  historyItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.thread === threadId);
  });
}

function applyGuideBubble(kind) {
  const src = guideBubbles[kind];
  if (!guideBubble || !guideBubbleImg || !src) return;

  guideBubble.dataset.guide = guideBubbleDataKeys[kind] || kind;
  guideBubbleImg.src = src;
  guideBubble.classList.add("is-visible");
  guideBubble.setAttribute("aria-hidden", "false");
}

function showGuideBubble(kind) {
  window.clearTimeout(guideTransitionTimer);
  applyGuideBubble(kind);
}

function transitionGuideBubble(kind) {
  const src = guideBubbles[kind];
  if (!guideBubble || !guideBubbleImg || !src) return;

  window.clearTimeout(guideTransitionTimer);
  if (!guideBubble.classList.contains("is-visible")) {
    applyGuideBubble(kind);
    return;
  }

  guideBubble.classList.remove("is-visible");
  guideBubble.setAttribute("aria-hidden", "true");
  guideTransitionTimer = window.setTimeout(() => {
    applyGuideBubble(kind);
  }, 300);
}

function hideGuideBubble() {
  if (!guideBubble) return;
  window.clearTimeout(guideTransitionTimer);
  guideBubble.classList.remove("is-visible");
  guideBubble.setAttribute("aria-hidden", "true");
}

function setScenarioControl(nextScenario) {
  scenarioOptions.forEach((option) => {
    option.classList.toggle("active", option.dataset.scenario === nextScenario);
  });
}

function setGuideScenario(nextScenario) {
  guideScenario = nextScenario === "selected" ? "selected" : "unselected";
  setScenarioControl(guideScenario);

  if (guideScenario === "selected") {
    setChat("mom");
    showGuideBubble("selected");
    return;
  }

  setChat("temp");
  showGuideBubble("unselected");
}

function setChat(kind) {
  phone.dataset.chat = kind;
  phone.dataset.thread = "";
  phone.dataset.screen = "chat";
  setActiveHistory("");
  renderChat(kind, "bottom");
}

function setThread(threadId) {
  const thread = historyThreads[threadId];
  if (!thread) return;

  phone.dataset.chat = thread.person;
  phone.dataset.thread = threadId;
  phone.dataset.panel = "none";
  phone.dataset.screen = "chat";
  setActiveHistory(threadId);
  renderMessages(thread.messages);
}

function openSidebar() {
  phone.dataset.panel = "none";
  phone.dataset.screen = "sidebar";
}

function setHealthPerson(kind) {
  if (!phone || !healthContent[kind]) return;

  phone.dataset.healthPerson = kind;
  profileCards.forEach((card) => {
    const isActive = card.dataset.person === kind;
    card.classList.toggle("active", isActive);
    card.classList.toggle("muted", !isActive);
  });

  if (healthTitle) {
    healthTitle.textContent = healthContent[kind].title;
  }
}

function openHealth(kind = phone.dataset.healthPerson || "mom") {
  phone.dataset.panel = "none";
  setHealthPerson(kind);
  phone.dataset.screen = "health";
}

function closeHealth() {
  phone.dataset.panel = "none";
  phone.dataset.screen = "chat";
}

function openPersonPanel() {
  if (!phone) return;
  phone.dataset.panel = "person";
  window.requestAnimationFrame(() => {
    nicknameField?.focus({ preventScroll: true });
  });
}

function closePersonPanel() {
  if (!phone) return;
  phone.dataset.panel = "none";
}

setHealthPerson(phone?.dataset.healthPerson || "mom");
setGuideScenario("unselected");

document.addEventListener("click", (event) => {
  if (event.target.closest(".guide-bubble")) {
    return;
  }

  const control = event.target.closest("[data-action]");
  if (!control) {
    hideGuideBubble();
    return;
  }

  const action = control.dataset.action;
  let keepGuideVisible = false;
  const previousChat = phone?.dataset.chat;

  if (action === "set-guide-scenario") {
    setGuideScenario(control.dataset.scenario);
    keepGuideVisible = true;
  }
  if (action === "open-sidebar") openSidebar();
  if (action === "close-sidebar") {
    closePersonPanel();
    phone.dataset.screen = "chat";
  }
  if (action === "open-health") openHealth();
  if (action === "open-health-self") openHealth("self");
  if (action === "open-health-mom") openHealth("mom");
  if (action === "close-health") closeHealth();
  if (action === "health-person-self") setHealthPerson("self");
  if (action === "health-person-mom") setHealthPerson("mom");
  if (action === "open-new-person") openPersonPanel();
  if (action === "close-person-panel") closePersonPanel();
  if (action === "open-thread") setThread(control.dataset.thread);
  if (action === "chat-temp") {
    setChat("temp");
    if (guideScenario === "selected") {
      transitionGuideBubble("tempFromSelected");
      keepGuideVisible = true;
    }
  }
  if (action === "chat-self") {
    setChat("self");
    if (guideScenario === "unselected" && previousChat === "temp") {
      transitionGuideBubble("selfFromUnselected");
      keepGuideVisible = true;
    }
  }
  if (action === "chat-mom") {
    setChat("mom");
    if (guideScenario === "selected") {
      transitionGuideBubble("selected");
      keepGuideVisible = true;
    } else if (guideScenario === "unselected" && previousChat === "temp") {
      transitionGuideBubble("momFromUnselected");
      keepGuideVisible = true;
    }
  }

  if (!keepGuideVisible) {
    hideGuideBubble();
  }
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value || !chatList) {
    return;
  }

  const kind = phone?.dataset.chat || "temp";
  const threadId = phone?.dataset.thread;
  const targetMessages = threadId && historyThreads[threadId] ? historyThreads[threadId].messages : chatContent[kind];
  const message = { role: "user", text: value };
  targetMessages.push(message);
  appendMessage(message);
  input.value = "";
  hideGuideBubble();
  chatList.scrollTop = chatList.scrollHeight;
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (phone.dataset.panel === "person") {
      closePersonPanel();
      return;
    }
    if (phone.dataset.screen === "sidebar") phone.dataset.screen = "chat";
    if (phone.dataset.screen === "health") closeHealth();
  }
});
