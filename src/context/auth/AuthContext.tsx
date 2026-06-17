import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ hasActiveSession: boolean }>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)
