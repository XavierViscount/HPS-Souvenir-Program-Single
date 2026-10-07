const telegramApp = window.Telegram?.WebApp;
const MAX_FLOWERS = 10;

const flowers = [
  { id: 1, key: "rose", name: "နှင်းဆီ", color: "#f0e0dc" },
  { id: 2, key: "thazin", name: "သဇင်", color: "#ece9d8" },
  { id: 3, key: "orchid", name: "သစ်ခွ", color: "#ece2e9" },
  { id: 4, key: "sabal", name: "စံပယ်", color: "#e2eae0" },
  { id: 5, key: "padouk", name: "ပိတောက်", color: "#efe7d7" },
  { id: 6, key: "cherry", name: "ချယ်ရီ", color: "#f0e0dc" },
  { id: 7, key: "lavender", name: "လာဗင်ဒါ", color: "#e8e4e9" },
  { id: 8, key: "kankaw", name: "ကံ့ကော်", color: "#efe9d9" },
  { id: 9, key: "sunflower", name: "နေကြာ", color: "#f0ead3" },
  { id: 10, key: "tulip", name: "ကျူးလစ်", color: "#efe0dd" },
];

const iconPaths = {
  flower: '<path d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"/><path d="M12 2v3m0 14v3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12M2 12h3m14 0h3M4.93 19.07l2.12-2.12m9.9-9.9 2.12-2.12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
};

const burmeseDigits = "၀၁၂၃၄၅၆၇၈၉";
const state = { studentId: "", flowerId: 1, quantity: 1 };
const screens = [...document.querySelectorAll("[data-screen]")];

function createIcon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = iconPaths[name];
  return svg;
}

if (telegramApp) {
  telegramApp.ready();
  telegramApp.expand();
  if (telegramApp.versionAtLeast?.("6.1")) {
    telegramApp.setHeaderColor("#f6e9e8");
    telegramApp.setBackgroundColor("#f6e9e8");
  }
}

function toBurmese(value) {
  return String(value).replace(/[0-9]/g, digit => burmeseDigits[Number(digit)]);
}

function showScreen(name) {
  screens.forEach(screen => { screen.hidden = screen.dataset.screen !== name; });
  const order = ["id", "flowers", "review"];
  const activeIndex = order.indexOf(name);
  document.querySelectorAll("[data-progress]").forEach((item, index) => {
    item.classList.toggle("is-active", index === activeIndex);
    item.classList.toggle("is-done", index < activeIndex);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function makeThumbnail(flower, className = "flower-thumb") {
  const box = document.createElement("span");
  box.className = className;
  box.style.setProperty("--thumb-bg", flower.color);
  const image = document.createElement("img");
  image.src = `assets/flowers/${flower.key}.png`;
  image.alt = "";
  image.loading = "lazy";
  image.onerror = () => {
    image.remove();
    box.append(createIcon("flower"));
    box.setAttribute("aria-hidden", "true");
  };
  box.append(image);
  return box;
}

function renderSingleFlowers() {
  const grid = document.getElementById("single-flower-grid");
  grid.replaceChildren();
  for (const flower of flowers) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "single-flower-option";
    option.classList.toggle("is-selected", state.flowerId === flower.id);
    option.setAttribute("aria-pressed", String(state.flowerId === flower.id));
    option.append(makeThumbnail(flower));
    const name = document.createElement("strong");
    name.textContent = flower.name;
    const key = document.createElement("small");
    key.textContent = flower.key;
    option.append(name, key);
    option.addEventListener("click", () => {
      state.flowerId = flower.id;
      renderSingleFlowers();
    });
    grid.append(option);
  }
  
  document.getElementById("single-total").textContent = toBurmese(state.quantity);
  document.getElementById("single-minus").disabled = state.quantity <= 1;
  document.getElementById("single-plus").disabled = state.quantity >= MAX_FLOWERS;
}

function changeSingleQuantity(delta) {
  const next = Math.max(1, Math.min(MAX_FLOWERS, state.quantity + delta));
  state.quantity = next;
  renderSingleFlowers();
}

function renderReview() {
  document.getElementById("review-student-id").textContent = state.studentId;
  document.getElementById("review-total").textContent = `${toBurmese(state.quantity)} ပွင့်`;
  const items = document.getElementById("review-items");
  items.replaceChildren();
  
  const flower = flowers.find(f => f.id === state.flowerId);
  const line = document.createElement("div");
  line.className = "review-line";
  const name = document.createElement("span");
  name.textContent = flower.name;
  const amount = document.createElement("strong");
  amount.textContent = `×${toBurmese(state.quantity)}`;
  line.append(name, amount);
  items.append(line);
}

function submitOrder() {
  if (!state.studentId) {
    alert("Student ID ကို အရင်ဖြည့်ပေးပါ။");
    showScreen("id");
    return;
  }

  const payload = {
    version: 1,
    student_id: state.studentId,
    flower_id: state.flowerId,
    quantity: state.quantity,
  };

  if (!telegramApp || typeof telegramApp.sendData !== "function") {
    alert("အော်ဒါတင်ရန် Telegram ထဲမှ Mini App ကို ဖွင့်ပါ။");
    return;
  }
  telegramApp.sendData(JSON.stringify(payload));
}

document.getElementById("student-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("student-id");
  const value = input.value.trim();
  if (!value) {
    alert("Student ID ကို ဖြည့်ပေးပါ။");
    input.focus();
    return;
  }
  state.studentId = value;
  renderSingleFlowers();
  showScreen("flowers");
});

document.querySelectorAll("[data-back]").forEach(button => {
  button.addEventListener("click", () => showScreen(button.dataset.back));
});

document.getElementById("review-single").addEventListener("click", () => {
  renderReview();
  showScreen("review");
});

document.getElementById("single-minus").addEventListener("click", () => changeSingleQuantity(-1));
document.getElementById("single-plus").addEventListener("click", () => changeSingleQuantity(1));
document.getElementById("submit-btn").addEventListener("click", submitOrder);
document.getElementById("close-app").addEventListener("click", () => {
  if (telegramApp) telegramApp.close();
});

renderSingleFlowers();
