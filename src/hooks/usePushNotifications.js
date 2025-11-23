import { useState, useEffect, useCallback } from "react";
import {
  initializePushNotifications,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribed,
  requestNotificationPermission,
} from "../services/pushNotificationService.js";
import { toast } from "react-toastify";

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribedState, setIsSubscribedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState("default");

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      setIsSupported(supported);

      if (supported && "Notification" in window) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  // Initialize and check subscription status
  useEffect(() => {
    if (!isSupported) {
      setIsLoading(false);
      return;
    }

    const init = async () => {
      try {
        await initializePushNotifications();
        const subscribed = await isSubscribed();
        setIsSubscribedState(subscribed);
      } catch (error) {
        console.error("Error initializing push notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    try {
      setIsLoading(true);
      await subscribeToPushNotifications();
      setIsSubscribedState(true);
      setPermission(Notification.permission);
      toast.success("Successfully subscribed to push notifications!");
      return true;
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error(
        error.message || "Failed to subscribe to push notifications"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!isSupported) {
      return false;
    }

    try {
      setIsLoading(true);
      await unsubscribeFromPushNotifications();
      setIsSubscribedState(false);
      toast.success("Unsubscribed from push notifications");
      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe from push notifications");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    try {
      const granted = await requestNotificationPermission();
      setPermission(Notification.permission);
      if (granted) {
        toast.success("Notification permission granted!");
        return true;
      } else {
        toast.error("Notification permission denied");
        return false;
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      toast.error(error.message || "Failed to request permission");
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed: isSubscribedState,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
  };
};

