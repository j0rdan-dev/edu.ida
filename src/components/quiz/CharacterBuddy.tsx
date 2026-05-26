import CatBuddy from "./CatBuddy";
import BoyBuddy from "./BoyBuddy";
import GirlBuddy from "./GirlBuddy";
import PuppyBuddy from "./PuppyBuddy";
import TeacherBuddy from "./TeacherBuddy";
import { useCharacter } from "@/context/CharacterContext";

interface CharacterBuddyProps {
  celebrateKey: number;
  dissatisfiedKey: number;
  onActivate?: () => void;
}

const CharacterBuddy = ({ celebrateKey, dissatisfiedKey, onActivate }: CharacterBuddyProps) => {
  const { selectedCharacter } = useCharacter();

  if (selectedCharacter === "cat") {
    return <CatBuddy celebrateKey={celebrateKey} dissatisfiedKey={dissatisfiedKey} onActivate={onActivate} />;
  }

  if (selectedCharacter === "girl") {
    return <GirlBuddy celebrateKey={celebrateKey} dissatisfiedKey={dissatisfiedKey} onActivate={onActivate} />;
  }

  if (selectedCharacter === "boy") {
    return <BoyBuddy celebrateKey={celebrateKey} dissatisfiedKey={dissatisfiedKey} onActivate={onActivate} />;
  }

  if (selectedCharacter === "teacher") {
    return <TeacherBuddy celebrateKey={celebrateKey} dissatisfiedKey={dissatisfiedKey} onActivate={onActivate} />;
  }

  return <PuppyBuddy celebrateKey={celebrateKey} dissatisfiedKey={dissatisfiedKey} onActivate={onActivate} />;
};

export default CharacterBuddy;
