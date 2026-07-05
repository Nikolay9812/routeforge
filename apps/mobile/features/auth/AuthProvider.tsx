import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserSchema } from "@insforge/sdk";
import {
  canUseMobileOperationalApp,
  getMobileAccessDeniedMessage,
  isPendingCourierProfile,
  type Profile,
} from "@routeforge/shared";
import { router, useSegments } from "expo-router";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { insforge } from "@/lib/insforge-client";

const refreshTokenStorageKey = "routeforge:auth:refresh-token";

type MobileAuthContextValue = {
  authError: string | null;
  clearAuthError: () => void;
  loading: boolean;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: (nextError?: string | null) => Promise<void>;
  user: UserSchema | null;
};

const MobileAuthContext = createContext<MobileAuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<UserSchema | null>(null);

  const signOut = useCallback(async (nextError: string | null = null) => {
    await insforge.auth.signOut();
    await AsyncStorage.removeItem(refreshTokenStorageKey);
    setUser(null);
    setProfile(null);
    setAuthError(nextError);
    setLoading(false);
  }, []);

  const loadSignedInProfile = useCallback(async (authUserId: string) => {
    const { data, error } = await insforge.database
      .from("profiles")
      .select(
        `
          id,
          auth_user_id,
          company_id,
          primary_depot_id,
          role,
          status,
          payment_mode,
          daily_fixed_minutes,
          hourly_max_minutes,
          preferred_language,
          full_name,
          email,
          phone,
          birth_date,
          address_line_1,
          postal_code,
          city,
          steuer_id,
          iban,
          id_card_document_url,
          driver_license_document_url,
          registration_document_url,
          bank_document_url,
          approved_at,
          approved_by,
          created_at,
          updated_at
        `,
      )
      .eq("auth_user_id", authUserId)
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Profile;
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      setLoading(true);

      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        setAuthError("Anmeldung fehlgeschlagen. Bitte pruefe deine Zugangsdaten.");
        return false;
      }

      if (data.refreshToken) {
        await AsyncStorage.setItem(refreshTokenStorageKey, data.refreshToken);
      }

      const nextProfile = await loadSignedInProfile(data.user.id);

      if (!nextProfile) {
        await signOut("Kein Kurierprofil fuer diesen Zugang gefunden.");
        return false;
      }

      if (
        !canUseMobileOperationalApp(nextProfile) &&
        !isPendingCourierProfile(nextProfile)
      ) {
        await signOut(getMobileAccessDeniedMessage(nextProfile));
        return false;
      }

      setUser(data.user);
      setProfile(nextProfile);
      setLoading(false);
      return true;
    },
    [loadSignedInProfile, signOut],
  );

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      const refreshToken = await AsyncStorage.getItem(refreshTokenStorageKey);

      if (!refreshToken) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      const { data, error } = await insforge.auth.refreshSession({ refreshToken });

      if (!isMounted) {
        return;
      }

      if (error || !data?.user) {
        await signOut();
        return;
      }

      if (data.refreshToken) {
        await AsyncStorage.setItem(refreshTokenStorageKey, data.refreshToken);
      }

      const nextProfile = await loadSignedInProfile(data.user.id);

      if (!nextProfile) {
        await signOut("Kein Kurierprofil fuer diesen Zugang gefunden.");
        return;
      }

      setUser(data.user);
      setProfile(nextProfile);
      setLoading(false);
    }

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [loadSignedInProfile, signOut]);

  const value = useMemo(
    () => ({
      authError,
      clearAuthError: () => setAuthError(null),
      loading,
      profile,
      signIn,
      signOut,
      user,
    }),
    [authError, loading, profile, signIn, signOut, user],
  );

  return (
    <MobileAuthContext.Provider value={value}>
      {children}
    </MobileAuthContext.Provider>
  );
}

export function AuthGate({ children }: AuthProviderProps) {
  const { loading, profile, signOut, user } = useMobileAuth();
  const segments = useSegments();
  const rootSegment = String(segments[0] ?? "");
  const isProtectedRoute =
    rootSegment === "(tabs)" ||
    rootSegment === "history" ||
    rootSegment === "mailbox" ||
    rootSegment === "settings";
  const isPendingApprovalRoute = rootSegment === "pending-approval";
  const isPublicAuthRoute =
    rootSegment === "" || rootSegment === "login" || rootSegment === "invite";

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      if (isProtectedRoute || isPendingApprovalRoute) {
        router.replace("/login");
      }
      return;
    }

    if (!profile) {
      if (isProtectedRoute) {
        router.replace("/login");
      }
      return;
    }

    if (isPendingCourierProfile(profile)) {
      if (!isPendingApprovalRoute) {
        router.replace("/pending-approval" as never);
      }
      return;
    }

    if (canUseMobileOperationalApp(profile)) {
      if (isPublicAuthRoute || isPendingApprovalRoute) {
        router.replace("/(tabs)/home");
      }
      return;
    }

    void signOut(getMobileAccessDeniedMessage(profile));
    router.replace("/login");
  }, [
    isPendingApprovalRoute,
    isProtectedRoute,
    isPublicAuthRoute,
    loading,
    profile,
    signOut,
    user,
  ]);

  return <>{children}</>;
}

export function useMobileAuth() {
  const context = useContext(MobileAuthContext);

  if (!context) {
    throw new Error("useMobileAuth must be used inside AuthProvider");
  }

  return context;
}
