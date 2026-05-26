import { useEffect, useMemo, useState } from "react";
import "./puppy-buddy.css";

interface GirlBuddyProps {
  celebrateKey: number;
  dissatisfiedKey: number;
  onActivate?: () => void;
}

const cheeringMessages = [
  "Браво! Многу паметно!",
  "Одлична работа!",
  "Супер! Продолжи!",
  "Точно! Горда сум на тебе!",
];

const GirlBuddy = ({ celebrateKey, dissatisfiedKey, onActivate }: GirlBuddyProps) => {
  const [isCheering, setIsCheering] = useState(false);
  const [isDissatisfied, setIsDissatisfied] = useState(false);

  const message = useMemo(
    () => cheeringMessages[Math.floor(Math.random() * cheeringMessages.length)],
    [celebrateKey]
  );

  useEffect(() => {
    if (celebrateKey === 0) return;

    setIsDissatisfied(false);
    setIsCheering(true);
    const timeoutId = window.setTimeout(() => {
      setIsCheering(false);
    }, 1700);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [celebrateKey]);

  useEffect(() => {
    if (dissatisfiedKey === 0) return;

    setIsCheering(false);
    setIsDissatisfied(true);
    const timeoutId = window.setTimeout(() => {
      setIsDissatisfied(false);
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dissatisfiedKey]);

  const isDissatisfiedActive = isDissatisfied && !isCheering;

  return (
    <div className="character-buddy-wrapper" aria-live="polite" aria-atomic="true">
      <div className={`puppy-bubble ${isCheering && !isDissatisfiedActive ? "puppy-bubble-show" : ""}`} role="status">
        {message}
      </div>

      <button
        type="button"
        className={`character-click-target girl-character ${isCheering ? "girl-cheer" : ""} ${isDissatisfiedActive ? "girl-dissatisfied" : ""}`}
        aria-label="Поддржувачко бело девојче. Кликни за избор на лик"
        onClick={onActivate}
      >
        <svg viewBox="0 0 180 180" className="puppy-svg" role="img" aria-hidden="true">
          <path d="M50 114 Q52 70 74 58 L76 130 Q58 130 50 114" fill="#f1c24e" />
          <path d="M130 114 Q128 70 106 58 L104 130 Q122 130 130 114" fill="#f1c24e" />
          <circle cx="90" cy="94" r="33" fill="#fae8d8" />
          <path d="M58 84 Q60 50 90 46 Q120 50 122 84 Q114 68 90 68 Q66 68 58 84" fill="#f1c24e" />
          <path d="M62 60 Q88 39 118 58" fill="none" stroke="#f1c24e" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="74" cy="92" rx="5.5" ry="6.5" fill="#2f5fa2" />
          <ellipse cx="106" cy="92" rx="5.5" ry="6.5" fill="#2f5fa2" />
          <circle className="girl-eye-sparkle" cx="72" cy="85" r="2" fill="#fff" />
          <circle className="girl-eye-sparkle" cx="112" cy="85" r="2" fill="#fff" />
          <path className={`girl-smile ${isCheering ? "girl-smile-happy" : ""} ${isDissatisfiedActive ? "girl-smile-dissatisfied" : ""}`} d={isCheering ? "M74 108 Q90 126 106 108" : isDissatisfiedActive ? "M76 116 Q90 109 104 116" : "M76 110 Q90 119 104 110"} fill="none" stroke="#955136" strokeWidth={isCheering ? 5 : 4} strokeLinecap="round" />
          <circle className={`girl-blush ${isCheering ? "girl-blush-happy" : ""}`} cx="63" cy="99" r="6" fill="#ee9ea3" opacity="0.72" />
          <circle className={`girl-blush ${isCheering ? "girl-blush-happy" : ""}`} cx="117" cy="99" r="6" fill="#ee9ea3" opacity="0.72" />
          <rect x="67" y="128" width="46" height="30" rx="12" fill="#ef77b6" />
          <circle cx="90" cy="149" r="3" fill="#ffe9f4" />
        </svg>
      </button>
    </div>
  );
};

export default GirlBuddy;
