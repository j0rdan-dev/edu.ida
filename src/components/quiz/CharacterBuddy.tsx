import CatBuddy from "./CatBuddy";
import BoyBuddy from "./BoyBuddy";
import GirlBuddy from "./GirlBuddy";
import PuppyBuddy from "./PuppyBuddy";
import TeacherBuddy from "./TeacherBuddy";
import { useCharacter } from "@/context/CharacterContext";

interface CharacterBuddyProps {
  celebrateKey: number;
  onActivate?: () => void;
}

const CharacterBuddy = ({ celebrateKey, onActivate }: CharacterBuddyProps) => {
  const { selectedCharacter } = useCharacter();

  if (selectedCharacter === "cat") {
    return <CatBuddy celebrateKey={celebrateKey} onActivate={onActivate} />;
  }

  if (selectedCharacter === "girl") {
    return <GirlBuddy celebrateKey={celebrateKey} onActivate={onActivate} />;
  }

  if (selectedCharacter === "boy") {
    return <BoyBuddy celebrateKey={celebrateKey} onActivate={onActivate} />;
  }

  if (selectedCharacter === "teacher") {
    return <TeacherBuddy celebrateKey={celebrateKey} onActivate={onActivate} />;
  }

  return <PuppyBuddy celebrateKey={celebrateKey} onActivate={onActivate} />;
};

export default CharacterBuddy;
