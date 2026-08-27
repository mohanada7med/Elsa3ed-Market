import React, { Component, ErrorInfo, ReactNode } from 'react';
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
        <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#e8d5c4] p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-bold text-[#29221d] mb-2 font-serif">
              عذراً، حدث خطأ غير متوقع
            </h1>

            <p className="text-[#6e5d4f] text-sm mb-6 leading-relaxed">
              واجهت المنصة مشكلة مؤقتة أثناء معالجة الصفحة. لقد تم تسجيل هذا الخطأ لحله في أقرب وقت.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="error-reload-btn"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-[#9a3412] hover:bg-[#7c2d12] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                id="error-home-btn"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-[#f5ebe1] hover:bg-[#eddcd0] text-[#7c2d12] px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>العودة للرئيسية</span>
              </button>
            </div>

            {process.env.NODE_ENV !== 'production' && this.state.error && (
              <div className="mt-6 text-left p-3 bg-red-50 text-red-800 rounded-lg text-xs font-mono overflow-auto max-h-32 dir-ltr">
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
