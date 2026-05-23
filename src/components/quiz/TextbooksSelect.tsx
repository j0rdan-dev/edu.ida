import { ArrowLeft, BookOpen } from "lucide-react";
import { useState } from "react";
import { Grade, textbooksByGrade } from "@/data/categories";
import LoadingDialog from "@/components/ui/LoadingDialog";

interface TextbooksSelectProps {
  grade: Grade;
  onBack: () => void;
}

const TextbooksSelect = ({ grade, onBack }: TextbooksSelectProps) => {
  const textbooks = textbooksByGrade[grade.id] || [];
  const [loadingBook, setLoadingBook] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleBookClick = (e: React.MouseEvent<HTMLAnchorElement>, book: (typeof textbooks)[0]) => {
    e.preventDefault();
    setLoadingBook(book.id);
    setDownloadProgress(0);
    
    // Download the PDF with progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setDownloadProgress(percentComplete);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        // Create a blob from the downloaded PDF
        const blob = new Blob([xhr.response], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        
        // Open the PDF in a new tab
        window.open(blobUrl, "_blank", "noopener,noreferrer");
        
        // Clean up
        setLoadingBook(null);
        setDownloadProgress(0);
      } else {
        // Fallback to direct link if download fails
        window.open(book.url, "_blank", "noopener,noreferrer");
        setLoadingBook(null);
        setDownloadProgress(0);
      }
    });

    xhr.addEventListener("error", () => {
      // Fallback to direct link if download fails
      window.open(book.url, "_blank", "noopener,noreferrer");
      setLoadingBook(null);
      setDownloadProgress(0);
    });

    xhr.responseType = "arraybuffer";
    xhr.open("GET", book.url);
    xhr.send();
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-lg flex flex-col h-full">
          <div className="text-center mb-10 opacity-0 animate-fade-up">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 font-display">
              Учебници - {grade.label}
            </h1>
            <p className="text-lg text-muted-foreground font-subtitle font-semibold">Преземи образовни материјали</p>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {textbooks.map((book, i) => (
              <a
                key={book.id}
                href={book.url}
                onClick={(e) => handleBookClick(e, book)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 w-full rounded-xl border-2 border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 active:scale-[0.98] opacity-0 animate-fade-up cursor-pointer"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: `hsl(${book.color} / 0.12)` }}
                >
                  <BookOpen className="h-6 w-6" style={{ color: `hsl(${book.color})` }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-base">{book.label}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="mt-8 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.97] opacity-0 animate-fade-up"
            style={{ animationDelay: `${100 + textbooks.length * 80}ms` }}
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
        </div>
      </div>

      <LoadingDialog
        isOpen={loadingBook !== null}
        message="Учебникот се вчитува ..."
        description="Ве молиме почекајте додека документот се преземе."
        progress={downloadProgress}
      />
    </>
  );
};

export default TextbooksSelect;
