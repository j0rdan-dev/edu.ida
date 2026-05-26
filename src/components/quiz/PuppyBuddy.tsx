import { useEffect, useMemo, useState } from "react";
import "./puppy-buddy.css";

interface PuppyBuddyProps {
  celebrateKey: number;
  dissatisfiedKey: number;
  onActivate?: () => void;
}

const cheeringMessages = [
  "Браво! Одлично!",
  "Супер! Продолжи така!",
  "Ав ав! Точен одговор!",
  "И јас учам од тебе! Ав ав!",
];

const PuppyBuddy = ({ celebrateKey, dissatisfiedKey, onActivate }: PuppyBuddyProps) => {
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
        className={`character-click-target puppy-character ${isCheering ? "puppy-cheer" : ""} ${isDissatisfiedActive ? "puppy-dissatisfied" : ""}`}
        aria-label="Поддржувачко кутре. Кликни за избор на лик"
        onClick={onActivate}
      >
        <svg viewBox="0 0 180 180" className="puppy-svg" role="img" aria-hidden="true">
          <circle cx="95" cy="94" r="53" fill="#f7d2a4" />
          <ellipse cx="46" cy="66" rx="16" ry="24" fill="#cf9364" />
          <ellipse cx="142" cy="66" rx="16" ry="24" fill="#cf9364" />
          <ellipse cx="95" cy="111" rx="30" ry="24" fill="#fff0da" />
          <ellipse cx="95" cy="108" rx="11" ry="8" fill="#4a2f1f" />
          <circle className={`puppy-eye ${isCheering ? "puppy-eye-happy" : ""} ${isDissatisfiedActive ? "puppy-eye-dissatisfied" : ""}`} cx="72" cy="86" r="7" fill="#332016" />
          <circle className={`puppy-eye ${isCheering ? "puppy-eye-happy" : ""} ${isDissatisfiedActive ? "puppy-eye-dissatisfied" : ""}`} cx="118" cy="86" r="7" fill="#332016" />
          <circle className="puppy-eye-sparkle" cx="74" cy="83" r="2" fill="#fff" />
          <circle className="puppy-eye-sparkle" cx="120" cy="83" r="2" fill="#fff" />
          <path
            className={`puppy-smile ${isCheering ? "puppy-smile-happy" : ""} ${isDissatisfiedActive ? "puppy-smile-dissatisfied" : ""}`}
            d={isCheering ? "M80 121 Q95 142 110 121" : isDissatisfiedActive ? "M82 127 Q95 119 108 127" : "M82 123 Q95 133 108 123"}
            fill="none"
            stroke="#5a2f19"
            strokeWidth={isCheering ? 6 : 5}
            strokeLinecap="round"
          />
          <circle className={`puppy-blush ${isCheering ? "puppy-blush-happy" : ""}`} cx="64" cy="106" r="7" fill="#f7b6a5" opacity="0.8" />
          <circle className={`puppy-blush ${isCheering ? "puppy-blush-happy" : ""}`} cx="126" cy="106" r="7" fill="#f7b6a5" opacity="0.8" />

          <path className="puppy-tail" d="M148 133 Q168 119 160 98" fill="none" stroke="#cf9364" strokeWidth="9" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default PuppyBuddy;
