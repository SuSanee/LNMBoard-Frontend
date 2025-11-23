import { useState } from "react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export const PushNotificationButton = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
  } = usePushNotifications();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  const handleClick = async () => {
    setIsProcessing(true);
    try {
      if (permission === "default") {
        await requestPermission();
      } else if (isSubscribed) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    } catch (error) {
      console.error("Error handling push notification:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || isProcessing) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (permission === "denied") {
    return (
      <Button variant="outline" disabled>
        <BellOff className="mr-2 h-4 w-4" />
        Notifications Blocked
      </Button>
    );
  }

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      onClick={handleClick}
    >
      {isSubscribed ? (
        <>
          <Bell className="mr-2 h-4 w-4" />
          Notifications On
        </>
      ) : (
        <>
          <BellOff className="mr-2 h-4 w-4" />
          Enable Notifications
        </>
      )}
    </Button>
  );
};

