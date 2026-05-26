import { useState } from "react";
import CharacterPickerDialog from "@/components/CharacterPickerDialog";
import CharacterBuddy from "@/components/quiz/CharacterBuddy";
import { useBuddy } from "@/context/BuddyContext";

const GlobalCharacterBuddy = () => {
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const { celebrateKey, dissatisfiedKey } = useBuddy();

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
