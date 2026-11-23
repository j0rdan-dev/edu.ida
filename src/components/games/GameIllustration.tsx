import { CloudSun, Compass, Leaf, Mountain, Waves, Wind } from "lucide-react";
import type { GameId } from "@/data/educationalGames";
import { IslandLandscape } from "./earth/EarthArtwork";

export default function GameIllustration({ gameId }: { gameId: GameId }) {
  return <div className={`game-illustration game-illustration-${gameId}`} aria-hidden="true">
    <span className="game-art-orbit game-art-orbit-one" /><span className="game-art-orbit game-art-orbit-two" />
    {gameId === "fractions" ? <svg viewBox="0 0 180 180" fill="none">
      <circle cx="74" cy="78" r="48" fill="#fff0cf" stroke="#cca16c" strokeWidth="3" />
      <path d="M74 30a48 48 0 0 1 48 48H74Z" fill="#d8b8c9" stroke="#fffaf0" strokeWidth="2" />
      <path d="M74 78h48a48 48 0 0 1-48 48Z" fill="#b4d5c7" stroke="#fffaf0" strokeWidth="2" />
      <path d="M26 78h48v48m0-96v48" stroke="#cca16c" strokeWidth="2" />
      <path d="m130 92 32 5-5 47q-1 10-12 10h-10q-11 0-11-10Z" fill="#f6ead1" stroke="#b19f80" strokeWidth="2" />
      <path d="m127 120 32 4-2 20q-1 10-12 10h-10q-11 0-11-10Z" fill="#e7c080" />
      <path d="m146 93 9-40" stroke="#9a84b1" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 154h63m-47-14v28m32-28v28" stroke="#88b09e" strokeWidth="3" strokeLinecap="round" />
    </svg> : gameId === "shapes" ? <svg viewBox="0 0 180 180" fill="none">
      <path d="m90 60 40 23v47l-40 23-40-23V83Z" fill="#c2e2d8" stroke="#5f9586" strokeWidth="2" strokeLinejoin="round" />
      <path d="m50 83 40 24 40-24M90 107v46" stroke="#5f9586" strokeWidth="2" />
      <path d="m90 60 40 23-40 24-40-24Z" fill="#deeee6" stroke="#5f9586" strokeWidth="2" />
      <path d="m28 42 23-20 9 34Z" fill="#d5c4e7" stroke="#9a7eb6" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="142" cy="45" r="18" fill="#f5d6ac" stroke="#c99c62" strokeWidth="2" />
      <path d="M30 100q-19-29 6-39m-5 6 5-7-9 2" stroke="#a7bbb0" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="144" cy="144" r="4" fill="#cbb8df" /><path d="M25 145h12m-6-6v12" stroke="#d5ae79" strokeWidth="2" />
    </svg> : gameId === "symmetry" ? <svg viewBox="0 0 180 180" fill="none">
      <path d="M88 79C52 16 15 35 34 82c-26 45 21 77 53 25" fill="#add8cf" stroke="#69a79b" strokeWidth="2" />
      <path d="M92 79c36-63 73-44 54 3 26 45-21 77-53 25" fill="#d4c2e9" stroke="#a18aba" strokeWidth="2" />
      <path d="M90 24v132" stroke="#b67d68" strokeWidth="2" strokeDasharray="5 5" />
      <path d="M83 68q-16-26-22-15m36 15q16-26 22-15" stroke="#786486" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="90" cy="88" rx="5" ry="27" fill="#786486" />
      <circle cx="54" cy="67" r="8" fill="#d5eee7" /><circle cx="126" cy="67" r="8" fill="#eee4f8" />
      <circle cx="58" cy="108" r="6" fill="#d5eee7" /><circle cx="122" cy="108" r="6" fill="#eee4f8" />
    </svg> : gameId === "coordinates" ? <svg viewBox="0 0 180 180" fill="none">
      {Array.from({ length: 6 }, (_, i) => <g key={i}><path d={`M25 ${30 + i * 25}H155M${25 + i * 25} 30V155`} stroke="#cbdde6" /></g>)}
      <path d="M25 22v133h140" stroke="#6f8ca2" strokeWidth="2" />
      <path d="M50 130V55h75v75Z" fill="#e1f3f5" stroke="#32869d" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="50" cy="130" r="6" fill="#e8a044" stroke="white" strokeWidth="2" />
      <text x="37" y="121" fill="#344b61" fontSize="14" fontWeight="700">A</text>
      <path d="m155 151 9 4-9 4m-134-128 4-9 4 9" stroke="#6f8ca2" strokeWidth="2" />
    </svg> : gameId === "terrain" ? <IslandLandscape /> : gameId === "atlas" ? <>
      <svg viewBox="0 0 240 180" className="game-globe" fill="none">
        <ellipse cx="120" cy="155" rx="57" ry="8" fill="hsl(160 35% 35% / .12)" />
        <circle cx="120" cy="85" r="65" fill="hsl(193 65% 79%)" stroke="hsl(172 35% 31%)" strokeWidth="3" />
        <path d="m78 39 19-8 14 13-7 16 13 8-9 18-16 1-2 21-14-10-9-24 8-15Zm53-12 25 14 10 14-12 12-20-4-9 19 14 11 1 21-14 22-15-9 2-21-13-15 8-19 12-8-3-17Zm35 76 13 4 2 15-17 9-9-10Z" fill="hsl(147 38% 50%)" />
        <ellipse cx="120" cy="85" rx="30" ry="65" stroke="hsl(172 35% 31% / .35)" strokeWidth="1.5" />
        <path d="M57 85h126M66 53q54 19 108 0M66 117q54-19 108 0" stroke="hsl(172 35% 31% / .35)" strokeWidth="1.5" />
        <path d="M47 116C1 150 49 177 139 148s98-79 55-62" stroke="hsl(33 80% 55%)" strokeWidth="3" strokeDasharray="5 6" />
        <path d="m188 72 9 15-17 4" fill="hsl(33 80% 55%)" />
      </svg><span className="game-art-spark">✦</span>
    </> : gameId === "compass" ? <>
      <div className="game-compass-rose"><span>С</span><span>И</span><span>Ј</span><span>З</span><Compass strokeWidth={1.1} /></div>
      <span className="game-art-pin">📍</span><span className="game-art-spark">✧</span>
    </> : gameId === "spheres" ? <div className="game-sphere-art"><span><Mountain /></span><span><Waves /></span><span><Wind /></span><span><Leaf /></span><b>🌍</b></div>
      : <><CloudSun className="game-weather-art" strokeWidth={1.2} /><span className="game-weather-reading">18°</span><span className="game-art-spark">✧</span></>}
  </div>;
}
