// Performance monitoring utilities
import { performanceBudgetMonitor } from './performance-budget';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Record<string, number> = {};
  private observers: PerformanceObserver[] = [];
  private startTime: number = performance.now();
  private initialized: boolean = false;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    // Don't auto-initialize, wait for explicit init call
  }

  // Initialize performance monitoring
  init() {
    if (this.initialized) {
      return;
    }
    
    this.initialized = true;
    this.initializeObservers();
    this.trackNavigationTiming();
    console.log('🚀 Performance monitoring initialized');
  }
  private trackNavigationTiming() {
    if ('performance' in window && 'navigation' in performance) {
      // Track navigation timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
            this.metrics.loadComplete = navigation.loadEventEnd - navigation.fetchStart;
            this.metrics.firstByte = navigation.responseStart - navigation.fetchStart;
              console.log('📊 Navigation Timing:', {
              'First Byte (TTFB)': `${this.metrics.firstByte.toFixed(2)}ms`,
              'DOM Content Loaded': `${this.metrics.domContentLoaded.toFixed(2)}ms`,
              'Load Complete': `${this.metrics.loadComplete.toFixed(2)}ms`
            });
            
            // Check navigation metrics against budget
            performanceBudgetMonitor.checkMetric('ttfb', this.metrics.firstByte);
            
            // Generate performance budget report
            setTimeout(() => {
              performanceBudgetMonitor.generateReport();
            }, 5000);
          }
        }, 0);
      });
    }
  }

  private initializeObservers() {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;          this.metrics.lcp = lastEntry.startTime;
          
          // Check against performance budget
          performanceBudgetMonitor.checkMetric('lcp', lastEntry.startTime);
          
          console.log(`🎯 LCP: ${lastEntry.startTime.toFixed(2)}ms`, {
            element: lastEntry.element,
            size: lastEntry.size,
            loadTime: lastEntry.loadTime,
            renderTime: lastEntry.renderTime,
            url: lastEntry.url
          });
          
          // Log LCP improvement compared to baseline
          const baseline = 22700; // Previous LCP baseline
          const improvement = ((baseline - lastEntry.startTime) / baseline * 100).toFixed(1);
          console.log(`📈 LCP improvement: ${improvement}% vs baseline (${baseline}ms)`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID Observer  
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();          entries.forEach((entry: any) => {
            const fidValue = entry.processingStart - entry.startTime;
            this.metrics.fid = fidValue;
            
            // Check against performance budget
            performanceBudgetMonitor.checkMetric('fid', fidValue);
            
            console.log(`⚡ FID: ${fidValue.toFixed(2)}ms`, {
              delay: entry.processingStart - entry.startTime,
              processingTime: entry.processingEnd - entry.processingStart,
              duration: entry.duration
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS Observer
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.cls = clsValue;
              
              // Check against performance budget
              performanceBudgetMonitor.checkMetric('cls', clsValue);
              
              console.log('🔀 CLS:', clsValue.toFixed(6), {
                value: entry.value,
                sources: entry.sources?.map((source: any) => ({
                  node: source.node,
                  currentRect: source.currentRect,
                  previousRect: source.previousRect
                }))
              });
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  // Mark a custom performance point
  mark(name: string) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(name);
    }
  }

  // Measure time between two marks
  measure(name: string, startMark: string, endMark?: string) {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.metrics[name] = measure.duration;
        return measure.duration;
      } catch (e) {
        console.warn(`Failed to measure ${name}:`, e);
      }
    }
    return 0;
  }

  // Get all collected metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Initialize global performance monitoring
export const performanceMonitor = PerformanceMonitor.getInstance();

// Helper to track component render times
export function trackComponentRender(componentName: string) {
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  
  return {
    start: () => performanceMonitor.mark(startMark),
    end: () => {
      performanceMonitor.mark(endMark);
      return performanceMonitor.measure(`${componentName}-render`, startMark, endMark);
    }
  };
}

// Preload critical resources
export function preloadCriticalResources() {
  const criticalUrls = [
    '/hero-image.svg',
    '/placeholder.svg'
  ];

  criticalUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

// Optimize font loading
export function optimizeFontLoading() {
  // Font display swap for better performance
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.includes('display=swap')) {
      link.setAttribute('href', `${href}&display=swap`);
    }
  });
}

// Resource hints for better loading
export function addResourceHints() {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: '//sketchfab.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
  ];

  hints.forEach(hint => {
    const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if ('crossorigin' in hint) {
        link.crossOrigin = hint.crossorigin;
      }
      document.head.appendChild(link);
    }
  });
}