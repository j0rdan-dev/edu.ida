import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCharacter } from "@/context/CharacterContext";
import { type CharacterId } from "@/context/CharacterContext";
import { cn } from "@/lib/utils";

interface CharacterPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const characterEmojis: Record<CharacterId, string> = {
  puppy: "🐶",
  cat: "🐱",
  girl: "👧",
  boy: "👦",
};

const CharacterPickerDialog = ({ open, onOpenChange }: CharacterPickerDialogProps) => {
  const { selectedCharacter, setSelectedCharacter, options } = useCharacter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Избери лик за поддршка</DialogTitle>
          <DialogDescription>
            Избери кој лик ќе те бодри кога ќе одговориш точно.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = selectedCharacter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedCharacter(option.id);
                  onOpenChange(false);
                }}
                className={cn(
                  "rounded-xl border-2 p-4 text-left transition-all duration-200",
                  "hover:border-primary/70 hover:bg-accent/40",
                  isSelected ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"
                )}
              >
                <div className="mb-2 text-2xl" aria-hidden="true">{characterEmojis[option.id]}</div>
                <p className="text-base font-semibold text-foreground">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterPickerDialog;
