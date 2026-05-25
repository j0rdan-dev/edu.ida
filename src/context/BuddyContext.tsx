import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface BuddyContextValue {
  celebrateKey: number;
  triggerCelebrate: () => void;
}

const BuddyContext = createContext<BuddyContextValue | undefined>(undefined);

export const BuddyProvider = ({ children }: { children: ReactNode }) => {
  const [celebrateKey, setCelebrateKey] = useState(0);

  const triggerCelebrate = useCallback(() => {
    setCelebrateKey((value) => value + 1);
  }, []);

  const value = useMemo(
    () => ({
      celebrateKey,
      triggerCelebrate,
    }),
    [celebrateKey, triggerCelebrate]
  );

  return <BuddyContext.Provider value={value}>{children}</BuddyContext.Provider>;
};

export const useBuddy = () => {
  const context = useContext(BuddyContext);

  if (!context) {
    throw new Error("useBuddy must be used within BuddyProvider");
  }

  return context;
};
