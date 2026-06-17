import type { ChatMessageRole } from '@/data/conversation'
import type { InsightData } from '@/services/aiService'

export type SimulationRow = {
  id: string
  user_id: string
  income: string
  expenses: string
  debts: string
  goal_name: string
  goal_amount: string
  goal_deadline: string
  insight: InsightData | null
  created_at: string
  updated_at: string | null
}

export type ChatMessageRow = {
  id: string
  user_id: string
  simulation_id: string
  role: ChatMessageRole
  content: string
  created_at: string
}
