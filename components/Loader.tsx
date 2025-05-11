import React from "react";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  fullHeight?: boolean;
  text?: string;
}

const Loader = ({ size = "medium", fullHeight = true, text }: LoaderProps) => {  // Define sizes
  const sizes = {
    small: {
      spinner: "w-8 h-8 border-2",
      text: "text-sm",
    },
    medium: {
      spinner: "w-12 h-12 border-[3px]", // Use exact pixel value for border width
      text: "text-base",
    },
    large: {
      spinner: "w-16 h-16 border-4",
      text: "text-lg",
    },
  };

  const sizeClass = sizes[size];
  const heightClass = fullHeight ? "min-h-[80vh]" : "";
  return (
    <div className={`flex flex-col items-center justify-center ${heightClass}`}>
      <div 
        className={`${sizeClass.spinner} border-t-primary border-muted/30 rounded-full animate-spin`}
        aria-label="Loading"
        role="status"
      ></div>
      {text && (
        <p className={`mt-4 text-muted-foreground ${sizeClass.text}`}>
          {text}
          <span className="sr-only">Loading</span>
        </p>
      )}
    </div>
  );
};

export default Loader;
