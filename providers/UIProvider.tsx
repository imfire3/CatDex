import { createContext, useContext, useState, type ReactNode } from "react";

type UIContextValue = {
  avatar: string;
  username: string;
  onboardingComplete: boolean;
  setAvatar: (avatar: string) => void;
  setUsername: (username: string) => void;
  completeOnboarding: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [avatar, setAvatar] = useState("🧢");
  const [username, setUsername] = useState("");
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  return (
    <UIContext.Provider
      value={{
        avatar,
        username,
        onboardingComplete,
        setAvatar,
        setUsername,
        completeOnboarding: () => setOnboardingComplete(true),
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
