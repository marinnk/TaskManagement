import { describe, expect, it } from 'vitest';
import { computeDropIndex } from '../dragDrop';

function createCardElement(cardId: number, top: number, height: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.cardId = String(cardId);
  el.getBoundingClientRect = () =>
    ({
      top,
      height,
      bottom: top + height,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: top,
      toJSON() {},
    }) as DOMRect;
  return el;
}

function createContainer(cards: HTMLElement[]): HTMLElement {
  const container = document.createElement('div');
  cards.forEach((card) => container.appendChild(card));
  return container;
}

describe('computeDropIndex', () => {
  it('カードが1枚も無いリストにドロップすると index 0 になる', () => {
    const container = createContainer([]);
    expect(computeDropIndex(container, 100, -1)).toBe(0);
  });

  it('先頭カードの上半分にドロップすると index 0 になる', () => {
    const container = createContainer([createCardElement(1, 0, 100), createCardElement(2, 100, 100)]);
    expect(computeDropIndex(container, 20, -1)).toBe(0);
  });

  it('カードの下半分にドロップするとそのカードの直後の index になる', () => {
    const container = createContainer([createCardElement(1, 0, 100), createCardElement(2, 100, 100)]);
    expect(computeDropIndex(container, 60, -1)).toBe(1);
  });

  it('末尾カードより下にドロップするとカード枚数と同じ index になる（末尾に挿入）', () => {
    const container = createContainer([createCardElement(1, 0, 100), createCardElement(2, 100, 100)]);
    expect(computeDropIndex(container, 250, -1)).toBe(2);
  });

  it('ドラッグ中のカード自身は位置計算の対象から除外される', () => {
    const container = createContainer([
      createCardElement(1, 0, 100),
      createCardElement(2, 100, 100),
      createCardElement(3, 200, 100),
    ]);
    expect(computeDropIndex(container, 250, 2)).toBe(1);
  });
});
