import type { ReactNode } from 'react';

/** Moldura das páginas de conta: título no padrão do blog e coluna estreita. */
export default function AccountShell({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <div className="wrap account">
      <header className="page-head account__head">
        <p className="account__shell" aria-hidden="true">
          $ barbosa.md --conta
        </p>
        <h1>{title}</h1>
        {lede && <p>{lede}</p>}
      </header>
      <div className="account__body">{children}</div>
    </div>
  );
}
