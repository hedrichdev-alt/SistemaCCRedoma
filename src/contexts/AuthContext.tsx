import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

// Define a more specific type for the user profile
type Role = Database['public']['Tables']['roles']['Row'];
type UserProfile = Database['public']['Tables']['usuarios']['Row'] & {
  roles: Pick<Role, 'nombre_rol'> | null;
};

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, roleName: string, datosPersonales: Record<string, string>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const loadUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles(nombre_rol)')
      .eq('id', userId)
      .single(); // Use .single() to enforce that exactly one row is returned

    if (error || !data) {
      console.error('Error loading user profile:', error?.message);
      await signOut(); // Sign out if profile is missing or there's an error
      return null;
    }
    
    // The type from `database.types.ts` should handle this structure
    // if the foreign key relationship is named 'roles'.
    // If the relationship was auto-detected, it might be named 'roles_rol_id_fkey'.
    // Let's assume the relationship is correctly named 'roles'.
    const userProfile = data as UserProfile;
    setProfile(userProfile);
    return userProfile;
  }, [signOut]);

  const handleSession = useCallback(async (session: Session | null) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    if (currentUser) {
      await loadUserProfile(currentUser.id);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [loadUserProfile]);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSession]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, roleName: string, datosPersonales: Record<string, string>) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup.');

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre_rol', roleName)
      .single();

    if (roleError || !roleData) {
      // Attempt to clean up the created auth user is complex without admin rights.
      // Instead, we throw a very specific error.
      throw new Error(`Role '${roleName}' not found. User was created but not assigned a role. Please contact an administrator.`);
    }

    const { error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        rol_id: roleData.id,
        datos_personales: datosPersonales,
        estado: 'activo',
      });

    if (profileError) {
      // Similar to the role error, we can't easily clean up the auth user.
      throw new Error(`Failed to create user profile: ${profileError.message}. User was created but not fully configured. Please contact an administrator.`);
    }
    
    // Manually trigger session handling to load profile immediately after signup
    await handleSession(authData.session);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
