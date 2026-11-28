import { MessageCircle, Phone } from "lucide-react";
import { canonicalUrl } from "@/lib/seo";

interface ShareButtonsProps {
  text: string;
  path?: string;
  label?: string;
  className?: string;
}

export default function ShareButtons({
  text,
  path = window.location.pathname,
  label = "Сподели",
  className = "",
}: ShareButtonsProps) {
  // Attempts and results need local session state. Link to the quiz start
  // page without query parameters or fragments.
  const sharePath = path.split(/[?#]/, 1)[0].replace(/\/(?:quiz|results)\/?$/, "");
  const message = encodeURIComponent(`${text}\n${canonicalUrl(sharePath)}`);
  const linkClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div role="group" aria-label={label} className={`text-center ${className}`}>
      <p className="mb-3 text-sm font-semibold text-muted-foreground">{label}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <a
          href={`viber://forward?text=${message}`}
          aria-label={`${label} на Viber`}
          title="Сподели преку инсталираната Viber апликација"
          className={`${linkClass} bg-[#7360a6] hover:bg-[#5f4d8c]`}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          Viber
        </a>
        <a
          href={`https://wa.me/?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${label} на WhatsApp`}
          className={`${linkClass} bg-[#128c4e] hover:bg-[#0e713f]`}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
