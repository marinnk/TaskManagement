const STORAGE_KEY = "kanban-mock-state";

const INITIAL_STATE = {
  nextId: 6,
  lists: [
    { id: "todo", name: "未着手", cards: [
      { id: 1, title: "カードA" },
      { id: 2, title: "カードB" },
    ] },
    { id: "doing", name: "作業中", cards: [
      { id: 3, title: "カードC" },
      { id: 4, title: "カードD" },
    ] },
    { id: "done", name: "完了", cards: [
      { id: 5, title: "カードE" },
    ] },
  ],
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(INITIAL_STATE);
  try {
    return JSON.parse(raw);
  } catch {
    return structuredClone(INITIAL_STATE);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function findList(listId) {
  return state.lists.find((list) => list.id === listId);
}

function addCard(listId, title, description, dueDate) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const list = findList(listId);
  list.cards.push({
    id: state.nextId++,
    title: trimmed,
    description: description ? description.trim() : "",
    dueDate: dueDate || null,
  });
  saveState(state);
  render();
}

function updateCard(listId, cardId, title, description, dueDate) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const list = findList(listId);
  const card = list.cards.find((c) => c.id === cardId);
  if (!card) return;
  card.title = trimmed;
  card.description = description ? description.trim() : "";
  card.dueDate = dueDate || null;
  saveState(state);
  render();
}

function deleteCard(listId, cardId) {
  const list = findList(listId);
  list.cards = list.cards.filter((card) => card.id !== cardId);
  saveState(state);
  render();
}

function moveCard(cardId, fromListId, toListId) {
  if (fromListId === toListId) return;
  const fromList = findList(fromListId);
  const toList = findList(toListId);
  const cardIndex = fromList.cards.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) return;
  const [card] = fromList.cards.splice(cardIndex, 1);
  toList.cards.push(card);
  saveState(state);
  render();
}

function createCardElement(listId, card) {
  const cardEl = document.createElement("div");
  cardEl.className = "card";
  cardEl.draggable = true;
  if (card.description) {
    cardEl.title = card.description;
  }

  const titleEl = document.createElement("div");
  titleEl.className = "card-title";
  titleEl.textContent = card.title;
  cardEl.appendChild(titleEl);

  if (card.dueDate) {
    const dueEl = document.createElement("div");
    dueEl.className = "card-due";
    dueEl.textContent = `期限: ${card.dueDate}`;
    cardEl.appendChild(dueEl);
  }

  cardEl.addEventListener("dblclick", (e) => {
    if (e.target.closest(".card-delete")) return;
    openEditCardModal(listId, card);
  });

  cardEl.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ cardId: card.id, fromListId: listId })
    );
    cardEl.classList.add("dragging");
  });
  cardEl.addEventListener("dragend", () => {
    cardEl.classList.remove("dragging");
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "card-delete";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", "カードを削除");
  deleteBtn.addEventListener("click", () => deleteCard(listId, card.id));

  cardEl.appendChild(deleteBtn);
  return cardEl;
}

function createListElement(list) {
  const listEl = document.createElement("section");
  listEl.className = "list";

  const nameEl = document.createElement("h2");
  nameEl.className = "list-name";
  nameEl.textContent = list.name;
  listEl.appendChild(nameEl);

  const cardListEl = document.createElement("div");
  cardListEl.className = "card-list";
  list.cards.forEach((card) => {
    cardListEl.appendChild(createCardElement(list.id, card));
  });
  listEl.appendChild(cardListEl);

  listEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    listEl.classList.add("drag-over");
  });
  listEl.addEventListener("dragleave", () => {
    listEl.classList.remove("drag-over");
  });
  listEl.addEventListener("drop", (e) => {
    e.preventDefault();
    listEl.classList.remove("drag-over");
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;
    const { cardId, fromListId } = JSON.parse(data);
    moveCard(cardId, fromListId, list.id);
  });

  const addCardEl = document.createElement("div");
  addCardEl.className = "add-card";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "+ カード追加";
  addBtn.addEventListener("click", () => openCardModal(list.id));

  addCardEl.appendChild(addBtn);
  listEl.appendChild(addCardEl);

  return listEl;
}

function render() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  state.lists.forEach((list) => {
    board.appendChild(createListElement(list));
  });
}

const cardModal = document.getElementById("card-modal");
const cardModalHeading = document.getElementById("card-modal-heading");
const cardForm = document.getElementById("card-form");
const cardTitleInput = document.getElementById("card-title-input");
const cardDescInput = document.getElementById("card-desc-input");
const cardDueInput = document.getElementById("card-due-input");
const cardModalCancel = document.getElementById("card-modal-cancel");
const cardModalSubmit = document.getElementById("card-modal-submit");

let activeListId = null;
let editingCardId = null;

function openCardModal(listId) {
  activeListId = listId;
  editingCardId = null;
  cardForm.reset();
  cardModalHeading.textContent = "カードを追加";
  cardModalSubmit.textContent = "追加";
  cardModal.classList.remove("hidden");
  cardModal.setAttribute("aria-hidden", "false");
  cardTitleInput.focus();
}

function openEditCardModal(listId, card) {
  activeListId = listId;
  editingCardId = card.id;
  cardForm.reset();
  cardTitleInput.value = card.title;
  cardDescInput.value = card.description || "";
  cardDueInput.value = card.dueDate || "";
  cardModalHeading.textContent = "カードを編集";
  cardModalSubmit.textContent = "保存";
  cardModal.classList.remove("hidden");
  cardModal.setAttribute("aria-hidden", "false");
  cardTitleInput.focus();
}

function closeCardModal() {
  cardModal.classList.add("hidden");
  cardModal.setAttribute("aria-hidden", "true");
  activeListId = null;
  editingCardId = null;
}

cardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!activeListId) return;
  if (editingCardId) {
    updateCard(activeListId, editingCardId, cardTitleInput.value, cardDescInput.value, cardDueInput.value);
  } else {
    addCard(activeListId, cardTitleInput.value, cardDescInput.value, cardDueInput.value);
  }
  closeCardModal();
});

cardModalCancel.addEventListener("click", () => closeCardModal());

cardModal.addEventListener("click", (e) => {
  if (e.target === cardModal) closeCardModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !cardModal.classList.contains("hidden")) {
    closeCardModal();
  }
});

saveState(state);
render();
