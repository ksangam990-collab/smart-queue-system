import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center text-center p-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-500 mb-4">Please refresh the page</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Refresh</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;