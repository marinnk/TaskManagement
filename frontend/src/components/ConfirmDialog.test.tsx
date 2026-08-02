import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('タイトル・メッセージ・確認ボタンのラベルが表示される', () => {
    render(
      <ConfirmDialog
        title="カードを削除しますか?"
        message="この操作は取り消せません。"
        onCancel={vi.fn()}
        onConfirm={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText('カードを削除しますか?')).toBeInTheDocument();
    expect(screen.getByText('この操作は取り消せません。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
  });

  it('ダイアログとして認識できるrole属性を持つ', () => {
    render(<ConfirmDialog title="確認" message="メッセージ" onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: '確認' })).toBeInTheDocument();
  });

  it('確認ボタンを押すとonConfirmが呼ばれる', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<ConfirmDialog title="確認" message="メッセージ" onCancel={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: '削除' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Escapeキーを押すとonCancelが呼ばれる', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmDialog title="確認" message="メッセージ" onCancel={onCancel} onConfirm={vi.fn()} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
