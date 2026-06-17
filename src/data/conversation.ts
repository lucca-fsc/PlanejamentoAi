export type ChatMessageRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  simulationId: string
  role: ChatMessageRole
  content: string
  createdAt: string
}
