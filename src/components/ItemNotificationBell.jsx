import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { subscribeToItemNotification, unsubscribeFromItemNotification, checkItemSubscription } from "../services/pushNotificationService";
import { toast } from "react-toastify";

export const ItemNotificationBell = ({ itemType, itemId }) => {
  const { isSupported, isSubscribed: isGlobalSubscribed, subscribe: subscribeGlobal } = usePushNotifications();
  const [isItemSubscribed, setIsItemSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isSupported || !itemId) {
      setIsLoading(false);
      return;
    }

    // Check if user is subscribed to this specific item
    const checkSubscription = async () => {
      try {
        const subscription = await navigator.serviceWorker.ready.then(
          (reg) => reg.pushManager.getSubscription()
        );

        if (subscription) {
          const subscribed = await checkItemSubscription(
            subscription.endpoint,
            itemType,
            itemId
          );
          setIsItemSubscribed(subscribed);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, [itemType, itemId, isSupported]);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Prevent card click

    if (!isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return;
    }

    setIsProcessing(true);

    try {
      // First ensure global subscription
      if (!isGlobalSubscribed) {
        const globalSubscribed = await subscribeGlobal();
        if (!globalSubscribed) {
          setIsProcessing(false);
          return;
        }
      }

      // Get current subscription
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        toast.error("Please enable notifications first");
        setIsProcessing(false);
        return;
      }

      if (isItemSubscribed) {
        // Unsubscribe from this item
        await unsubscribeFromItemNotification(
          subscription.endpoint,
          itemType,
          itemId
        );
        setIsItemSubscribed(false);
        toast.success("Unsubscribed from notifications for this " + itemType);
      } else {
        // Subscribe to this item
        await subscribeToItemNotification(subscription, itemType, itemId);
        setIsItemSubscribed(true);
        toast.success("Subscribed to notifications for this " + itemType);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast.error(error.message || "Failed to update subscription");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSupported || isLoading) {
    return null;
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isProcessing}
      className={`p-2 rounded-full transition-colors ${
        isItemSubscribed
          ? "bg-lnmiit-maroon text-white hover:bg-red-800"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
      title={
        isItemSubscribed
          ? `Unsubscribe from ${itemType} notifications`
          : `Subscribe to ${itemType} notifications`
      }
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isItemSubscribed ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
    </button>
  );
};

