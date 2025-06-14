import React, { useState, useEffect, memo, Suspense, lazy } from "react";
import { Helmet } from "react-helmet-async";

// Lazy load components
const Navbar = lazy(() => import("./Navbar"));
const Footer = lazy(() => import("./Footer"));
const FloatingContactButtons = lazy(() => import("./FloatingContactButtons"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
}

// Using memo to prevent unnecessary re-renders
const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  const [isInteractive, setIsInteractive] = useState(false);
  const mountedRef = React.useRef(true);
  
  useEffect(() => {
    // Track if component is mounted to avoid memory leaks
    mountedRef.current = true;
    
    // Only load non-critical resources after initial render and main content is ready
    const markInteractive = (): void => {
      if (mountedRef.current) {
        setIsInteractive(true);
      }
    };
    
    // Use requestIdleCallback for non-critical initialization
    let timeoutId: ReturnType<typeof setTimeout> | number;
    if ('requestIdleCallback' in window) {
      // Use requestIdleCallback when browser is idle
      timeoutId = window.requestIdleCallback(markInteractive, { timeout: 2000 });
    } else {
      // Fallback to setTimeout for browsers without requestIdleCallback
      timeoutId = setTimeout(markInteractive, 1000);
    }
    
    return () => {
      mountedRef.current = false;
      if ('requestIdleCallback' in window) {
        window.cancelIdleCallback(timeoutId as number);
      } else {
        clearTimeout(timeoutId as ReturnType<typeof setTimeout>);
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <Navbar />
      </Suspense>
      
      <main className="flex-grow w-full">
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </main>
      
      <Suspense fallback={<div className="h-16 bg-background" />}>
        <Footer />
      </Suspense>
      
      <Suspense fallback={null}>
        <FloatingContactButtons />
      </Suspense>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
