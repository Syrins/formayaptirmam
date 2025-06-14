import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/performance-monitor';
import { performanceBudgetMonitor, PERFORMANCE_BUDGETS } from '../utils/performance-budget';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  firstByte?: number;
  domContentLoaded?: number;
  loadComplete?: number;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [violations, setViolations] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = performanceMonitor.getMetrics();
      const currentViolations = performanceBudgetMonitor.getViolations();
      
      setMetrics(currentMetrics);
      setViolations(currentViolations);
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    
    // Initial update
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  const getMetricStatus = (value: number | undefined, budget: number) => {
    if (value === undefined) return 'loading';
    return value <= budget ? 'good' : 'poor';
  };

  const formatMetric = (value: number | undefined, unit: string = 'ms') => {
    if (value === undefined) return '---';
    return unit === 'ms' ? `${Math.round(value)}ms` : value.toFixed(4);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !window.location.search.includes('perf=true')) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Dashboard"
      >
        📊
      </button>

      {/* Dashboard Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Performance Metrics</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Core Web Vitals */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="font-medium text-gray-700">Metric</div>
              <div className="font-medium text-gray-700">Value</div>
              <div className="font-medium text-gray-700">Budget</div>
            </div>

            {/* LCP */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="font-medium">LCP</div>
              <div className={`px-2 py-1 rounded text-xs ${getStatusColor(getMetricStatus(metrics.lcp, PERFORMANCE_BUDGETS.lcp))}`}>
                {formatMetric(metrics.lcp)}
              </div>
              <div className="text-gray-500 text-xs">{PERFORMANCE_BUDGETS.lcp}ms</div>
            </div>

            {/* FID */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="font-medium">FID</div>
              <div className={`px-2 py-1 rounded text-xs ${getStatusColor(getMetricStatus(metrics.fid, PERFORMANCE_BUDGETS.fid))}`}>
                {formatMetric(metrics.fid)}
              </div>
              <div className="text-gray-500 text-xs">{PERFORMANCE_BUDGETS.fid}ms</div>
            </div>

            {/* CLS */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="font-medium">CLS</div>
              <div className={`px-2 py-1 rounded text-xs ${getStatusColor(getMetricStatus(metrics.cls, PERFORMANCE_BUDGETS.cls))}`}>
                {formatMetric(metrics.cls, '')}
              </div>
              <div className="text-gray-500 text-xs">{PERFORMANCE_BUDGETS.cls}</div>
            </div>

            {/* TTFB */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="font-medium">TTFB</div>
              <div className={`px-2 py-1 rounded text-xs ${getStatusColor(getMetricStatus(metrics.firstByte, PERFORMANCE_BUDGETS.ttfb))}`}>
                {formatMetric(metrics.firstByte)}
              </div>
              <div className="text-gray-500 text-xs">{PERFORMANCE_BUDGETS.ttfb}ms</div>
            </div>
          </div>

          {/* Loading Metrics */}
          {(metrics.domContentLoaded || metrics.loadComplete) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-700 mb-2 text-sm">Loading Times</h4>
              <div className="space-y-2 text-sm">
                {metrics.domContentLoaded && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">DOM Ready:</span>
                    <span className="font-mono">{formatMetric(metrics.domContentLoaded)}</span>
                  </div>
                )}
                {metrics.loadComplete && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Load Complete:</span>
                    <span className="font-mono">{formatMetric(metrics.loadComplete)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Violations */}
          {violations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-red-700 mb-2 text-sm">⚠️ Budget Violations</h4>
              <div className="space-y-1">
                {violations.slice(-3).map((violation, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    <div className="font-medium">{violation.metric.toUpperCase()}</div>
                    <div>{formatMetric(violation.value)} (budget: {formatMetric(violation.budget)})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LCP Improvement */}
          {metrics.lcp && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                <div className="font-medium">🎉 LCP Improvement</div>
                <div>
                  {((22700 - metrics.lcp) / 22700 * 100).toFixed(1)}% vs baseline
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PerformanceDashboard;
