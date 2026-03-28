import React from "react";
import "../styles/ErrorBoundary.css";
import { reportRuntimeError } from "../utils/errors";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    reportRuntimeError("render_boundary", error, {
      componentStack: errorInfo?.componentStack || "",
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <div className="error-boundary-card">
            <p className="error-boundary-kicker">Falha inesperada</p>
            <h1 className="error-boundary-title">
              Não foi possível carregar o sistema com segurança.
            </h1>
            <p className="error-boundary-copy">
              Recarregue a página. Se o problema continuar, confira a conexão com sua
              conta Google e tente novamente.
            </p>
            <button
              type="button"
              className="error-boundary-button"
              onClick={this.handleReload}
            >
              Recarregar página
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
