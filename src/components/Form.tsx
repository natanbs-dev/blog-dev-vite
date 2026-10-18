import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

interface Wrap {
  label: string;
  error?: string;
  hint?: string;
}

/** Rótulo, dica e erro ligados ao controle por aria. */
function FieldShell({ label, error, hint, render }: Wrap & { render: (a: Record<string, unknown>) => ReactNode }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      {render({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export function Field({ label, error, hint, ...input }: Wrap & InputHTMLAttributes<HTMLInputElement>) {
  return <FieldShell label={label} error={error} hint={hint} render={(a) => <input {...a} {...input} />} />;
}

export function TextArea({ label, error, hint, ...area }: Wrap & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <FieldShell label={label} error={error} hint={hint} render={(a) => <textarea {...a} {...area} />} />;
}

export function FormMessage({ kind, children }: { kind: 'error' | 'ok' | 'info'; children: ReactNode }) {
  return (
    <p className={`form-msg form-msg--${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
