import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize MSW for API mocking
async function enableMocking() {
  // Enable MSW in both development AND production since this is a front-end only app
  // that uses MSW to simulate a backend API as per the assignment requirements
  console.log('🔧 Initializing MSW for API mocking...');
  
  const { worker } = await import('./mocks/browser')
  
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
      // Add service worker options for better reliability
      options: {
        scope: '/',
      }
    },
    // Add quiet mode to reduce console noise in production
    quiet: false,
  });
  
  console.log('✅ MSW initialized and ready to intercept API requests');
  console.log('📦 Environment:', import.meta.env.MODE);
  
  // Keep service worker alive by checking its state periodically
  setInterval(async () => {
    try {
      // Check if service worker is still registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      const mswRegistration = registrations.find(reg => 
        reg.active?.scriptURL.includes('mockServiceWorker')
      );
      
      if (!mswRegistration) {
        console.warn('⚠️ MSW service worker not found, re-initializing...');
        await worker.start({
          onUnhandledRequest: 'bypass',
          serviceWorker: {
            url: '/mockServiceWorker.js',
            options: {
              scope: '/',
            }
          },
          quiet: false,
        });
        console.log('✅ MSW re-initialized successfully');
      }
    } catch (error) {
      console.error('❌ Error checking MSW service worker:', error);
    }
  }, 60000); // Check every minute
  
  // Listen for service worker state changes
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service worker controller changed');
    });
  }
}

enableMocking().then(() => {
  console.log('🎨 Rendering React app...');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch((error) => {
  console.error('❌ Failed to initialize app:', error);
})
