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
        <div className="min-h-screen bg-[var(--wah-background,#FAF7F2)] dark:bg-[var(--wah-background,#110E0C)] flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-[var(--wah-surface,#FFFFFF)] dark:bg-[var(--wah-surface,#1B1613)] rounded-3xl shadow-xl border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] p-8 text-center">
            <div className="w-16 h-16 bg-[var(--wah-primary-light,#F7ECE6)] dark:bg-[var(--wah-primary-light,rgba(224,99,60,0.15))] text-[var(--wah-primary,#B24C2B)] dark:text-[var(--wah-primary,#E0633C)] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[var(--wah-primary,#B24C2B)]/20">
              <AlertTriangle className="w-8 h-8" aria-hidden="true" />
            </div>

            <h1 className="text-2xl font-bold text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] mb-2 font-serif">
              عذراً، حدث خطأ غير متوقع
            </h1>

            <p className="text-[var(--wah-text-muted,#73675B)] dark:text-[var(--wah-text-muted,#A89B8F)] text-sm mb-6 leading-relaxed">
              واجهت المنصة مشكلة مؤقتة أثناء معالجة الصفحة. لقد تم تسجيل هذا الخطأ لحله في أقرب وقت.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                id="error-reload-btn"
                type="button"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 bg-[var(--wah-primary,#B24C2B)] hover:bg-[var(--wah-primary-hover,#963E21)] text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                id="error-home-btn"
                type="button"
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 bg-[var(--wah-surface-subtle,#F3ECE2)] dark:bg-[var(--wah-surface-subtle,#26201B)] hover:bg-[var(--wah-border,#E5DDD3)] dark:hover:bg-[var(--wah-border,#352B24)] text-[var(--wah-text,#241E1A)] dark:text-[var(--wah-text,#F7F3EE)] px-5 py-2.5 rounded-xl font-bold transition-colors border border-[var(--wah-border,#E5DDD3)] dark:border-[var(--wah-border,#352B24)] cursor-pointer"
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
