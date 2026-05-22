const phone = document.querySelector("#coldPhone");
const form = document.querySelector("#coldComposerForm");
const input = document.querySelector("#coldMessageInput");
const chatList = document.querySelector(".cold-chat-list");
const nicknameField = document.querySelector(".nickname-field");
const selfTabAvatar = document.querySelector(".tab-self img");
const selfTabLabel = document.querySelector(".tab-self span");
const sexInputs = document.querySelectorAll('input[name="cold-sex"]');
const tabs = document.querySelector(".cold-tabs");
const createPersonTab = document.querySelector(".tab-new-person");
const drawerPeople = document.querySelector(".cold-profile-list");
const drawerAddButton = drawerPeople?.querySelector(".person-add");
const avatarByGender = {
  male: "./assets/tab-self.png",
  female: "./assets/tab-mom.png",
};
const drawerAvatarByGender = {
  male: "./assets/avatar-self.png",
  female: "./assets/avatar-mom.png",
};
let createdPersonIndex = 0;
let selfGender = "male";
let selfProfileCreated = false;

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

  const text = document.createElement("p");
  text.className = "ai-msg";
  text.textContent = message.text;
  chatList.appendChild(text);
}

function setScreen(screen) {
  if (!phone) return;
  phone.dataset.screen = screen;
}

function setActiveChat(chatId) {
  if (!phone) return;
  phone.dataset.chat = chatId;
  document.querySelectorAll(".cold-tabs .tab-created").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.chatId === chatId);
  });
}

function getSelectedGender() {
  return document.querySelector('input[name="cold-sex"]:checked')?.value || "male";
}

function setSelectedGender(gender) {
  sexInputs.forEach((input) => {
    input.checked = input.value === gender;
  });
}

function getAvatarForGender(gender) {
  return avatarByGender[gender] || avatarByGender.male;
}

function getDrawerAvatarForGender(gender) {
  return drawerAvatarByGender[gender] || drawerAvatarByGender.male;
}

function upsertDrawerPerson(chatId, name, gender) {
  if (!phone || !drawerPeople || !drawerAddButton || !chatId) return;

  phone.dataset.records = "ready";
  let button = drawerPeople.querySelector(`[data-chat-id="${chatId}"]`);
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "cold-profile-person";
    button.dataset.chatId = chatId;
    button.dataset.action = chatId === "self" ? "choose-self" : "select-created-person";

    const avatar = document.createElement("img");
    avatar.alt = "";
    const label = document.createElement("span");

    button.append(avatar, label);
    drawerPeople.insertBefore(button, drawerAddButton);
  }

  const avatar = button.querySelector("img");
  const label = button.querySelector("span");
  if (avatar) avatar.src = getDrawerAvatarForGender(gender);
  if (label) label.textContent = name;
}

function createCreatedPersonTab(name, gender) {
  if (!tabs || !createPersonTab) return "";

  createPersonTab.classList.add("icon-only");
  createdPersonIndex += 1;
  const chatId = `created-${createdPersonIndex}`;
  const tab = document.createElement("button");
  tab.className = "tab tab-created";
  tab.type = "button";
  tab.dataset.action = "select-created-person";
  tab.dataset.chatId = chatId;
  tab.dataset.gender = gender;

  const avatar = document.createElement("img");
  avatar.src = getAvatarForGender(gender);
  avatar.alt = "";

  const label = document.createElement("span");
  label.textContent = name;

  tab.append(avatar, label);
  tabs.insertBefore(tab, createPersonTab);
  window.requestAnimationFrame(() => {
    tab.scrollIntoView({ block: "nearest", inline: "center" });
  });

  return chatId;
}

function openTempConsult() {
  if (!phone) return;
  phone.dataset.mode = "chat";
  phone.dataset.panel = "none";
  phone.dataset.keyboard = "open";
  phone.dataset.personSource = "";
  setActiveChat("temp");
  setScreen("chat");
}

function openSidebar() {
  if (!phone) return;
  phone.dataset.panel = "none";
  setScreen("sidebar");
}

function closeSidebar() {
  if (!phone) return;
  setScreen(phone.dataset.mode === "chat" ? "chat" : "cold");
}

function openPersonPanel(prefill = "", source = "new", returnScreen = "") {
  if (!phone) return;
  phone.dataset.panel = "person";
  phone.dataset.keyboard = "open";
  phone.dataset.personSource = source;
  phone.dataset.panelReturnScreen = returnScreen || phone.dataset.screen || "";
  setSelectedGender(source === "self" ? selfGender : "");
  if (nicknameField) {
    nicknameField.value = prefill;
  }
  window.requestAnimationFrame(() => {
    nicknameField?.focus({ preventScroll: true });
  });
}

function openHealthPersonPanel() {
  openPersonPanel("", "drawer", "sidebar");
}

function selectSelf() {
  if (!phone) return;
  if (!selfProfileCreated) {
    openPersonPanel(selfTabLabel?.textContent.trim() || "本人", "self");
    return;
  }

  phone.dataset.mode = "chat";
  phone.dataset.panel = "none";
  phone.dataset.keyboard = "open";
  phone.dataset.personSource = "";
  setActiveChat("self");
  setScreen("chat");
}

function closePersonPanel() {
  if (!phone) return;
  phone.dataset.panel = "none";
  phone.dataset.keyboard = "open";
  phone.dataset.personSource = "";
  phone.dataset.panelReturnScreen = "";
}

function collapseKeyboard() {
  if (!phone || phone.dataset.panel !== "person") return;
  phone.dataset.keyboard = "closed";
}

function savePerson() {
  if (!phone) return;
  const source = phone.dataset.personSource;
  const fallbackName = source === "self" ? "本人" : "咨询人";
  const name = nicknameField?.value.trim() || fallbackName;
  const gender = getSelectedGender();
  const shouldReturnToSidebar = phone.dataset.panelReturnScreen === "sidebar" || source === "drawer";
  phone.dataset.mode = "chat";
  phone.dataset.panel = "none";
  phone.dataset.keyboard = "open";
  phone.dataset.personSource = "";
  phone.dataset.panelReturnScreen = "";

  if (source === "self") {
    selfProfileCreated = true;
    selfGender = gender;
    if (selfTabAvatar) selfTabAvatar.src = getAvatarForGender(gender);
    if (selfTabLabel) selfTabLabel.textContent = name;
    setActiveChat("self");
    upsertDrawerPerson("self", name, gender);
  } else {
    const chatId = createCreatedPersonTab(name, gender);
    setActiveChat(chatId);
    upsertDrawerPerson(chatId, name, gender);
  }

  setScreen(shouldReturnToSidebar ? "sidebar" : "chat");
}

document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (event.target.closest(".sex-row")) {
    collapseKeyboard();
  }
  if (!control) return;

  const action = control.dataset.action;
  if (action === "open-sidebar") openSidebar();
  if (action === "close-sidebar") closeSidebar();
  if (action === "choose-temp") openTempConsult();
  if (action === "choose-self") selectSelf();
  if (action === "open-new-person") openPersonPanel("", "new");
  if (action === "open-sidebar-person") openHealthPersonPanel();
  if (action === "select-created-person") {
    setActiveChat(control.dataset.chatId || "");
    phone.dataset.mode = "chat";
    setScreen("chat");
  }
  if (action === "close-person-panel") closePersonPanel();
  if (action === "save-person") savePerson();
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;

  openTempConsult();
  appendMessage({ role: "user", text: value });
  appendMessage({ role: "ai", text: "我先按临时咨询帮你看。你可以继续补充症状、持续时间和有没有用药。" });
  input.value = "";
  chatList.scrollTop = chatList.scrollHeight;
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (phone?.dataset.panel === "person") {
    closePersonPanel();
    return;
  }
  if (phone?.dataset.screen === "sidebar") {
    closeSidebar();
  }
});
