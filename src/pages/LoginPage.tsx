import { ArrowRight, LockKeyhole, Mail, Wallet } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { useAuth } from '@/hooks/useAuth'

type LoginLocationState = {
  from?: {
    pathname: string
    search?: string
  }
}

type AuthMode = 'login' | 'signup'

function validatePassword(password: string) {
  if (password.length < 4) {
    return 'A senha deve ter ao menos 4 caracteres.'
  }

  if (!/\d/.test(password)) {
    return 'A senha deve ter ao menos um numero.'
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'A senha deve ter ao menos um caractere especial.'
  }

  return null
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Digite um e-mail valido.'
  }

  return null
}

function getAuthErrorMessage(error: unknown, authMode: AuthMode) {
  const message = error instanceof Error ? error.message : ''

  if (message === 'Invalid Email') {
    return 'Digite um e-mail valido.'
  }

  if (authMode === 'login') {
    return 'E-mail ou senha invalidos.'
  }

  return 'Nao foi possivel criar sua conta. Verifique os dados e tente novamente.'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading, login, loginWithGoogle, signUp } =
    useAuth()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const fromLocation = (location.state as LoginLocationState | null)?.from
  const redirectPath = fromLocation
    ? `${fromLocation.pathname}${fromLocation.search ?? ''}`
    : '/'

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    const normalizedEmail = email.trim()
    const emailValidationError = validateEmail(normalizedEmail)

    if (emailValidationError) {
      setEmailError(emailValidationError)
      return
    }

    const validationError = validatePassword(password)

    if (validationError) {
      setPasswordError(validationError)
      return
    }

    setIsSubmitting(true)

    const authAction =
      authMode === 'login'
        ? login(normalizedEmail, password).then(() => ({
          hasActiveSession: true,
        }))
        : signUp(normalizedEmail, password)

    authAction
      .then(({ hasActiveSession }) => {
        if (hasActiveSession) {
          void navigate(redirectPath, { replace: true })
          return
        }

        setFormSuccess('Conta criada. Confira seu e-mail para confirmar o cadastro.')
      })
      .catch((error: unknown) => {
        setFormError(getAuthErrorMessage(error, authMode))
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleAuthModeChange = (mode: AuthMode) => {
    setAuthMode(mode)
    setEmailError(null)
    setPasswordError(null)
    setFormError(null)
    setFormSuccess(null)
  }

  const handleGoogleLogin = () => {
    setFormError(null)
    setFormSuccess(null)
    setIsGoogleSubmitting(true)

    loginWithGoogle().catch(() => {
      setIsGoogleSubmitting(false)
      setFormError('Nao foi possivel iniciar o login com Google.')
    })
  }

  if (isLoading) {
    return (
      <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <p className="text-sm text-muted-foreground">Verificando sessao...</p>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_440px] lg:py-14">
      <section className="max-w-2xl">
        <div className="bg-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl">
          <Wallet size={28} className="text-primary-foreground" />
        </div>
        <h1 className="text-foreground text-3xl font-semibold sm:text-5xl">
          Modernizando a sua vida financeira
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-sm leading-6 sm:text-base">
          Utilizamos Inteligência Artificial para criar insights e planos estratégicos exclusivos para os seus objetivos!
        </p>
      </section>

      <section className="bg-card border-border rounded-2xl border p-5 shadow-[0_18px_60px_rgba(15,23,41,0.12)] sm:p-8">
        <div className="mb-8">
          <p className="text-muted-foreground text-sm font-medium">Planej.ai</p>
          <h2 className="text-foreground mt-1 text-2xl font-semibold">
            {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
          </h2>
        </div>

        <div className="bg-secondary-button mb-6 grid grid-cols-2 gap-1 rounded-xl p-1">
          <Button
            type="button"
            variant={authMode === 'login' ? 'primary' : 'ghost'}
            onClick={() => handleAuthModeChange('login')}
          >
            Entrar
          </Button>
          <Button
            type="button"
            variant={authMode === 'signup' ? 'primary' : 'ghost'}
            onClick={() => handleAuthModeChange('signup')}
          >
            Criar conta
          </Button>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="mb-6 w-full"
          disabled={isSubmitting || isGoogleSubmitting}
          onClick={handleGoogleLogin}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-bold text-foreground">
            G
          </span>
          {isGoogleSubmitting ? 'Conectando...' : 'Continuar com Google'}
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs font-medium">ou</span>
          <div className="bg-border h-px flex-1" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <Mail size={16} />
              E-mail
            </span>
            <Input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailError(null)
              }}
              placeholder="voce@email.com"
              autoComplete="email"
              autoFocus
              required
            />
            {emailError && (
              <span className="text-sm text-red-500">{emailError}</span>
            )}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
              <LockKeyhole size={16} />
              Senha
            </span>
            <Input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setPasswordError(null)
              }}
              placeholder="Digite sua senha"
              autoComplete={
                authMode === 'login' ? 'current-password' : 'new-password'
              }
              required
            />
            {passwordError && (
              <span className="text-sm text-red-500">{passwordError}</span>
            )}
          </label>

          {formError && <p className="text-sm text-red-500">{formError}</p>}
          {formSuccess && (
            <p className="text-sm text-muted-foreground">{formSuccess}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
            className="mt-2 w-full"
            disabled={isSubmitting || isGoogleSubmitting}
          >
            {isSubmitting
              ? authMode === 'login'
                ? 'Entrando...'
                : 'Criando conta...'
              : authMode === 'login'
                ? 'Entrar'
                : 'Criar conta'}
          </Button>
        </form>
      </section>
    </main>
  )
}
