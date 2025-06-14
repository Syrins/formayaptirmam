import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RouterDebugger: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleRouteTest = () => {
    const testRoutes = [
      '/',
      '/gallery',
      '/about',
      '/blog',
      '/faq',
      '/contact-us'
    ];
    
    console.log('🧭 Testing all routes...');
    testRoutes.forEach((route, index) => {
      setTimeout(() => {
        console.log(`Testing route: ${route}`);
        navigate(route);
      }, index * 1000);
    });
  };

  return (
    <div className="fixed top-4 left-4 z-50 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-xs">
      <div className="font-bold text-yellow-800 mb-2">Router Debug</div>
      <div className="space-y-1 text-yellow-700">
        <div><strong>Current Path:</strong> {location.pathname}</div>
        <div><strong>Search:</strong> {location.search || 'none'}</div>
        <div><strong>Hash:</strong> {location.hash || 'none'}</div>
        <div><strong>State:</strong> {location.state ? JSON.stringify(location.state) : 'none'}</div>
      </div>
      <button
        onClick={handleRouteTest}
        className="mt-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
      >
        Test Routes
      </button>
    </div>
  );
};

export default RouterDebugger;
