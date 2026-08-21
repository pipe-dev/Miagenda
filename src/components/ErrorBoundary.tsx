import React, { Component, ErrorInfo, ReactNode } from 'react';
import { resetAppToCleanSlate } from '../services/storageService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleCleanAndRepair = () => {
    try {
      resetAppToCleanSlate();
    } catch (_) {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#fbf8fb]">
          <div className="plush-card rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-white text-center shadow-2xl bg-white/95">
            <div className="w-16 h-16 rounded-full candy-accent-bicolor text-white mx-auto flex items-center justify-center mb-4 shadow-md">
              <span className="material-symbols-outlined text-[32px]">refresh</span>
            </div>

            <h2 className="font-extrabold text-xl text-on-surface mb-2 tracking-tight">
              Recuperación de la Agenda
            </h2>
            <p className="text-xs text-on-surface-variant mb-5 leading-relaxed">
              Tus datos están protegidos. Elige cómo deseas reanudar la app:
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 rounded-full candy-btn text-white font-black text-sm shadow-md select-none active:scale-98 transition-transform"
              >
                Recargar Agenda
              </button>

              <button
                type="button"
                onClick={this.handleCleanAndRepair}
                className="w-full py-3 rounded-full bg-surface-container-high hover:bg-surface-container text-primary font-bold text-xs shadow-xs border border-white active:scale-98 transition-transform"
              >
                Restablecer & Reparar Inicio Limpio
              </button>
            </div>

            {this.state.error && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-left">
                <button
                  type="button"
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] font-bold text-on-surface-variant/70 hover:text-primary underline flex items-center space-x-1 mx-auto"
                >
                  <span>{this.state.showDetails ? 'Ocultar detalles' : 'Ver detalle del error técnico'}</span>
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-2.5 rounded-xl bg-slate-900 text-rose-300 text-[10px] font-mono overflow-x-auto max-h-32 whitespace-pre-wrap">
                    {this.state.error.message || String(this.state.error)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
