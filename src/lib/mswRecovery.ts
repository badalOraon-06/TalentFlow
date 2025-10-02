// MSW Recovery Helper
// This utility helps recover from MSW service worker failures

import { worker } from '../mocks/browser';

export async function ensureMSWActive(): Promise<boolean> {
  try {
    // Check if service worker is registered
    const registrations = await navigator.serviceWorker.getRegistrations();
    const mswRegistration = registrations.find(reg => 
      reg.active?.scriptURL.includes('mockServiceWorker')
    );
    
    if (!mswRegistration) {
      console.warn('⚠️ MSW service worker not found, attempting recovery...');
      
      // Try to restart MSW
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
      
      console.log('✅ MSW service worker recovered');
      
      // Wait a bit for the service worker to become active
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to recover MSW service worker:', error);
    return false;
  }
}

export async function fetchWithMSWRetry(
  url: string, 
  options: RequestInit, 
  maxRetries: number = 2
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If we get a 405 or similar error indicating MSW is not working
      if (response.status === 405 || response.status === 404) {
        const contentType = response.headers.get('content-type');
        
        // If response is not JSON, MSW is likely not intercepting
        if (!contentType || !contentType.includes('application/json')) {
          console.warn(`⚠️ Attempt ${attempt + 1}: MSW not responding, attempting recovery...`);
          
          // Try to recover MSW
          const recovered = await ensureMSWActive();
          
          if (recovered && attempt < maxRetries - 1) {
            console.log('🔄 Retrying request after MSW recovery...');
            continue; // Retry the request
          }
        }
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        console.warn(`⚠️ Attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}
