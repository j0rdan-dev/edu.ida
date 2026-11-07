import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, Lightbulb, Maximize2 } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { EarthMission } from "@/data/earthExpedition";
import type { EducationalGame } from "@/data/educationalGames";
import MissionActivity from "./earth/MissionActivity";
import "./game-play-screen.css";

type SupportPanel = "hint" | "lesson" | "explanation" | "task";

interface GamePlayScreenProps {
  game: EducationalGame;
  mission: EarthMission;
  index: number;
  count: number;
  completed: number;
  solved: boolean;
  retry: boolean;
  selected: string;
  canSave: boolean;
  headingRef: RefObject<HTMLHeadingElement>;
  onBack: () => void;
  onHint: () => void;
  onResult: (correct: boolean, selection: string) => void;
  onNext: () => void;
}

function playPrompt(mission: EarthMission) {
  if (mission.kind === "compass") return "Следи ги насоките по ред. Едно притискање = едно поле.";
  if (mission.kind === "spheres") return "На која Земјина обвивка ѝ припаѓа ова откритие?";
  if (mission.kind === "temperature") return "Прочитај го термометарот. Едно мало деление = 2 °C.";
  if (mission.kind === "rain") return "Колку дожд наврнало? Едно мало деление = 2 mm.";
  if (mission.kind === "climate") return "Дали белешката опишува време или клима?";
  return mission.prompt;
}

export default function GamePlayScreen({ game, mission, index, count, completed, solved, retry, selected, canSave, headingRef, onBack, onHint, onResult, onNext }: GamePlayScreenProps) {
  const [support, setSupport] = useState<SupportPanel | null>(null);
  const supportReturnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("game-play-active");
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    return () => { document.documentElement.classList.remove("game-play-active"); };
  }, []);

  const openSupport = (panel: SupportPanel, button: HTMLButtonElement) => {
    supportReturnRef.current = button;
    if (panel === "hint") onHint();
    setSupport(panel);
  };

  return <div className={`game-viewport game-viewport-${mission.kind}`} aria-label={game.name}>
    <header className="game-play-toolbar">
      <button type="button" className="game-tool-button" aria-label="Поставки на играта" onClick={onBack}><ArrowLeft aria-hidden="true" /></button>
      <span className="game-play-name"><span aria-hidden="true">{game.emoji}</span>{game.shortTitle}</span>
      <span className="game-play-round" aria-label={`Откритие ${index + 1} од ${count}`}>{index + 1}<span> / {count}</span></span>
      <button type="button" className="game-tool-button" aria-label="Мала помош?" onClick={event => openSupport("hint", event.currentTarget)}><Lightbulb aria-hidden="true" /></button>
      <button type="button" className="game-tool-button" aria-label="Потсети се на лекцијата" onClick={event => openSupport("lesson", event.currentTarget)}><BookOpen aria-hidden="true" /></button>
    </header>
    <progress className="earth-progress game-play-progress" value={completed} max={count} aria-label="Напредок на играта" />

    <section className="game-play-question" aria-labelledby="game-play-title">
      <h1 id="game-play-title" ref={headingRef} tabIndex={-1} className="sr-only">{mission.title}</h1>
      <p>{playPrompt(mission)}</p>
      <button type="button" className="game-tool-button" aria-label="Целосна задача" onClick={event => openSupport("task", event.currentTarget)}><Maximize2 aria-hidden="true" /></button>
    </section>

    <section className="game-play-stage" aria-label={game.title}>
      <MissionActivity mission={mission} disabled={solved} selected={selected} onResult={onResult} />
    </section>

    <footer className={`game-play-bottom-bar ${solved ? "is-solved" : ""}`}>
      <div className="game-play-status" role="status" aria-live="polite" aria-atomic="true">
        {solved ? <><Check aria-hidden="true" /><h2>Уште едно откритие!</h2></> : <p>{retry ? "Пробај уште еднаш" : "Размисли и пробај. Ти можеш!"}</p>}
        {!canSave && <small>Зачувувањето не е достапно.</small>}
      </div>
      {solved && <>
        <button type="button" className="game-explanation-button" aria-label="Зошто е точно?" onClick={event => openSupport("explanation", event.currentTarget)}>Зошто?</button>
        <button type="button" className="earth-primary-button game-next-button" aria-label={index === count - 1 ? "Види го резултатот" : "Следно откритие"} onClick={onNext}>{index === count - 1 ? "Резултат" : "Следно"}<ArrowRight aria-hidden="true" /></button>
      </>}
    </footer>

    <Dialog open={support !== null} onOpenChange={open => { if (!open) setSupport(null); }}>
      <DialogContent className="game-support-dialog" onCloseAutoFocus={event => { event.preventDefault(); supportReturnRef.current?.focus({ preventScroll: true }); }}>
        <DialogTitle>{support === "hint" ? "Мала помош" : support === "lesson" ? "Мала лекција за големи откритија" : support === "explanation" ? "Зошто е точно?" : mission.title}</DialogTitle>
        <DialogDescription className="sr-only">Прочитај, па врати се на истото место во играта.</DialogDescription>
        <div className="game-support-copy">
          {support === "lesson" ? game.lesson.map(text => <p key={text}>{text}</p>) : <p>{support === "hint" ? mission.hint : support === "explanation" ? mission.explanation : mission.prompt}</p>}
        </div>
        <DialogClose asChild><button type="button" className="earth-primary-button">Назад кон играта <ArrowRight aria-hidden="true" /></button></DialogClose>
      </DialogContent>
    </Dialog>
  </div>;
}
