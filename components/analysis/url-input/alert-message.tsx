import { LucideTriangleAlert } from "lucide-react";

interface AlertMessageProps {
  id: string;
  message: string;
  type: "error" | "warning" | "info";
  className?: string;
}

export function AlertMessage({
  id,
  message,
  type,
  className = "",
}: AlertMessageProps) {
  const baseClasses = "px-2 py-1 border rounded-md flex items-center gap-2";
  const typeClasses = {
    error: "bg-destructive/10 border-destructive/20",
    warning: "bg-destructive/10 border-destructive/20",
    info: "bg-blue-600/20 border-blue-600/30",
  };

  const textClasses = {
    error: "text-destructive-foreground",
    warning: "text-destructive-foreground",
    info: "text-foreground",
  };

  return (
    <div
      className={`${baseClasses} ${typeClasses[type]} ${className}`}
      role="alert"
      aria-describedby={id}
    >
      <LucideTriangleAlert
        className={`size-3 flex-shrink-0 ${
          type === "info" ? "text-foreground" : "text-destructive-foreground"
        }`}
        aria-hidden="true"
      />
      <p id={id} className={`text-xs ${textClasses[type]}`}>
        {message}
      </p>
    </div>
  );
}
