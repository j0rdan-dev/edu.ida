import { useEffect, useMemo, useState } from "react";
import "./puppy-buddy.css";

interface TeacherBuddyProps {
  celebrateKey: number;
  onActivate?: () => void;
}

const sarcasticMessages = [
  "Браво, конечно нешто и ти да погодиш.",
  "Точно. Чудо невидено.",
  "Добро, добро... и јас сум импресиониран.",
  "Браво, одговори едно лесно прашање.",
];

const TeacherBuddy = ({ celebrateKey, onActivate }: TeacherBuddyProps) => {
  const [isCheering, setIsCheering] = useState(false);

  const message = useMemo(
    () => sarcasticMessages[Math.floor(Math.random() * sarcasticMessages.length)],
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
      <div className={`puppy-bubble teacher-bubble ${isCheering ? "puppy-bubble-show" : ""}`} role="status">
        {message}
      </div>

      <button
        type="button"
        className={`character-click-target teacher-character ${isCheering ? "teacher-cheer" : ""}`}
        aria-label="Намќорест наставник. Кликни за избор на лик"
        onClick={onActivate}
      >
        <svg viewBox="0 0 180 180" className="puppy-svg" role="img" aria-hidden="true">
          <circle cx="90" cy="93" r="33" fill="#efd8c3" />
          <path d="M57 84 Q60 50 90 47 Q120 50 123 84 Q116 66 90 66 Q64 66 57 84" fill="#3b3f48" />
          <path d="M62 60 Q89 38 118 58" fill="none" stroke="#3b3f48" strokeWidth="8" strokeLinecap="round" />
          <rect x="68" y="88" width="12" height="10" rx="4" fill="none" stroke="#2f3542" strokeWidth="2.5" />
          <rect x="100" y="88" width="12" height="10" rx="4" fill="none" stroke="#2f3542" strokeWidth="2.5" />
          <line x1="80" y1="93" x2="100" y2="93" stroke="#2f3542" strokeWidth="2" />
          <path className={`teacher-brow ${isCheering ? "teacher-brow-happy" : ""}`} d="M69 84 L81 82" stroke="#2f3542" strokeWidth="3.2" strokeLinecap="round" />
          <path className={`teacher-brow ${isCheering ? "teacher-brow-happy" : ""}`} d="M99 82 L111 84" stroke="#2f3542" strokeWidth="3.2" strokeLinecap="round" />
          <ellipse cx="74" cy="94" rx="3.6" ry="4.8" fill="#252a36" />
          <ellipse cx="106" cy="94" rx="3.6" ry="4.8" fill="#252a36" />
          <path className={`teacher-smile ${isCheering ? "teacher-smile-happy" : ""}`} d={isCheering ? "M74 108 Q90 121 106 108" : "M76 110 Q90 106 104 110"} fill="none" stroke="#72493a" strokeWidth={isCheering ? 4.6 : 4} strokeLinecap="round" />
          <path d="M84 103 Q90 107 96 103" fill="none" stroke="#8a5a48" strokeWidth="2.8" strokeLinecap="round" />
          <rect x="63" y="128" width="54" height="30" rx="12" fill="#6b7280" />
          <rect x="86" y="128" width="8" height="30" rx="3" fill="#b7c0cf" />
          <circle cx="90" cy="145" r="2.6" fill="#dbe3ef" />
        </svg>
      </button>
    </div>
  );
};

export default TeacherBuddy;
