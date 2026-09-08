import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen bg-[#eee8dc] dark:bg-[#0b0b0a] text-[#211d18] dark:text-[#f5f0e7] flex items-center justify-center p-4 transition-colors"
          dir="rtl"
        >
          <div className="max-w-md w-full bg-white/75 dark:bg-[#151513]/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-black/10 dark:border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-[#9a6a35]/10 text-[#9a6a35] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#9a6a35]/20">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-black text-[#211d18] dark:text-[#f5f0e7] mb-2 font-serif">
              عذراً، حدث خطأ غير متوقع
            </h1>

            <p className="text-black/60 dark:text-white/60 text-sm mb-6 leading-relaxed font-medium">
              واجهت المنصة مشكلة مؤقتة أثناء معالجة الصفحة. لقد تم تسجيل هذا الخطأ لحله في أقرب وقت.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="error-reload-btn"
                type="button"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-[#211d18] text-white dark:bg-white dark:text-black hover:bg-[#9a6a35] dark:hover:bg-[#d5a56d] px-5 py-3 rounded-xl font-black transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                id="error-home-btn"
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#211d18] dark:text-[#f5f0e7] px-5 py-3 rounded-xl font-black transition-colors border border-black/10 dark:border-white/10 cursor-pointer"
              >
                <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>العودة للرئيسية</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-6 text-left p-3 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 rounded-xl text-xs font-mono overflow-auto max-h-32 dir-ltr">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
