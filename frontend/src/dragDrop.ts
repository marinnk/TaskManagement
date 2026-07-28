// 「ドラッグ中のカード自身」を除いた、他のカードだけを数えた挿入先index。
// バックエンドのCardCommandService#moveCardが期待する「自分以外のカードの中での位置」と同じ意味。
export function computeDropIndex(container: HTMLElement, clientY: number, draggingCardId: number): number {
  let index = 0;
  const cardElements = container.querySelectorAll<HTMLElement>(':scope > .card');
  for (const child of Array.from(cardElements)) {
    if (Number(child.dataset.cardId) === draggingCardId) continue;
    const rect = child.getBoundingClientRect();
    if (clientY > rect.top + rect.height / 2) {
      index++;
    } else {
      break;
    }
  }
  return index;
}
