import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface CloudUserData {
  settings?: any;
  results?: any[];
  lessons?: any;
  achievements?: string[];
  streak?: any;
}

export const authService = {
  isConfigured: isSupabaseConfigured,

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account?reset=true`,
    });
    if (error) throw error;
    return data;
  },

  async syncToCloud(userId: string, data: CloudUserData): Promise<boolean> {
    if (!supabase || !userId) return false;
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          settings: data.settings,
          results: data.results,
          lessons: data.lessons,
          achievements: data.achievements,
          streak: data.streak,
          updated_at: new Date().toISOString(),
        });
      return !error;
    } catch (e) {
      console.warn('Sync to cloud error:', e);
      return false;
    }
  },

  async pullFromCloud(userId: string): Promise<CloudUserData | null> {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) return null;
      return {
        settings: data.settings,
        results: data.results,
        lessons: data.lessons,
        achievements: data.achievements,
        streak: data.streak,
      };
    } catch {
      return null;
    }
  },
};
