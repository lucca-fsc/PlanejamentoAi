import { useCallback } from 'react'

import { type SimulationFormData, type SimulationRecord } from '@/data/simulation'
import { useAuth } from '@/hooks/useAuth'
import {
  createSimulation,
  deleteSimulation,
  getSimulationById,
  listSimulations,
  updateSimulation as updateSimulationRecord,
} from '@/services/simulationRepository'

export const useSimulationStorage = () => {
  const { user } = useAuth()

  const getUserId = useCallback(() => {
    if (!user) {
      throw new Error('Usuario nao autenticado.')
    }

    return user.id
  }, [user])

  const saveFormData = useCallback(async (formData: SimulationFormData) => {
    const simulation = await createSimulation(formData, getUserId())
    return simulation.id
  }, [getUserId])

  const getFormData = useCallback((id: string) => {
    return getSimulationById(id, getUserId())
  }, [getUserId])

  const getAllFormData = useCallback(() => {
    return listSimulations(getUserId())
  }, [getUserId])

  const deleteFormData = useCallback(async (id: string): Promise<boolean> => {
    await deleteSimulation(id, getUserId())
    return true
  }, [getUserId])

  const updateSimulation = useCallback(
    (id: string, data: SimulationRecord) => {
      return updateSimulationRecord(id, data, getUserId())
    },
    [getUserId],
  )

  return {
    saveFormData,
    getFormData,
    getAllFormData,
    updateSimulation,
    deleteFormData,
  }
}
