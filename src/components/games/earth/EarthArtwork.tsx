import { useId } from "react";
import type { ContinentId, TerrainId } from "@/data/earthExpedition";

const continents: { id: ContinentId; name: string; number: number; color: string; point: [number, number]; path: string }[] = [
  { id: "north-america", name: "Северна Америка", number: 1, color: "hsl(43 89% 70%)", point: [175, 112], path: "M55 77 85 49 126 54 150 37 195 43 212 58 246 59 261 90 243 111 221 128 216 153 238 177 256 192 247 204 225 190 207 175 188 160 163 156 146 137 119 124 106 99 79 92ZM277 39 306 31 329 45 317 72 292 83 279 65Z" },
  { id: "south-america", name: "Јужна Америка", number: 2, color: "hsl(24 86% 73%)", point: [281, 245], path: "M247 199 274 192 301 202 325 223 319 247 303 263 294 292 281 313 269 338 257 318 258 289 246 270 234 243 229 218Z" },
  { id: "europe", name: "Европа", number: 3, color: "hsl(332 64% 80%)", point: [420, 105], path: "M383 104 400 86 408 64 426 55 438 70 430 91 453 88 463 104 453 120 435 127 427 141 416 126 404 131 396 120 378 120Z" },
  { id: "africa", name: "Африка", number: 4, color: "hsl(35 91% 65%)", point: [447, 202], path: "M399 139 426 131 459 137 477 155 490 175 477 196 470 226 450 260 431 253 423 223 406 203 389 179 388 157ZM492 222 498 230 491 253 482 247Z" },
  { id: "asia", name: "Азија", number: 5, color: "hsl(151 43% 65%)", point: [574, 111], path: "M438 69 463 52 500 48 526 59 557 47 588 56 611 49 646 65 680 71 710 95 698 112 670 114 655 136 630 142 614 161 598 155 589 185 576 206 565 191 552 165 535 167 524 188 511 174 501 155 478 150 457 129 462 106 451 88 430 91ZM689 143 698 150 690 168 682 162ZM607 207 620 211 637 220 652 218 660 228 641 232 624 226 608 222Z" },
  { id: "australia", name: "Австралија со Океанија", number: 6, color: "hsl(272 51% 80%)", point: [664, 283], path: "M622 267 642 253 661 258 674 246 687 257 699 277 713 284 709 305 687 315 669 304 646 309 625 296 614 280ZM694 326 706 325 701 337 692 335ZM741 310 747 315 736 331 729 330ZM727 334 735 338 723 351 715 347Z" },
  { id: "antarctica", name: "Антарктик", number: 7, color: "hsl(201 44% 96%)", point: [425, 379], path: "M128 377 166 364 200 368 235 353 273 363 308 354 349 360 384 349 420 360 459 353 492 361 528 354 560 364 598 359 634 369 670 368 699 382 684 397 646 394 603 406 557 400 518 408 471 401 426 411 380 405 341 409 305 400 264 405 225 396 188 400 154 389Z" },
];

const terrainPlaces: { id: TerrainId; name: string; number: number; point: [number, number] }[] = [
  { id: "mountain", name: "Планина", number: 1, point: [239, 168] },
  { id: "hill", name: "Рид", number: 2, point: [538, 214] },
  { id: "plain", name: "Рамница", number: 3, point: [492, 310] },
  { id: "river", name: "Река", number: 4, point: [349, 308] },
  { id: "lake", name: "Езеро", number: 5, point: [618, 326] },
  { id: "sea", name: "Море", number: 6, point: [102, 371] },
];

interface MapProps<T extends string> {
  onPick?: (id: T) => void;
  selected?: string;
  disabled?: boolean;
}

function MapMarker({ x, y, label, name, selected, disabled, onPick }: {
  x: number; y: number; label: string; name: string; selected: boolean; disabled?: boolean; onPick?: () => void;
}) {
  return (
    <g role="button" tabIndex={disabled ? -1 : 0} aria-label={name} aria-pressed={selected} aria-disabled={disabled || undefined}
      className={`earth-map-marker ${selected ? "is-picked" : ""}`} transform={`translate(${x} ${y})`}
      onClick={() => { if (!disabled) onPick?.(); }}
      onKeyDown={event => { if (!disabled && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onPick?.(); } }}>
      <circle r="27" className="earth-marker-halo" />
      <circle r="20" className="earth-marker-core" />
      <text textAnchor="middle" y="7" fontSize="22" fontWeight="800" fill="hsl(177 47% 19%)" pointerEvents="none">{label}</text>
    </g>
  );
}

export function WorldAtlas({ onPick, selected, disabled }: MapProps<ContinentId>) {
  return (
    <div className="earth-atlas">
      <svg viewBox="0 0 800 440" role="group" aria-label="Илустрирана карта со седум континенти" className="earth-world-svg">
        <rect width="800" height="440" rx="24" fill="hsl(193 62% 88%)" />
        {[80, 150, 220, 290, 360].map(y => <path key={y} d={`M20 ${y}H780`} stroke="hsl(193 40% 74%)" strokeDasharray="4 8" fill="none" />)}
        {[100, 200, 300, 400, 500, 600, 700].map(x => <path key={x} d={`M${x} 20V420`} stroke="hsl(193 40% 74%)" strokeDasharray="4 8" fill="none" />)}
        <text x="339" y="248" textAnchor="middle" fontSize="13" fill="hsl(194 46% 35%)" transform="rotate(-7 339 248)">Атлантски Океан</text>
        <text x="111" y="247" textAnchor="middle" fontSize="13" fill="hsl(194 46% 35%)">Тихи Океан</text>
        <text x="552" y="293" textAnchor="middle" fontSize="13" fill="hsl(194 46% 35%)">Индиски Океан</text>
        {continents.map(continent => (
          <g key={continent.id}>
            <path d={continent.path} fill={continent.color} stroke="hsl(177 31% 39%)" strokeWidth="2.5" strokeLinejoin="round" opacity={selected && selected !== continent.id ? 0.65 : 1}
              style={{ cursor: disabled ? "default" : "pointer" }} onClick={() => { if (!disabled) onPick?.(continent.id); }} />
            <MapMarker x={continent.point[0]} y={continent.point[1]} label={String(continent.number)} name={continent.name}
              selected={selected === continent.id} disabled={disabled} onPick={() => onPick?.(continent.id)} />
          </g>
        ))}
        <path d="M746 58V23m0 0-8 11m8-11 8 11" fill="none" stroke="hsl(177 47% 25%)" strokeWidth="3" strokeLinecap="round" />
        <text x="746" y="77" textAnchor="middle" fontSize="16" fontWeight="700" fill="hsl(177 47% 25%)">С</text>
      </svg>
      <p className="earth-map-caption">Илустрирана карта со приближни форми на континентите.</p>
      <div className="earth-map-legend" aria-label="Легенда на континентите">
        {continents.map(continent => <button key={continent.id} type="button" disabled={disabled} onClick={() => onPick?.(continent.id)}
          aria-label={`Избери ${continent.name}`} aria-pressed={selected === continent.id} className={selected === continent.id ? "is-picked" : ""}>
          <span style={{ backgroundColor: continent.color }}>{continent.number}</span>{continent.name}
        </button>)}
      </div>
    </div>
  );
}

export function IslandLandscape({ onPick, selected, disabled }: MapProps<TerrainId>) {
  const id = useId().replace(/:/g, "");
  return (
    <div className="earth-landscape">
      <svg viewBox="0 0 800 460" role={onPick ? "group" : "img"} aria-label="Илустриран остров со планина, рид, рамница, река, езеро и море">
        <defs>
          <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="hsl(188 64% 90%)" /><stop offset="1" stopColor="hsl(48 83% 95%)" /></linearGradient>
          <linearGradient id={`${id}-sea`} x2="0" y2="1"><stop stopColor="hsl(191 63% 69%)" /><stop offset="1" stopColor="hsl(190 53% 48%)" /></linearGradient>
          <linearGradient id={`${id}-land`} x2="0" y2="1"><stop stopColor="hsl(133 37% 68%)" /><stop offset="1" stopColor="hsl(151 41% 47%)" /></linearGradient>
        </defs>
        <rect width="800" height="460" rx="26" fill={`url(#${id}-sky)`} />
        <circle cx="649" cy="81" r="35" fill="hsl(42 97% 70%)" />
        <circle cx="649" cy="81" r="48" fill="hsl(42 97% 70% / .18)" />
        <g fill="hsl(0 0% 100% / .85)" className="earth-cloud">
          <path d="M64 86a21 21 0 0 1 35-14 26 26 0 0 1 49 7 17 17 0 0 1 10 31H67a12 12 0 0 1-3-24Z" />
          <path d="M414 55a17 17 0 0 1 30-9 22 22 0 0 1 42 7 14 14 0 0 1 8 26h-77a12 12 0 0 1-3-24Z" />
        </g>
        <path d="M0 236Q200 220 400 243T800 233V460H0Z" fill={`url(#${id}-sea)`} />
        <g fill="none" stroke="hsl(188 65% 91% / .55)" strokeWidth="3" strokeLinecap="round">
          <path d="M31 294h60m-40 32h37m591-57h54M30 410h82m575 12h65M590 442h42M160 439h51" />
        </g>
        <path d="M138 238Q103 207 162 192Q195 163 268 183Q333 158 385 187Q464 175 511 198Q576 190 616 219Q704 218 727 271Q760 308 717 354Q684 390 596 398Q544 425 453 412Q383 430 318 404Q242 411 198 374Q122 359 124 320Q79 280 138 238Z" fill="hsl(39 79% 78%)" />
        <path d="M151 234Q122 209 174 204Q215 179 275 195Q338 176 390 200Q467 187 514 213Q575 207 613 232Q690 230 710 278Q737 308 704 342Q669 375 590 383Q540 408 453 397Q386 415 324 390Q247 398 209 362Q140 351 141 316Q101 278 151 234Z" fill={`url(#${id}-land)`} />
        <ellipse cx="503" cy="325" rx="105" ry="28" fill="hsl(106 42% 72%)" />
        <path d="M441 244Q478 174 529 184Q577 174 609 249Z" fill="hsl(144 36% 42%)" />
        <path d="M484 247Q523 196 565 211Q596 216 624 254Z" fill="hsl(137 41% 57%)" />
        <path d="M157 248 243 90 328 248Z" fill="hsl(173 27% 40%)" />
        <path d="M243 90 264 177 328 248 243 227Z" fill="hsl(177 32% 30%)" />
        <path d="m208 154 35-64 35 65-21-7-13 17-15-18Z" fill="hsl(180 31% 96%)" />
        <path d="M276 247 329 153 384 247Z" fill="hsl(159 29% 48%)" />
        <path d="m310 188 19-35 20 36-12-5-8 12-10-12Z" fill="hsl(174 30% 95%)" />
        <path d="M290 244C364 263 298 288 349 305S413 341 357 357 321 388 334 400" fill="none" stroke="hsl(184 43% 85%)" strokeWidth="22" strokeLinecap="round" />
        <path d="M290 244C364 263 298 288 349 305S413 341 357 357 321 388 334 400" fill="none" stroke="hsl(193 70% 57%)" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="616" cy="326" rx="61" ry="32" fill="hsl(160 35% 40% / .3)" />
        <ellipse cx="615" cy="321" rx="56" ry="26" fill="hsl(192 74% 58%)" />
        <path d="M582 316q28-10 59-1m-42 15h26" fill="none" stroke="hsl(187 75% 85%)" strokeWidth="3" strokeLinecap="round" />
        <g>{[[190, 280], [218, 301], [164, 315], [242, 326], [183, 347], [447, 240], [679, 279], [654, 365], [583, 365]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0-8V17" stroke="hsl(28 33% 36%)" strokeWidth="5" /><path d="m0-41-20 32h10l-17 20h54L10-9h10Z" fill={i % 2 ? "hsl(162 44% 30%)" : "hsl(157 41% 35%)"} />
        </g>)}</g>
        <g transform="translate(461 348)"><path d="m-27 22 27-44 28 44Z" fill="hsl(35 94% 67%)" stroke="hsl(28 64% 40%)" strokeWidth="2" /><path d="M0-22 0 22H20Z" fill="hsl(24 79% 58%)" /><path d="m0 1-10 21h10Z" fill="hsl(174 44% 22%)" /></g>
        <path d="M364 353q55 45 97 17" fill="none" stroke="hsl(44 74% 82%)" strokeWidth="5" strokeDasharray="6 8" strokeLinecap="round" />
        <g fill="hsl(177 48% 25%)"><path d="M367 102q7-8 15 0 7-8 14 0" fill="none" stroke="hsl(177 48% 25%)" strokeWidth="3" strokeLinecap="round" /></g>
        {onPick && terrainPlaces.map(place => <MapMarker key={place.id} x={place.point[0]} y={place.point[1]} label={String(place.number)} name={place.name}
          selected={selected === place.id} disabled={disabled} onPick={() => onPick(place.id)} />)}
      </svg>
      {onPick && <><p className="earth-map-caption">Пределот е измислен. Природните форми се вистински!</p>
        <div className="earth-map-legend" aria-label="Легенда на пределот">
          {terrainPlaces.map(place => <button key={place.id} type="button" disabled={disabled} onClick={() => onPick(place.id)} className={selected === place.id ? "is-picked" : ""} aria-pressed={selected === place.id} aria-label={`Избери ${place.name}`}>
            <span>{place.number}</span>{place.name}
          </button>)}
        </div></>}
    </div>
  );
}
