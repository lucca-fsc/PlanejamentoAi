import { useCallback, useState } from 'react'

import { buildAiConversationPrompt } from '@/data/aiConversationPrompt'
import type { ChatMessage } from '@/data/conversation'
import { useConversationStorage } from '@/hooks/useConversationStorage'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { getConversationAnswer } from '@/services/aiService'

export const useConversationAi = (simulationId: string) => {
  const { getMessagesBySimulationId, saveMessages } = useConversationStorage()
  const { getFormData } = useSimulationStorage()

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getMessagesBySimulationId(simulationId),
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      const simulation = getFormData(simulationId)

      if (!simulation) {
        setError('Simulacao nao encontrada.')
        return
      }

      setIsLoading(true)
      setError(null)

      const [userMessage] = saveMessages([
        {
          simulationId,
          role: 'user',
          content,
        },
      ])

      const messagesWithQuestion = [...messages, userMessage]
      setMessages(messagesWithQuestion)

      try {
        const prompt = buildAiConversationPrompt({
          messages: messagesWithQuestion,
          simulation,
        })
        const answer = await getConversationAnswer(prompt)
        const [assistantMessage] = saveMessages([
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
