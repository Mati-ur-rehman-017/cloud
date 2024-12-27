import React from "react";
import { Loader2 } from "lucide-react";

const Loading = ({
  size = "medium",
  color = "text-blue-500",
  text = "Loading...",
}) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${color}`} />
      {text && <p className={`mt-2 text-sm ${color}`}>{text}</p>}
    </div>
  );
};

export default Loading;
