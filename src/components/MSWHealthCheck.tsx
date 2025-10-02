import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function MSWHealthCheck() {
  const [mswStatus, setMswStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const checkMSWHealth = async () => {
      try {
        // Check if service worker is registered
        if (!('serviceWorker' in navigator)) {
          setMswStatus('unhealthy');
          return;
        }

        const registrations = await navigator.serviceWorker.getRegistrations();
        const mswRegistration = registrations.find(reg => 
          reg.active?.scriptURL.includes('mockServiceWorker')
        );

        if (mswRegistration && mswRegistration.active?.state === 'activated') {
          setMswStatus('healthy');
          setShowAlert(false);
        } else {
          setMswStatus('unhealthy');
          setShowAlert(true);
        }
      } catch (error) {
        console.error('Error checking MSW health:', error);
        setMswStatus('unhealthy');
        setShowAlert(true);
      }
    };

    // Check immediately
    checkMSWHealth();

    // Check periodically (every 30 seconds)
    const interval = setInterval(checkMSWHealth, 30000);

    // Listen for service worker changes
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', checkMSWHealth);
    }

    return () => {
      clearInterval(interval);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', checkMSWHealth);
      }
    };
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  if (!showAlert || mswStatus === 'healthy') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-in">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-yellow-900 mb-1">
              Connection Issue Detected
            </h3>
            <p className="text-sm text-yellow-800 mb-3">
              The API service has become inactive. Please refresh the page to restore functionality.
            </p>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </button>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
