
import { createRoot } from 'react-dom/client'
import './index.css'

// Critical performance optimization: defer non-critical imports
const loadApp = async () => {
  const { default: App } = await import('./App.tsx');
  return App;
};

// Initialize the app only when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const rootElement = document.getElementById("root");
  
  if (rootElement) {
    // Show immediate loading state
    rootElement.innerHTML = `
      <div style="
        display: flex; 
        align-items: center; 
        justify-content: center; 
        min-height: 100vh; 
        font-family: Inter, system-ui, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      ">
        <div style="text-align: center;">
          <div style="
            width: 40px; 
            height: 40px; 
            border: 3px solid rgba(255,255,255,0.3); 
            border-top: 3px solid white; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          "></div>
          <p style="margin: 0; font-size: 18px; font-weight: 500;">FormaYaptırma yükleniyor...</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    try {
      // Load the app asynchronously
      const App = await loadApp();
      
      // Create root with concurrent mode
      const root = createRoot(rootElement);
      root.render(<App />);
      
      // Register performance measure
      if ('performance' in window && 'mark' in performance && 'measure' in performance) {
        performance.mark('app-rendered');
        performance.measure('app-render-time', 'navigationStart', 'app-rendered');
      }
      
      // Register service worker for caching
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);
          })
          .catch((error) => {
            console.log('Service Worker registration failed:', error);
          });
      }
    } catch (error) {
      console.error('Failed to load application:', error);
      rootElement.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          font-family: Inter, system-ui, sans-serif;
          background: #fee2e2;
          color: #dc2626;
        ">
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 18px; font-weight: 500;">Uygulama yüklenirken hata oluştu</p>
            <button onclick="window.location.reload()" style="
              margin-top: 16px; 
              padding: 8px 16px; 
              background: #dc2626; 
              color: white; 
              border: none; 
              border-radius: 4px; 
              cursor: pointer;
            ">Yenile</button>
          </div>
        </div>
      `;
    }
  }
});
