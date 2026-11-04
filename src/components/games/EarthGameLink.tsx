import { ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { EARTH_GAME_PATH } from "@/data/earthExpedition";

export default function EarthGameLink() {
  return (
    <Link to={EARTH_GAME_PATH} className="group flex items-center gap-4 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-amber-50 p-5 text-left shadow-sm transition-colors hover:border-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">🌍</span>
      <span className="min-w-0 flex-1"><span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><Compass className="h-3.5 w-3.5" aria-hidden="true" />Учи преку игра</span><span className="block font-display text-lg font-bold text-emerald-950">Мисија: Земја</span><span className="mt-1 block text-sm leading-relaxed text-emerald-800">Карти, тајни патеки и 16 откритија. Земи го истражувачкиот пасош!</span></span>
      <ArrowRight className="h-5 w-5 shrink-0 text-emerald-700 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  );
}
