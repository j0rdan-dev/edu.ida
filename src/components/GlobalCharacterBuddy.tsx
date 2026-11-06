import { useState } from "react";
import CharacterPickerDialog from "@/components/CharacterPickerDialog";
import CharacterBuddy from "@/components/quiz/CharacterBuddy";
import { useBuddy } from "@/context/BuddyContext";
import { useLocation } from "react-router-dom";
import { EARTH_GAME_PATH } from "@/data/earthExpedition";

const GlobalCharacterBuddy = () => {
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const { celebrateKey, dissatisfiedKey } = useBuddy();
  const { pathname } = useLocation();

  // The expedition supplies its own feedback; keep its map and touch controls clear.
  if (pathname.replace(/\/+$/, "") === EARTH_GAME_PATH.replace(/\/+$/, "")) return null;

  return (
    <>
      <CharacterBuddy
        celebrateKey={celebrateKey}
        dissatisfiedKey={dissatisfiedKey}
        onActivate={() => setIsCharacterDialogOpen(true)}
      />
      <CharacterPickerDialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen} />
    </>
  );
};

export default GlobalCharacterBuddy;
