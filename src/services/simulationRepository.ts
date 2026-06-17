import type { SimulationRow } from '@/data/database'
import type { SimulationFormData, SimulationRecord } from '@/data/simulation'
import { supabase } from '@/lib/supabase'

function mapSimulationRowToRecord(row: SimulationRow): SimulationRecord {
  return {
    id: row.id,
    income: row.income,
    expenses: row.expenses,
    debts: row.debts,
    goalName: row.goal_name,
    goalAmount: row.goal_amount,
    goalDeadline: row.goal_deadline,
    insight: row.insight ?? undefined,
    createdAt: row.created_at,
  }
}

function mapSimulationRecordToRow(data: SimulationRecord) {
  return {
    income: data.income,
    expenses: data.expenses,
    debts: data.debts,
    goal_name: data.goalName,
    goal_amount: data.goalAmount,
    goal_deadline: data.goalDeadline,
    insight: data.insight ?? null,
    updated_at: new Date().toISOString(),
  }
}

export async function createSimulation(
  formData: SimulationFormData,
  userId: string,
): Promise<SimulationRecord> {
  const { data, error } = await supabase
    .from('simulations')
    .insert({
      user_id: userId,
      income: formData.income,
      expenses: formData.expenses,
      debts: formData.debts,
      goal_name: formData.goalName,
      goal_amount: formData.goalAmount,
      goal_deadline: formData.goalDeadline,
    })
    .select('*')
    .single<SimulationRow>()

  if (error) {
    throw error
  }

  return mapSimulationRowToRecord(data)
}

export async function getSimulationById(
  id: string,
  userId: string,
): Promise<SimulationRecord | null> {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle<SimulationRow>()

  if (error) {
    throw error
  }

  return data ? mapSimulationRowToRecord(data) : null
}

export async function listSimulations(
  userId: string,
): Promise<SimulationRecord[]> {
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<SimulationRow[]>()

  if (error) {
    throw error
  }

  return data.map(mapSimulationRowToRecord)
}

export async function updateSimulation(
  id: string,
  data: SimulationRecord,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('simulations')
    .update(mapSimulationRecordToRow(data))
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}

export async function deleteSimulation(
  id: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('simulations')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
