import { useCallback, useState } from 'react';
import { ApiError } from './api';

/** Estado de um formulário que chama a API: ocupado, erro geral e erros por campo. */
export function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setFields({});
    try {
      await fn();
    } catch (err) {
      if (err instanceof ApiError) {
        setFields(err.fields);
        // com erro por campo, a mensagem geral só repete; mostra só se não houver
        if (Object.keys(err.fields).length === 0 || err.code === 'conflict') setError(err.message);
      } else {
        setError('Algo deu errado. Tente de novo.');
      }
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, fields, run, setError };
}
