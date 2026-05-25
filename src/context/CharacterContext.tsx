import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CharacterId = "puppy" | "cat" | "girl" | "boy";

interface CharacterOption {
  id: CharacterId;
  label: string;
  description: string;
}

interface CharacterContextValue {
  selectedCharacter: CharacterId;
  setSelectedCharacter: (id: CharacterId) => void;
  options: CharacterOption[];
}

const CHARACTER_STORAGE_KEY = "edu.ida.selected-character";

const characterOptions: CharacterOption[] = [
  { id: "puppy", label: "Кутре", description: "Весело и разиграно" },
  { id: "cat", label: "Маче", description: "Слатко и љубопитно" },
  { id: "girl", label: "Девојче", description: "Нежно и охрабрувачко" },
  { id: "boy", label: "Момче", description: "Пријателско и бодро" },
];

const CharacterContext = createContext<CharacterContextValue | undefined>(undefined);

function isCharacterId(value: string): value is CharacterId {
  return value === "puppy" || value === "cat" || value === "girl" || value === "boy";
}

export const CharacterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>(() => {
    if (typeof window === "undefined") return "puppy";

    const stored = window.localStorage.getItem(CHARACTER_STORAGE_KEY);
    if (stored && isCharacterId(stored)) {
      return stored;
    }
    return "puppy";
  });

  useEffect(() => {
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, selectedCharacter);
  }, [selectedCharacter]);

  const value = useMemo<CharacterContextValue>(
    () => ({
      selectedCharacter,
      setSelectedCharacter,
      options: characterOptions,
    }),
    [selectedCharacter]
  );

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};

export function useCharacter() {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error("useCharacter must be used within CharacterProvider");
  }

  return context;
}
