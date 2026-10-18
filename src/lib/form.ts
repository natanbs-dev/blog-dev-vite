/** Lê os campos de um <form> como objeto de strings. */
export const formValues = (form: HTMLFormElement) =>
  Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, String(v)])) as Record<string, string>;
