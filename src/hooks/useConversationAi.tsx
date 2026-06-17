import { useCallback, useEffect, useState } from 'react'

import { buildAiConversationPrompt } from '@/data/aiConversationPrompt'
import type { ChatMessage } from '@/data/conversation'
import { useConversationStorage } from '@/hooks/useConversationStorage'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { getConversationAnswer } from '@/services/aiService'

export const useConversationAi = (simulationId: string) => {
  const { getMessagesBySimulationId, saveMessages } = useConversationStorage()
  const { getFormData } = useSimulationStorage()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!simulationId) {
      return
    }

    let isActive = true

    async function loadMessages() {
      try {
        setError(null)
        const savedMessages = await getMessagesBySimulationId(simulationId)

        if (isActive) {
          setMessages(savedMessages)
        }
      } catch {
        if (isActive) {
          setError('Erro ao carregar as mensagens.')
        }
      }
    }

    void loadMessages()

    return () => {
      isActive = false
    }
  }, [getMessagesBySimulationId, simulationId])

  const sendMessage = useCallback(
    async (content: string) => {
      const simulation = await getFormData(simulationId)

      if (!simulation) {
        setError('Simulacao nao encontrada.')
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const [userMessage] = await saveMessages([
          {
            simulationId,
            role: 'user',
            content,
          },
        ])

        const messagesWithQuestion = [...messages, userMessage]
        setMessages(messagesWithQuestion)

        const prompt = buildAiConversationPrompt({
          messages: messagesWithQuestion,
          simulation,
        })
        const answer = await getConversationAnswer(prompt)
        const [assistantMessage] = await saveMessages([
          {
            simulationId,
            role: 'assistant',
            content: answer,
          },
        ])

        setMessages((currentMessages) => [
          ...currentMessages,
          assistantMessage,
        ])
      } catch {
        setError('Erro ao gerar a resposta. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    },
    [getFormData, messages, saveMessages, simulationId],
  )

  return { messages, isLoading, error, sendMessage }
}
