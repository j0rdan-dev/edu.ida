import { useEffect, useMemo, useState } from "react";
import "./puppy-buddy.css";

interface CatBuddyProps {
  celebrateKey: number;
  dissatisfiedKey: number;
  onActivate?: () => void;
}

const cheeringMessages = [
  "Мјау! Браво!",
  "Одлично! Само напред!",
  "Точно! Ти оди супер!",
  "Многу добро!",
];

const CatBuddy = ({ celebrateKey, dissatisfiedKey, onActivate }: CatBuddyProps) => {
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
        className={`character-click-target cat-character ${isCheering ? "cat-cheer" : ""} ${isDissatisfiedActive ? "cat-dissatisfied" : ""}`}
        aria-label="Поддржувачко маче. Кликни за избор на лик"
        onClick={onActivate}
      >
        <svg viewBox="0 0 180 180" className="puppy-svg" role="img" aria-hidden="true">
          <ellipse cx="90" cy="96" rx="50" ry="48" fill="#d7d9e8" />
          <path d="M52 60 L72 35 L78 66 Z" fill="#bec2d8" />
          <path d="M128 60 L108 35 L102 66 Z" fill="#bec2d8" />
          <path d="M58 58 L71 42 L74 61 Z" fill="#f5b8c6" />
          <path d="M122 58 L109 42 L106 61 Z" fill="#f5b8c6" />
          <ellipse cx="90" cy="114" rx="26" ry="20" fill="#f5f6fb" />
          <ellipse className={`cat-eye ${isCheering ? "cat-eye-happy" : ""} ${isDissatisfiedActive ? "cat-eye-dissatisfied" : ""}`} cx="72" cy="92" rx="6" ry="7" fill="#2f3445" />
          <ellipse className={`cat-eye ${isCheering ? "cat-eye-happy" : ""} ${isDissatisfiedActive ? "cat-eye-dissatisfied" : ""}`} cx="108" cy="92" rx="6" ry="7" fill="#2f3445" />
          <circle className="cat-eye-sparkle" cx="74" cy="89" r="2" fill="#fff" />
          <circle className="cat-eye-sparkle" cx="110" cy="89" r="2" fill="#fff" />
          <path d="M90 105 L84 113 H96 Z" fill="#f09ab5" />
          <path
            className={`cat-smile ${isCheering ? "cat-smile-happy" : ""} ${isDissatisfiedActive ? "cat-smile-dissatisfied" : ""}`}
            d={isCheering ? "M74 120 Q90 137 106 120" : isDissatisfiedActive ? "M76 126 Q90 119 104 126" : "M76 121 Q90 131 104 121"}
            fill="none"
            stroke="#454b5f"
            strokeWidth={isCheering ? 5 : 4}
            strokeLinecap="round"
          />
          <path d="M52 110 H74" stroke="#616981" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 119 H72" stroke="#616981" strokeWidth="3" strokeLinecap="round" />
          <path d="M106 110 H128" stroke="#616981" strokeWidth="3" strokeLinecap="round" />
          <path d="M108 119 H128" stroke="#616981" strokeWidth="3" strokeLinecap="round" />
          <path className="cat-tail" d="M136 125 Q166 126 162 96" fill="none" stroke="#bec2d8" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default CatBuddy;
