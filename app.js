const telegramApp = window.Telegram?.WebApp;
const MAX_FLOWERS = 10;

const flowers = [
  { id: 1, key: "rose", name: "နှင်းဆီ", emoji: "🌹" },
  { id: 2, key: "thazin", name: "သဇင်", emoji: "🌾" },
  { id: 3, key: "orchid", name: "သစ်ခွ", emoji: "🌺" },
  { id: 4, key: "sabal", name: "စံပယ်", emoji: "🪷" },
  { id: 5, key: "padouk", name: "ပိတောက်", emoji: "🏵️" },
  { id: 6, key: "cherry", name: "ချယ်ရီ", emoji: "🌸" },
  { id: 7, key: "lavender", name: "လာဗင်ဒါ", emoji: "🪻" },
  { id: 8, key: "kankaw", name: "ကံ့ကော်", emoji: "🌼" },
  { id: 9, key: "sunflower", name: "နေကြာ", emoji: "🌻" },
  { id: 10, key: "tulip", name: "ကျူးလစ်", emoji: "🌷" },
];

const state = {
  studentId: "",
  flowerId: 1,
  quantity: 1,
};

if (telegramApp) {
  telegramApp.ready();
  telegramApp.expand();
}

function renderFlowers() {
  const grid = document.getElementById("flower-grid");
  grid.innerHTML = "";

  flowers.forEach((flower) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "flower-card" + (state.flowerId === flower.id ? " is-selected" : "");
    card.innerHTML = `
      <span class="flower-badge">${flower.emoji}</span>
      <span class="flower-name">${flower.name}</span>
    `;
    card.addEventListener("click", () => {
      state.flowerId = flower.id;
      renderFlowers();
      renderReview();
    });
    grid.appendChild(card);
  });
}

function renderReview() {
  const flower = flowers.find((item) => item.id === state.flowerId) || flowers[0];
  const studentId = document.getElementById("student-id").value.trim();
  document.getElementById("review-flower").textContent = `${flower.emoji} ${flower.name}`;
  document.getElementById("review-quantity").textContent = String(state.quantity);
  document.getElementById("review-student").textContent = studentId || "—";
}

function refreshQuantity() {
  document.getElementById("quantity-value").textContent = String(state.quantity);
  renderReview();
}

document.getElementById("student-id").addEventListener("input", renderReview);
document.getElementById("minus-btn").addEventListener("click", () => {
  state.quantity = Math.max(1, state.quantity - 1);
  refreshQuantity();
});
document.getElementById("plus-btn").addEventListener("click", () => {
  state.quantity = Math.min(MAX_FLOWERS, state.quantity + 1);
  refreshQuantity();
});

document.getElementById("submit-btn").addEventListener("click", () => {
  const studentId = document.getElementById("student-id").value.trim();
  if (!studentId) {
    alert("Student ID ကို ဖြည့်ပေးပါ။");
    document.getElementById("student-id").focus();
    return;
  }

  const payload = {
    version: 1,
    student_id: studentId,
    flower_id: state.flowerId,
    quantity: state.quantity,
  };

  if (!telegramApp || typeof telegramApp.sendData !== "function") {
    alert("This page must be opened inside Telegram to send the order.");
    return;
  }

  telegramApp.sendData(JSON.stringify(payload));
});

renderFlowers();
refreshQuantity();
