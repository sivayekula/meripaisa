import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from './api';

export interface User { id: string; name: string; email?: string; phone?: string; currency: string; }
interface Ctx { user: User | null; loading: boolean; login(identifier: string, password: string): Promise<void>;
  signup(d: { name: string; email?: string; phone?: string; password: string }): Promise<void>;
  logout(): Promise<void>; setUser(u: User): void; }
const AuthCtx = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { if (await tokenStore.load()) setUser((await api.get('/users/me')).data); }
      catch { await tokenStore.clear(); }
      finally { setLoading(false); }
    })();
  }, []);

  const finish = async (r: { token: string; user: User }) => { await tokenStore.set(r.token); setUser(r.user); };
  return (
    <AuthCtx.Provider value={{
      user, loading, setUser,
      login: async (identifier, password) => finish((await api.post('/auth/login', { identifier, password })).data),
      signup: async (d) => finish((await api.post('/auth/signup', d)).data),
      logout: async () => { await tokenStore.clear(); setUser(null); },
    }}>{children}</AuthCtx.Provider>
  );
}
