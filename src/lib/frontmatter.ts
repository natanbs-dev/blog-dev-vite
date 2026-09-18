/* Parser mínimo de front-matter YAML — zero dependências, seguro no browser.
   Substitui o gray-matter no client (que puxava js-yaml/Buffer do Node e
   quebrava a página com "Buffer is not defined").
   Suporta o subset usado em content/posts: strings (com/sem aspas),
   boolean, arrays inline ["a", "b"] e listas com "- ". */

export interface FrontmatterResult {
  data: Record<string, unknown>;
  content: string;
}

function stripQuotes(s: string): string {
  const t = s.trim();
  if (t.length >= 2) {
    const first = t[0];
    const last = t[t.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      const inner = t.slice(1, -1);
      // em aspas duplas, "" escapa uma aspa; em simples, '' idem
      return first === '"' ? inner.replace(/\\"/g, '"') : inner.replace(/''/g, "'");
    }
  }
  return t;
}

function parseInlineArray(value: string): string[] {
  const inner = value.trim().replace(/^\[/, '').replace(/\]$/, '');
  if (!inner.trim()) return [];
  const items: string[] = [];
  // divide por vírgula respeitando aspas simples/duplas
  let current = '';
  let quote: string | null = null;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
    } else if (ch === ',') {
      const item = stripQuotes(current);
      if (item) items.push(item);
      current = '';
    } else {
      current += ch;
    }
  }
  const last = stripQuotes(current);
  if (last) items.push(last);
  return items;
}

function parseScalar(value: string): unknown {
  const t = value.trim();
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === 'null' || t === '~') return null;
  if (/^-?\d+$/.test(t)) return Number(t);
  if (/^-?\d*\.\d+$/.test(t)) return Number(t);
  if (t.startsWith('[')) return parseInlineArray(t);
  return stripQuotes(t);
}

export function parseFrontmatter(raw: string): FrontmatterResult {
  // normaliza CRLF/CR (regex `.` não casa `\r`) e remove BOM
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const empty: FrontmatterResult = { data: {}, content: raw };
  if (!text.startsWith('---')) return empty;

  const lines = text.split('\n');
  // primeira linha é "---"; procura o fechamento
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---' || lines[i].trim() === '...') {
      end = i;
      break;
    }
  }
  if (end === -1) return empty;

  const data: Record<string, unknown> = {};
  const fm = lines.slice(1, end);
  let currentKey: string | null = null;

  for (const line of fm) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    // item de lista "- valor" continua a chave anterior
    const dash = /^\s*-\s+(.*)$/.exec(line);
    if (dash && currentKey) {
      const prev = data[currentKey];
      const item = stripQuotes(dash[1]);
      if (Array.isArray(prev)) prev.push(item);
      else data[currentKey] = item ? [item] : [];
      continue;
    }
    const kv = /^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, rest] = kv;
    currentKey = key;
    if (rest === '') {
      data[key] = [];
    } else {
      data[key] = parseScalar(rest);
    }
  }

  return { data, content: lines.slice(end + 1).join('\n') };
}
