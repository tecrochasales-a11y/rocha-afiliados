import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  pix_key: string | null;
  avatar_url: string | null;
  tracking_code: string | null;
  pdv_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isGestor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata: { full_name: string; phone?: string; cpf?: string; pix_key?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGestor, setIsGestor] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (userId: string, userEmail?: string, userMeta?: Record<string, any>) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      // If no profile exists (e.g. OAuth user where trigger didn't fire), create one
      if (!data && userEmail) {
        const fullName = userMeta?.full_name || userMeta?.name || userEmail;
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: fullName,
            email: userEmail,
            tracking_code: null, // Will be set by RPC below
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating profile:", insertError);
          return null;
        }

        // Generate tracking code
        const { data: trackingCode } = await supabase.rpc("generate_tracking_code");
        if (trackingCode) {
          await supabase
            .from("profiles")
            .update({ tracking_code: trackingCode })
            .eq("id", userId);
          if (newProfile) {
            newProfile.tracking_code = trackingCode;
          }
        }

        // Assign default affiliate role
        await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "affiliate" });

        return newProfile;
      }

      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking admin role:", error);
      return false;
    }
  };

  const checkGestorRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "gestor")
        .maybeSingle();

      if (error) {
        console.error("Error checking gestor role:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking gestor role:", error);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      const adminStatus = await checkAdminRole(user.id);
      setIsAdmin(adminStatus);
      const gestorStatus = await checkGestorRole(user.id);
      setIsGestor(gestorStatus);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetching with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            const adminStatus = await checkAdminRole(session.user.id);
            setIsAdmin(adminStatus);
            const gestorStatus = await checkGestorRole(session.user.id);
            setIsGestor(gestorStatus);
            setIsLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsGestor(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          const adminStatus = await checkAdminRole(session.user.id);
          setIsAdmin(adminStatus);
          const gestorStatus = await checkGestorRole(session.user.id);
          setIsGestor(gestorStatus);
          setIsLoading(false);
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { full_name: string; phone?: string; cpf?: string; pix_key?: string }
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: metadata.full_name,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Update profile with additional data after signup
      // The trigger will create the profile, but we need to update it with phone, cpf, pix_key
      // This will be done after the auth state changes

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setIsGestor(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        isGestor,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
