import { Component, type ReactNode } from 'react';

/** Evita página em branco: qualquer crash de render vira mensagem legível. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[barbosa.md]', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="wrap notfound">
          <p className="notfound__shell">erro: {this.state.error.message}</p>
          <h1>Esta página falhou ao carregar</h1>
          <p>Tente carregar de novo. Se continuar, o problema está no conteúdo desta página.</p>
          <button type="button" className="btn btn--primary" onClick={() => this.setState({ error: null })}>
            Carregar de novo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
