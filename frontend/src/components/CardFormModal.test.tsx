import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CardFormModal } from './CardFormModal';

describe('CardFormModal', () => {
  it('新規追加モードでは「カードを追加」の見出しと「追加」ボタンが表示される', () => {
    render(<CardFormModal onCancel={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByText('カードを追加')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('タイトルが未入力のときは追加ボタンが無効になる', () => {
    render(<CardFormModal onCancel={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: '追加' })).toBeDisabled();
  });

  it('タイトルを入力すると追加ボタンが有効になり、前後の空白を除いた内容でonSubmitが呼ばれる', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CardFormModal onCancel={vi.fn()} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/タイトル/), '  買い物に行く  ');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: '買い物に行く',
      description: null,
      dueDate: null,
    });
  });

  it('編集モードでは初期値が入力済みで表示され、見出しとボタンが編集用になる', () => {
    render(
      <CardFormModal
        initialValues={{ title: '既存タスク', description: 'メモ', dueDate: '2026-08-01' }}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText('カードを編集')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('既存タスク')).toBeInTheDocument();
    expect(screen.getByDisplayValue('メモ')).toBeInTheDocument();
  });

  it('キャンセルボタンを押すとonCancelが呼ばれる', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<CardFormModal onCancel={onCancel} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
