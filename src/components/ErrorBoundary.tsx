import { Component, type ReactNode } from 'react';

/** Evita página em branco: qualquer crash de render vira mensagem legível. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[blog-dev]', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container">
          <div className="notfound">
            <div>
              <div className="notfound__code">:/</div>
              <h1>Algo quebrou ao renderizar</h1>
              <p className="mono" style={{ color: 'var(--muted)', fontSize: 13 }}>
                {this.state.error.message}
              </p>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => this.setState({ error: null })}
              >
                Tentar de novo
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
