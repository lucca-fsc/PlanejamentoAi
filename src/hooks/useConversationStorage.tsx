import { useCallback } from 'react'

import { useAuth } from '@/hooks/useAuth'
import {
  createMessages,
  listMessagesBySimulationId,
  type NewChatMessage,
} from '@/services/conversationRepository'

export const useConversationStorage = () => {
  const { user } = useAuth()

  const getUserId = useCallback(() => {
    if (!user) {
      throw new Error('Usuario nao autenticado.')
    }

    return user.id
  }, [user])

  const getMessagesBySimulationId = useCallback((simulationId: string) => {
    return listMessagesBySimulationId(simulationId, getUserId())
  }, [getUserId])

  const saveMessages = useCallback((messages: NewChatMessage[]) => {
    const userId = getUserId()

    return createMessages(
      messages.map((message) => ({
        ...message,
        userId,
      })),
    )
  }, [getUserId])

  return { getMessagesBySimulationId, saveMessages }
}
