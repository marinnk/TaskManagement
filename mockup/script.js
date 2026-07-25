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

function insertCardSorted(list, card) {
  const insertIndex = list.cards.findIndex(
    (c) => c.dueDate && c.dueDate > card.dueDate
  );
  if (insertIndex === -1) {
    list.cards.push(card);
  } else {
    list.cards.splice(insertIndex, 0, card);
  }
}

function addCard(listId, title, description, dueDate) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const list = findList(listId);
  const card = {
    id: state.nextId++,
    title: trimmed,
    description: description ? description.trim() : "",
    dueDate: dueDate || null,
  };
  if (card.dueDate) {
    insertCardSorted(list, card);
  } else {
    list.cards.push(card);
  }
  saveState(state);
  render();
}

function updateCard(listId, cardId, title, description, dueDate) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const list = findList(listId);
  const index = list.cards.findIndex((c) => c.id === cardId);
  if (index === -1) return;
  const card = list.cards[index];
  card.title = trimmed;
  card.description = description ? description.trim() : "";
  card.dueDate = dueDate || null;
  if (card.dueDate) {
    list.cards.splice(index, 1);
    insertCardSorted(list, card);
  }
  saveState(state);
  render();
}

function deleteCard(listId, cardId) {
  const list = findList(listId);
  list.cards = list.cards.filter((card) => card.id !== cardId);
  saveState(state);
  render();
}

function findCardById(cardId) {
  for (const list of state.lists) {
    const card = list.cards.find((c) => c.id === cardId);
    if (card) return card;
  }
  return null;
}

function reorderFromDOM() {
  const orderByList = [];
  document.querySelectorAll(".list").forEach((listEl) => {
    const cardListEl = listEl.querySelector(".card-list");
    orderByList.push({
      listId: listEl.dataset.listId,
      cardIds: [...cardListEl.children].map((el) => Number(el.dataset.cardId)),
    });
  });
  orderByList.forEach(({ listId, cardIds }) => {
    const list = findList(listId);
    list.cards = cardIds.map((cardId) => findCardById(cardId));
  });
  saveState(state);
  render();
}

function getDragAfterElement(cardListEl, y) {
  const cards = [...cardListEl.querySelectorAll(".card:not(.dragging)")];
  return cards.reduce(
    (closest, cardEl) => {
      const box = cardEl.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: cardEl };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function createCardElement(listId, card) {
  const cardEl = document.createElement("div");
  cardEl.className = "card";
  cardEl.draggable = true;
  cardEl.dataset.cardId = String(card.id);
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
    e.dataTransfer.setData("text/plain", String(card.id));
    cardEl.classList.add("dragging");
  });
  cardEl.addEventListener("dragend", () => {
    cardEl.classList.remove("dragging");
    reorderFromDOM();
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
  listEl.dataset.listId = list.id;

  const nameEl = document.createElement("h2");
  nameEl.className = "list-name";
  nameEl.textContent = list.name;

  const countEl = document.createElement("span");
  countEl.className = "list-count";
  countEl.textContent = list.cards.length;
  nameEl.appendChild(countEl);

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
    const dragging = cardListEl.querySelector(".card.dragging") || document.querySelector(".card.dragging");
    if (!dragging) return;
    const afterElement = getDragAfterElement(cardListEl, e.clientY);
    if (afterElement == null) {
      cardListEl.appendChild(dragging);
    } else {
      cardListEl.insertBefore(dragging, afterElement);
    }
  });
  listEl.addEventListener("dragleave", (e) => {
    if (!listEl.contains(e.relatedTarget)) {
      listEl.classList.remove("drag-over");
    }
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
