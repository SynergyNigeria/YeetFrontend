// Push Notification Manager for Yeet Bank

const VAPID_PUBLIC_KEY = 'BNpskYahekjzZXddj_p2sQemAULf4QUKlmrTz4ssFoL9ONC1u7CIzrc9T8YPB0XdTVhz74j_BxdGYel62ZOszhI';

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register Service Worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  } else {
    console.warn('Service Workers are not supported in this browser');
    return null;
  }
}

// Wait for a SW registration to have an active worker
function waitForActiveServiceWorker(registration) {
  return new Promise((resolve) => {
    if (registration.active) {
      resolve(registration);
      return;
    }
    const sw = registration.installing || registration.waiting;
    if (!sw) {
      resolve(registration);
      return;
    }
    sw.addEventListener('statechange', function handler() {
      if (registration.active) {
        sw.removeEventListener('statechange', handler);
        resolve(registration);
      }
    });
  });
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(registration) {
  try {
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('Already subscribed to push notifications');
      return subscription;
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    console.log('Subscribed to push notifications:', subscription);
    return subscription;
  } catch (error) {
    // Push service may be unavailable in dev/offline — fail silently
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(registration) {
  try {
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    throw error;
  }
}

// Send subscription to server
export async function sendSubscriptionToServer(subscription, api) {
  try {
    await api.post('/push/subscribe/', {
      subscription: subscription.toJSON(),
      user_agent: navigator.userAgent
    });
    console.log('Push subscription sent to server');
    return true;
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    throw error;
  }
}

// Remove subscription from server
export async function removeSubscriptionFromServer(subscription, api) {
  try {
    await api.post('/push/unsubscribe/', {
      subscription: subscription.toJSON()
    });
    console.log('Push subscription removed from server');
    return true;
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
    throw error;
  }
}

// Initialize push notifications
export async function initializePushNotifications(api) {
  try {
    let registration = await registerServiceWorker();
    
    if (!registration) {
      return null;
    }

    // Wait until the SW is fully active before attempting to subscribe
    registration = await waitForActiveServiceWorker(registration);

    const subscription = await subscribeToPushNotifications(registration);
    
    if (subscription) {
      await sendSubscriptionToServer(subscription, api).catch(() => null);
      return subscription;
    }
    
    return null;
  } catch (error) {
    // Fail silently — push notifications are optional
    return null;
  }
}

// Show a local notification (for testing)
export async function showLocalNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  const permission = await requestNotificationPermission();
  
  if (permission === 'granted') {
    new Notification(title, {
      body: options.body || '',
      icon: options.icon || '/icons/android-chrome-192x192.png',
      badge: options.badge || '/icons/favicon-32x32.png',
      tag: options.tag || 'local-notification',
      requireInteraction: options.requireInteraction || false,
      ...options
    });
  }
}
