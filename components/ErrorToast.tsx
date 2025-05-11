// Error toast notification component
import { XCircle } from "lucide-react";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

interface ErrorToastProps {
  error: string | null;
  onClose?: () => void;
}

export function ErrorToast({ error, onClose }: ErrorToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      // Show the toast with destructive styling
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
        action: <ToastClose onClick={() => onClose && onClose()} />,
      });
      
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [error, toast, onClose]);

  return null;
}

interface ErrorDisplayProps {
  error: string;
  retryFn?: () => void;
  dismissFn?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, retryFn, dismissFn, className = "" }: ErrorDisplayProps) {
  return (
    <div className={`flex items-center justify-between p-4 w-full bg-destructive/10 text-destructive rounded-md ${className}`}>
      <div className="flex items-center">
        <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        <p className="text-sm md:text-base">{error}</p>
      </div>
      
      <div className="flex items-center gap-2 ml-4">
        {retryFn && (
          <button 
            onClick={retryFn}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        )}
        
        {dismissFn && (
          <button 
            onClick={dismissFn}
            className="text-sm px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
