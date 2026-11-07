import { CloudSun, Compass, Leaf, Mountain, Waves, Wind } from "lucide-react";
import type { GameId } from "@/data/educationalGames";
import { IslandLandscape } from "./earth/EarthArtwork";

export default function GameIllustration({ gameId }: { gameId: GameId }) {
  return <div className={`game-illustration game-illustration-${gameId}`} aria-hidden="true">
    <span className="game-art-orbit game-art-orbit-one" /><span className="game-art-orbit game-art-orbit-two" />
    {gameId === "terrain" ? <IslandLandscape /> : gameId === "atlas" ? <>
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
