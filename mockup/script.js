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

function addCard(listId, title) {
  const trimmed = title.trim();
  if (!trimmed) return;
  const list = findList(listId);
  list.cards.push({ id: state.nextId++, title: trimmed });
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
  cardEl.textContent = card.title;

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

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "カードのタイトルを入力";

  const submit = () => {
    addCard(list.id, input.value);
    input.value = "";
    input.focus();
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "+ カード追加";
  addBtn.addEventListener("click", submit);

  addCardEl.appendChild(input);
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

saveState(state);
render();
