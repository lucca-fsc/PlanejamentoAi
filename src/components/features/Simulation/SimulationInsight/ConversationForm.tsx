import { SendHorizontal } from 'lucide-react'
import { type FormEvent, type KeyboardEvent, useState } from 'react'

import { Button } from '@/components/shared/Button'

interface ConversationFormProps {
  disabled?: boolean
  onSendMessage: (message: string) => void | Promise<void>
}

export function ConversationForm({
  disabled = false,
  onSendMessage,
}: ConversationFormProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    sendMessage()
  }

  const sendMessage = () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || disabled) {
      return
    }

    onSendMessage(trimmedMessage)
    setMessage('')
  }

  const handleTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return
    }

    event.preventDefault()
    sendMessage()
  }

  return (
    <form
      className="min-w-0 rounded-2xl bg-card p-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)]"
      onSubmit={handleSubmit}
    >
      <label
        htmlFor="chat-message"
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        Enviar mensagem
      </label>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <textarea
          id="chat-message"
          name="message"
          rows={3}
          value={message}
          disabled={disabled}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleTextareaKeyDown}
          placeholder={
            disabled
              ? 'Gerando resposta...'
              : 'Digite sua pergunta sobre a simulacao...'
          }
          className="min-h-12 w-full min-w-0 flex-1 resize-none rounded-2xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        />
        <Button
          type="submit"
          variant="primary"
          icon={SendHorizontal}
          iconPosition="right"
          disabled={disabled}
          className="min-h-6 whitespace-nowrap !p-3"
        >
        </Button>
      </div>
    </form>
  )
}
