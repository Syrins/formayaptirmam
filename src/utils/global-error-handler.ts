// Global error handling utility
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  
  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  init() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.group('🚨 Unhandled Promise Rejection');
      console.error('Promise:', event.promise);
      console.error('Reason:', event.reason);
      console.groupEnd();
      
      // Prevent default browser error logging
      event.preventDefault();
      
      // Report to analytics
      this.reportError(event.reason, 'unhandledrejection');
    });

    // Catch global JavaScript errors
    window.addEventListener('error', (event) => {
      console.group('🚨 Global JavaScript Error');
      console.error('Message:', event.message);
      console.error('Source:', event.filename);
      console.error('Line:', event.lineno);
      console.error('Column:', event.colno);
      console.error('Error:', event.error);
      console.groupEnd();
      
      // Report to analytics
      this.reportError(event.error || event.message, 'javascript');
    });

    // Catch resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        const target = event.target as HTMLElement;
        console.group('🚨 Resource Loading Error');
        console.error('Element:', target.tagName);
        console.error('Source:', (target as any).src || (target as any).href);
        console.error('Error:', event);
        console.groupEnd();
        
        // Handle image loading errors specifically
        if (target.tagName === 'IMG') {
          this.handleImageError(target as HTMLImageElement);
        }
        
        this.reportError(`Resource failed to load: ${(target as any).src || (target as any).href}`, 'resource');
      }
    }, true); // Use capture phase
    
    console.log('🛡️ Global error handler initialized');
  }

  private handleImageError(img: HTMLImageElement) {
    // Replace broken images with placeholder
    if (!img.src.includes('placeholder.svg')) {
      console.warn(`Replacing broken image: ${img.src}`);
      img.src = '/placeholder.svg';
      img.alt = 'Image not available';
    }
  }

  private reportError(error: any, type: string) {
    // Report to analytics in production
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'exception', {
        description: error?.toString() || 'Unknown error',
        fatal: false,
        custom_map: {
          error_type: type
        }
      });
    }

    // Report to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${type.toUpperCase()}]`, error);
    }
  }

  // Method to manually report errors
  reportManualError(error: Error, context?: string) {
    console.group('🔍 Manual Error Report');
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('Stack:', error.stack);
    console.groupEnd();
    
    this.reportError(error, 'manual');
  }
}

export const globalErrorHandler = GlobalErrorHandler.getInstance();
