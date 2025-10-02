import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize MSW for API mocking
async function enableMocking() {
  if (import.meta.env.PROD) {
    console.log('🚀 Running in production mode - MSW disabled');
    return
  }

  console.log('🔧 Initializing MSW for development...');
  
  const { worker } = await import('./mocks/browser')
  
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
  
  console.log('✅ MSW initialized and ready to intercept requests');
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
