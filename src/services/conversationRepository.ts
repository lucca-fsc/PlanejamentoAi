import type { ChatMessage, ChatMessageRole } from '@/data/conversation'
import type { ChatMessageRow } from '@/data/database'
import { supabase } from '@/lib/supabase'

export type NewChatMessage = {
  simulationId: string
  role: ChatMessageRole
  content: string
}

type NewChatMessageWithUser = NewChatMessage & {
  userId: string
}

function mapChatMessageRowToMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    simulationId: row.simulation_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  }
}

export async function listMessagesBySimulationId(
  simulationId: string,
  userId: string,
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('simulation_id', simulationId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .returns<ChatMessageRow[]>()

  if (error) {
    throw error
  }

  return data.map(mapChatMessageRowToMessage)
}

export async function createMessages(
  messages: NewChatMessageWithUser[],
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(
      messages.map((message) => ({
        user_id: message.userId,
        simulation_id: message.simulationId,
        role: message.role,
        content: message.content,
      })),
    )
    .select('*')
    .returns<ChatMessageRow[]>()

  if (error) {
    throw error
  }

  return data.map(mapChatMessageRowToMessage)
}
