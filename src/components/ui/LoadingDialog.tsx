import { AlertDialog, AlertDialogContent, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface LoadingDialogProps {
  isOpen: boolean;
  message?: string;
  description?: string;
}

const LoadingDialog = ({
  isOpen,
  message = "Loading PDF...",
  description = "Please wait while the document is being loaded in your browser.",
}: LoadingDialogProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="flex flex-col items-center gap-6 border-0 bg-background shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{message}</h2>
            <AlertDialogDescription className="mt-2 text-sm text-muted-foreground">
              {description}
            </AlertDialogDescription>
          </div>
        </div>

        {/* Progress bar animation */}
        <div className="w-full max-w-xs overflow-hidden rounded-full bg-secondary h-2">
          <div
            className="bg-primary h-full rounded-full animate-pulse"
            style={{
              animation: "progressBar 2s ease-in-out infinite",
            }}
          />
        </div>

        <style>{`
          @keyframes progressBar {
            0% {
              width: 0%;
              opacity: 0.6;
            }
            50% {
              width: 100%;
              opacity: 1;
            }
            100% {
              width: 0%;
              opacity: 0.6;
            }
          }
        `}</style>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LoadingDialog;
