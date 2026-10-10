import type { CSSProperties } from 'react';
import { site } from '../lib/site';

const NODES = [
  ['browser', 'react · vite'],
  ['edge', 'cdn · cache'],
  ['api', 'node.js'],
  ['db', 'sql'],
] as const;

const LOG = [
  ['GET', '/posts', '200', '12ms'],
  ['GET', '/posts/ffmpeg', '200', '9ms'],
  ['POST', '/api/build', '201', '48ms'],
  ['GET', '/feed.xml', '304', '3ms'],
  ['GET', '/tags/terminal', '200', '7ms'],
  ['GET', '/sobre', '200', '5ms'],
] as const;

/**
 * Surpresa da busca: digitar o nome do site mostra uma requisição dando a
 * volta na stack, do navegador ao banco e de volta, sem parar.
 */
export default function StackLoop() {
  return (
    <div className="loop" role="img" aria-label="Uma requisição percorre navegador, borda, API e banco, e a resposta volta, em loop.">
      <p className="loop__name">
        <span className="loop__mark">❯</span>
        {site.name}
        <span className="loop__caret" />
      </p>
      <p className="loop__tag">do pixel ao banco, e de volta</p>

      <div className="loop__flow">
        <span className="loop__lane loop__lane--req"><i /></span>
        <span className="loop__lane loop__lane--res"><i /></span>
        {NODES.map(([name, sub], i) => (
          <div key={name} className="loop__node" style={{ '--i': i } as CSSProperties}>
            <b>{name}</b>
            <small>{sub}</small>
          </div>
        ))}
      </div>

      <div className="loop__log">
        <ol>
          {/* a lista vem em dobro para a rolagem emendar sem salto */}
          {[...LOG, ...LOG].map(([method, path, status, ms], i) => (
            <li key={i}>
              <span className="loop__method">{method}</span>
              <span className="loop__path">{path}</span>
              <span className="loop__status">{status}</span>
              <span className="loop__ms">{ms}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
