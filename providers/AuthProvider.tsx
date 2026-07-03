import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { fetchProfile } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = async () => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const nextProfile = await fetchProfile(session.user.id);
      setProfile(nextProfile);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const sessionPromise = supabase.auth.getSession();
    const timeout = setTimeout(() => setLoading(false), 5000);

    sessionPromise
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      })
      .catch(() => setLoading(false))
      .finally(() => clearTimeout(timeout));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user.id) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    refreshProfile().catch(() => {
      setProfile(null);
      setProfileLoading(false);
    });
  }, [session?.user.id]);

  const value = useMemo(
    () => ({ session, profile, loading, profileLoading, refreshProfile }),
    [session, profile, loading, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
