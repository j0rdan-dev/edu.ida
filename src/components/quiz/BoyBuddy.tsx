import { useEffect, useMemo, useState } from "react";
import "./puppy-buddy.css";

interface BoyBuddyProps {
  celebrateKey: number;
  onActivate?: () => void;
}

const cheeringMessages = [
  "Браво! Одлично решено!",
  "Супер си! Само така!",
  "Точно! Ајде уште едно!",
  "Одлична работа!",
];

const BoyBuddy = ({ celebrateKey, onActivate }: BoyBuddyProps) => {
  const [isCheering, setIsCheering] = useState(false);

  const message = useMemo(
    () => cheeringMessages[Math.floor(Math.random() * cheeringMessages.length)],
    [celebrateKey]
  );

  useEffect(() => {
    if (celebrateKey === 0) return;

    setIsCheering(true);
    const timeoutId = window.setTimeout(() => {
      setIsCheering(false);
    }, 1700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [celebrateKey]);

  return (
    <div className="character-buddy-wrapper" aria-live="polite" aria-atomic="true">
      <div className={`puppy-bubble ${isCheering ? "puppy-bubble-show" : ""}`} role="status">
        {message}
      </div>

      <button
        type="button"
        className={`character-click-target boy-character ${isCheering ? "boy-cheer" : ""}`}
        aria-label="Поддржувачко бело момче. Кликни за избор на лик"
        onClick={onActivate}
      >
        <svg viewBox="0 0 180 180" className="puppy-svg" role="img" aria-hidden="true">
          <circle cx="90" cy="94" r="33" fill="#f8dfc9" />
          <path d="M58 84 Q60 52 90 48 Q120 52 122 84 Q114 68 90 68 Q66 68 58 84" fill="#8c4f2f" />
          <path d="M62 60 Q88 39 118 58" fill="none" stroke="#8c4f2f" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="74" cy="92" rx="5.5" ry="6.5" fill="#2f466f" />
          <ellipse cx="106" cy="92" rx="5.5" ry="6.5" fill="#2f466f" />
          <circle className="boy-eye-sparkle" cx="76" cy="89" r="2" fill="#fff" />
          <circle className="boy-eye-sparkle" cx="108" cy="89" r="2" fill="#fff" />
          <path className={`boy-smile ${isCheering ? "boy-smile-happy" : ""}`} d={isCheering ? "M74 108 Q90 126 106 108" : "M76 110 Q90 119 104 110"} fill="none" stroke="#955136" strokeWidth={isCheering ? 5 : 4} strokeLinecap="round" />
          <circle className={`boy-blush ${isCheering ? "boy-blush-happy" : ""}`} cx="65" cy="102" r="6" fill="#edb7b5" opacity="0.72" />
          <circle className={`boy-blush ${isCheering ? "boy-blush-happy" : ""}`} cx="115" cy="102" r="6" fill="#edb7b5" opacity="0.72" />
          <rect x="67" y="128" width="46" height="30" rx="12" fill="#5b8ce6" />
          <circle cx="90" cy="149" r="3" fill="#f4f7ff" />
        </svg>
      </button>
    </div>
  );
};

export default BoyBuddy;
