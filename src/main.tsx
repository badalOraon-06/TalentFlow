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
      url: '/mockServiceWorker.js'
    }
  });
  
  console.log('✅ MSW initialized and ready to intercept API requests');
  console.log('📦 Environment:', import.meta.env.MODE);
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
