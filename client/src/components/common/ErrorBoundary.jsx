import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/today';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
          <div className="card-heartland max-w-md w-full p-6 text-center space-y-4 border-2 border-amber-400 bg-cream-50 shadow-tactile animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="font-display font-extrabold text-lg text-soil-900">
                பக்கத்தில் ஒரு சிறு பிழை ஏற்பட்டது
              </h2>
              <div className="text-xs text-soil-600 mt-1">
                An unexpected display issue occurred on this screen.
              </div>
            </div>

            <div className="p-3 bg-cream-200/80 rounded-xl text-[11px] font-mono text-soil-700 text-left overflow-auto max-h-24 border border-soil-300">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="btn-gold flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <RefreshCw className="w-4 h-4" />
                <span>மீண்டும் ஏற்று (Reload)</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn-primary flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <Home className="w-4 h-4" />
                <span>முகப்பு (Home)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
