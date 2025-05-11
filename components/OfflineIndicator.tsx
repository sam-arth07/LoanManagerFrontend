// OfflineIndicator component for CreditSea
// Displays a notification when the user is offline

"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

interface OfflineIndicatorProps {
  position?: "top" | "bottom";
  className?: string;
}

export function OfflineIndicator({ 
  position = "bottom", 
  className = ""
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Initial online status
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
      setShowOffline(!navigator.onLine);
    }

    // Event handlers
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
      
      // Show reconnected message briefly
      setShowReconnected(true);
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't render anything if online and not showing reconnected message
  if (isOnline && !showReconnected) {
    return null;
  }

  // Position styles
  const positionClasses = {
    top: "top-0",
    bottom: "bottom-0",
  };

  return (
    <div
      className={`fixed left-0 right-0 ${positionClasses[position]} z-50 flex justify-center ${className}`}
    >
      <div
        className={`px-4 py-2 rounded-t-lg shadow-lg flex items-center gap-2 text-sm ${
          isOnline
            ? "bg-green-100 text-green-800 border border-green-200"
            : "bg-amber-100 text-amber-800 border border-amber-200"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi size={16} />
            <span>Connection restored</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span>You are currently offline. Some features may be limited.</span>
          </>
        )}
      </div>
    </div>
  );
}

export default OfflineIndicator;
