import { useState } from "react";
import CharacterPickerDialog from "@/components/CharacterPickerDialog";
import CharacterBuddy from "@/components/quiz/CharacterBuddy";
import { useBuddy } from "@/context/BuddyContext";
import { useLocation } from "react-router-dom";
import { GAMES_PATH } from "@/data/educationalGames";

const GlobalCharacterBuddy = () => {
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const { celebrateKey, dissatisfiedKey } = useBuddy();
  const { pathname } = useLocation();

  // Games supply their own feedback; keep their maps and touch controls clear.
  if (`${pathname.replace(/\/+$/, "")}/`.startsWith(GAMES_PATH)) return null;

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
