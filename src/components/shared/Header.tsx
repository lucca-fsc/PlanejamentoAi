import {
  ChevronDown,
  Clock,
  LogOut,
  Moon,
  Sun,
  TrendingUp,
  UserRound,
  Wallet,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

import { Button } from './Button'

export function Header() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
    await logout()
    void navigate('/login', { replace: true })
  }

  const handleNavigateToHistory = () => {
    setIsUserMenuOpen(false)
    void navigate('/historico')
  }

  const handleToggleTheme = () => {
    toggleTheme()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="border-b border-(--border) px-6 py-3">
      <nav className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <Wallet size={20} className="text-primary-foreground" />
          </div>
          <span className="text-lg">
            <span className="text-muted-foreground font-medium">Planej</span>
            <span className="font-extrabold">.ai</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={TrendingUp}
            className="!py-2"
            onClick={() => void navigate('/')}
          >
            <span className="hidden sm:inline">Nova Simulacao</span>
          </Button>

          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              className="border-border bg-card flex h-10 items-center gap-2 rounded-full border px-2.5 text-sm transition-opacity hover:opacity-80 sm:px-3"
              aria-expanded={isUserMenuOpen}
              aria-haspopup="menu"
              onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
            >
              <span className="bg-muted-primary flex h-7 w-7 items-center justify-center rounded-full">
                <UserRound size={17} className="text-primary" />
              </span>
              <span className="text-muted-foreground hidden max-w-36 truncate md:inline">
                {user?.email ?? 'Usuario'}
              </span>
              <ChevronDown
                size={16}
                className={[
                  'text-muted-foreground transition-transform',
                  isUserMenuOpen ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            {isUserMenuOpen && (
              <div
                role="menu"
                className="border-border bg-card absolute right-0 z-20 mt-2 w-72 rounded-2xl border p-2 shadow-[0_18px_60px_rgba(15,23,41,0.16)]"
              >
                <div className="border-border mb-2 border-b px-3 py-3">
                  <p className="text-muted-foreground text-xs font-medium">
                    Conta conectada
                  </p>
                  <p className="text-foreground mt-1 truncate text-sm font-semibold">
                    {user?.email ?? 'Usuario'}
                  </p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  className="hover:bg-secondary-button flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors cursor-pointer"
                  onClick={handleNavigateToHistory}
                >
                  <Clock size={18} className="text-muted-foreground" />
                  <span>Historico</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="hover:bg-secondary-button flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors cursor-pointer"
                  onClick={handleToggleTheme}
                >
                  {theme === 'light' ? (
                    <Moon size={18} className="text-muted-foreground" />
                  ) : (
                    <Sun size={18} className="text-muted-foreground" />
                  )}
                  <span>Alterar tema</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className="hover:bg-secondary-button flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-500 transition-colors cursor-pointer"
                  onClick={() => void handleLogout()}
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
