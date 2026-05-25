import { useEffect, useMemo, useState } from "react";
import "./puppy-buddy.css";

interface GirlBuddyProps {
  celebrateKey: number;
  onActivate?: () => void;
}

const cheeringMessages = [
  "Браво! Многу паметно!",
  "Одлична работа!",
  "Супер! Продолжи!",
  "Точно! Горда сум на тебе!",
];

const GirlBuddy = ({ celebrateKey, onActivate }: GirlBuddyProps) => {
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
        className={`character-click-target girl-character ${isCheering ? "girl-cheer" : ""}`}
        aria-label="Поддржувачко бело девојче. Кликни за избор на лик"
        onClick={onActivate}
      >
        <svg viewBox="0 0 180 180" className="puppy-svg" role="img" aria-hidden="true">
          <circle cx="90" cy="91" r="34" fill="#fae8d8" />
          <path d="M56 92 Q58 47 90 44 Q122 47 124 92 L124 106 Q118 124 103 131 H77 Q62 124 56 106 Z" fill="#f0c14f" />
          <path d="M67 46 Q90 29 113 46" fill="none" stroke="#f0c14f" strokeWidth="10" strokeLinecap="round" />
          <circle cx="64" cy="122" r="9" fill="#f0c14f" />
          <circle cx="116" cy="122" r="9" fill="#f0c14f" />
          <ellipse cx="70" cy="88" rx="5.5" ry="6.5" fill="#2f5fa2" />
          <ellipse cx="110" cy="88" rx="5.5" ry="6.5" fill="#2f5fa2" />
          <circle className="girl-eye-sparkle" cx="72" cy="85" r="2" fill="#fff" />
          <circle className="girl-eye-sparkle" cx="112" cy="85" r="2" fill="#fff" />
          <path className={`girl-smile ${isCheering ? "girl-smile-happy" : ""}`} d={isCheering ? "M74 104 Q90 122 106 104" : "M76 106 Q90 116 104 106"} fill="none" stroke="#7f3e2e" strokeWidth={isCheering ? 5 : 4} strokeLinecap="round" />
          <circle className={`girl-blush ${isCheering ? "girl-blush-happy" : ""}`} cx="63" cy="99" r="6" fill="#ee9ea3" opacity="0.72" />
          <circle className={`girl-blush ${isCheering ? "girl-blush-happy" : ""}`} cx="117" cy="99" r="6" fill="#ee9ea3" opacity="0.72" />
          <path d="M66 60 H80" stroke="#7d5b12" strokeWidth="3" strokeLinecap="round" />
          <path d="M100 60 H114" stroke="#7d5b12" strokeWidth="3" strokeLinecap="round" />
          <path className="girl-heart" d="M141 83 C141 77 146 73 151 73 C155 73 158 75 160 78 C162 75 165 73 169 73 C174 73 179 77 179 83 C179 92 170 99 160 106 C150 99 141 92 141 83 Z" fill="#f45d86" transform="translate(-18 8) scale(0.45)" />
        </svg>
      </button>
    </div>
  );
};

export default GirlBuddy;
