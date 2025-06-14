// Performance Budget Monitoring
export interface PerformanceBudget {
  lcp: number;      // Largest Contentful Paint (ms)
  fid: number;      // First Input Delay (ms)
  cls: number;      // Cumulative Layout Shift
  fcp: number;      // First Contentful Paint (ms)
  ttfb: number;     // Time to First Byte (ms)
}

// Performance thresholds (Good, Needs Improvement, Poor)
export const PERFORMANCE_BUDGETS: PerformanceBudget = {
  lcp: 2500,   // Good: <2.5s, Poor: >4s
  fid: 100,    // Good: <100ms, Poor: >300ms
  cls: 0.1,    // Good: <0.1, Poor: >0.25
  fcp: 1800,   // Good: <1.8s, Poor: >3s
  ttfb: 600    // Good: <600ms, Poor: >1.5s
};

export class PerformanceBudgetMonitor {
  private violations: Array<{
    metric: string;
    value: number;
    budget: number;
    timestamp: number;
  }> = [];

  public checkMetric(metric: keyof PerformanceBudget, value: number): boolean {
    const budget = PERFORMANCE_BUDGETS[metric];
    const isWithinBudget = value <= budget;

    if (!isWithinBudget) {
      this.violations.push({
        metric,
        value,
        budget,
        timestamp: Date.now()
      });

      console.warn(`🚨 Performance Budget Violation:`, {
        metric,
        value: `${value}${metric === 'cls' ? '' : 'ms'}`,
        budget: `${budget}${metric === 'cls' ? '' : 'ms'}`,
        exceedsBy: `${Math.round(value - budget)}${metric === 'cls' ? '' : 'ms'}`,
        severity: this.getSeverity(metric, value)
      });

      // Report to analytics in production
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'performance_budget_violation', {
          custom_parameter: metric,
          value: Math.round(value)
        });
      }
    }

    return isWithinBudget;
  }

  private getSeverity(metric: keyof PerformanceBudget, value: number): 'warning' | 'critical' {
    const budget = PERFORMANCE_BUDGETS[metric];
    const poorThresholds = {
      lcp: 4000,
      fid: 300,
      cls: 0.25,
      fcp: 3000,
      ttfb: 1500
    };

    return value > poorThresholds[metric] ? 'critical' : 'warning';
  }

  public getViolations() {
    return this.violations;
  }

  public generateReport() {
    if (this.violations.length === 0) {
      console.log('✅ All performance metrics within budget!');
      return;
    }

    console.group('📊 Performance Budget Report');
    this.violations.forEach(violation => {
      console.log(`❌ ${violation.metric.toUpperCase()}: ${violation.value}ms (budget: ${violation.budget}ms)`);
    });
    console.groupEnd();
  }

  public reset() {
    this.violations = [];
  }
}

export const performanceBudgetMonitor = new PerformanceBudgetMonitor();
