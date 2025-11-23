import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let vapidPublicKey = null;
let registration = null;
let subscription = null;

/**
 * Get VAPID public key from server
 */
export const getVapidPublicKey = async () => {
  if (vapidPublicKey) return vapidPublicKey;

  try {
    const response = await axios.get(`${API_URL}/api/push/vapid-public-key`);
    vapidPublicKey = response.data.publicKey;
    return vapidPublicKey;
  } catch (error) {
    console.error("Error getting VAPID key:", error);
    throw error;
  }
};

/**
 * Convert VAPID key from base64 URL to Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications");
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    throw new Error("Notification permission denied");
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async () => {
  try {
    // Check if service worker is supported
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers are not supported");
    }

    // Request notification permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error("Notification permission not granted");
    }

    // Get service worker registration
    registration = await navigator.serviceWorker.ready;

    // Get VAPID public key
    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
      throw new Error("VAPID public key not available");
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription to server
    await axios.post(
      `${API_URL}/api/push/subscribe`,
      { subscription },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    throw error;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    if (!subscription) {
      // Try to get existing subscription
      registration = await navigator.serviceWorker.ready;
      subscription = await registration.pushManager.getSubscription();
    }

    if (subscription) {
      const endpoint = subscription.endpoint;

      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Remove from server
      try {
        await axios.post(
          `${API_URL}/api/push/unsubscribe`,
          { endpoint },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error unsubscribing from server:", error);
      }

      subscription = null;
    }

    return true;
  } catch (error) {
    console.error("Error unsubscribing:", error);
    throw error;
  }
};

/**
 * Check if user is subscribed
 */
export const isSubscribed = async () => {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    registration = await navigator.serviceWorker.ready;
    subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return false;
  }
};

/**
 * Initialize push notifications (call this on app load)
 */
export const initializePushNotifications = async () => {
  try {
    // Register service worker if not already registered
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
    }

    // Check if already subscribed
    const subscribed = await isSubscribed();
    return subscribed;
  } catch (error) {
    console.error("Error initializing push notifications:", error);
    return false;
  }
};

/**
 * Subscribe to notifications for a specific event or notice
 */
export const subscribeToItemNotification = async (subscription, itemType, itemId) => {
  try {
    await axios.post(
      `${API_URL}/api/push/subscribe-item`,
      {
        subscription,
        itemType,
        itemId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error subscribing to item:", error);
    throw error;
  }
};

/**
 * Unsubscribe from notifications for a specific event or notice
 */
export const unsubscribeFromItemNotification = async (endpoint, itemType, itemId) => {
  try {
    await axios.post(
      `${API_URL}/api/push/unsubscribe-item`,
      {
        endpoint,
        itemType,
        itemId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error unsubscribing from item:", error);
    throw error;
  }
};

/**
 * Check if user is subscribed to a specific item
 */
export const checkItemSubscription = async (endpoint, itemType, itemId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/push/check-subscription/${itemType}/${itemId}`,
      {
        params: { endpoint },
      }
    );
    return response.data.isSubscribed;
  } catch (error) {
    console.error("Error checking item subscription:", error);
    return false;
  }
};

