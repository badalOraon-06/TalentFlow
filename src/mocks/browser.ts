import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

// Initialize MSW in development
export async function initializeMSW() {
  if (typeof window === 'undefined') {
    // Server-side, don't start MSW
    return;
  }

  try {
    console.log('🔧 Starting MSW...');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    console.log('✅ MSW enabled for API mocking');
    
    // Test if MSW is working
    console.log('🧪 Testing MSW setup...');
    const testResponse = await fetch('/api/test');
    console.log('Test response status:', testResponse.status);
    
  } catch (error) {
    console.error('❌ Failed to start MSW:', error);
    throw error;
  }
}