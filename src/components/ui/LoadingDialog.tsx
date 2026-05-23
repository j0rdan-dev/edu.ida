import { Loader2 } from "lucide-react";

interface LoadingDialogProps {
  isOpen: boolean;
  message?: string;
  description?: string;
  progress?: number; // 0-100
}

const LoadingDialog = ({
  isOpen,
  message = "Loading PDF...",
  description = "Please wait while the document is being loaded in your browser.",
  progress = 0,
}: LoadingDialogProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/80"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      />

      {/* Dialog Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Dialog Content */}
        <div
          className="w-full max-w-sm rounded-lg border-0 bg-background p-8 shadow-lg flex flex-col items-center gap-6"
          style={{
            position: "relative",
            zIndex: 10000,
            maxHeight: "90vh",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">{message}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>

          {/* Actual progress bar with percentage */}
          <div className="w-full">
            <div className="overflow-hidden rounded-full bg-secondary h-2 mb-2">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoadingDialog;
