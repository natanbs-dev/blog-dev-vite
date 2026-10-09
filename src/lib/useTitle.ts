import { useEffect } from 'react';
import { site } from './site';

/** Título da aba por página; sem argumento, usa o do site. */
export function useTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} | ${site.name}` : `${site.name} | blog de programação`;
  }, [title]);
}
