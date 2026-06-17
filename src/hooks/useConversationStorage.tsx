import type { ChatMessage, ChatMessageRole } from '@/data/conversation'

const LOCAL_STORAGE_KEY = 'simulation-chat-messages'

type NewChatMessage = {
  simulationId: string
  role: ChatMessageRole
  content: string
}

export const useConversationStorage = () => {
  const getAllMessages = (): ChatMessage[] => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!storage) {
      return []
    }

    const savedData = JSON.parse(storage) as ChatMessage[]

    return Array.isArray(savedData) ? savedData : []
  }

  const getMessagesBySimulationId = (simulationId: string): ChatMessage[] => {
    return getAllMessages().filter(
      (message) => message.simulationId === simulationId,
    )
  }

  const saveMessages = (messages: NewChatMessage[]): ChatMessage[] => {
    const savedData = getAllMessages()
    const createdAt = new Date().toISOString()
    const records = messages.map((message) => ({
      ...message,
      id: crypto.randomUUID(),
      createdAt,
    }))

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...savedData, ...records]),
    )

    return records
  }

  return { getMessagesBySimulationId, saveMessages }
}
