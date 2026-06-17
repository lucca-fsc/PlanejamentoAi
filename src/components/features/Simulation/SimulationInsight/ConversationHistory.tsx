import { ArrowDown, Bot, UserRound } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { MarkdownContent } from '@/components/shared/MarkdownContent'
import type { ChatMessage } from '@/data/conversation'

const previewMessages: ChatMessage[] = [
  {
    id: 'welcome',
    simulationId: 'preview',
    role: 'assistant',
    content:
      'Ola! Posso te ajudar a entender melhor sua simulacao e pensar em ajustes para chegar mais perto da sua meta.',
    createdAt: 'preview',
  },
  {
    id: 'question',
    simulationId: 'preview',
    role: 'user',
    content:
      'Quais seriam os primeiros passos para melhorar meu planejamento?',
    createdAt: 'preview',
  },
  {
    id: 'answer',
    simulationId: 'preview',
    role: 'assistant',
    content:
      'Comece revisando os gastos fixos, confirme se o prazo da meta e realista e separe uma economia mensal minima para acompanhar sua evolucao.',
    createdAt: 'preview',
  },
]

interface ConversationHistoryProps {
  messages?: ChatMessage[]
}

export function ConversationHistory({
  messages = [],
}: ConversationHistoryProps) {
  const visibleMessages = messages.length > 0 ? messages : previewMessages
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const updateIsAtBottom = useCallback(() => {
    const messagesContainer = messagesContainerRef.current

    if (!messagesContainer) {
      return
    }

    const distanceFromBottom =
      messagesContainer.scrollHeight -
      messagesContainer.scrollTop -
      messagesContainer.clientHeight

    setIsAtBottom(distanceFromBottom < 8)
  }, [])

  const scrollToBottom = useCallback(() => {
    const messagesContainer = messagesContainerRef.current

    if (!messagesContainer) {
      return
    }

    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth',
    })

    setIsAtBottom(true)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  return (
    <section className="flex h-[min(100vh,550px)] min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl bg-card p-5 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.2)]">
      <div className="mb-3 shrink-0">
        <p className="text-lg font-semibold text-foreground">
          Conversa com a IA
        </p>
        <p className="text-sm text-muted-foreground">
          Historico da conversa sobre esta simulacao.
        </p>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={messagesContainerRef}
          className="scrollbar-theme flex h-full flex-col gap-2 overflow-y-auto overflow-x-hidden pr-2 pb-12"
          onScroll={updateIsAtBottom}
        >
          {visibleMessages.map((message) => {
            const isUser = message.role === 'user'
            const Icon = isUser ? UserRound : Bot

            return (
              <article
                key={message.id}
                className={[
                  'flex min-w-0 gap-3',
                  isUser ? 'justify-end' : 'justify-start',
                ].join(' ')}
              >
                {!isUser && (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-list-bg-icon text-primary">
                    <Icon size={18} />
                  </div>
                )}

                <div
                  className={[
                    'max-w-[min(82%,620px)] overflow-hidden break-words rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary-button text-foreground',
                  ].join(' ')}
                >
                  <MarkdownContent content={message.content} />
                </div>

                {isUser && (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon size={18} />
                  </div>
                )}
              </article>
            )
          })}
        </div>
        {!isAtBottom && (
          <button
            type="button"
            aria-label="Ir para o final da conversa"
            className="absolute bottom-2 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-card/70 text-foreground/70 shadow-[4px_4px_18px_0px_rgba(0,0,0,0.16)] opacity-45 backdrop-blur-sm transition-opacity hover:opacity-80 cursor-pointer"
            onClick={scrollToBottom}
          >
            <ArrowDown size={18} />
          </button>
        )}
      </div>
    </section>
  )
}
