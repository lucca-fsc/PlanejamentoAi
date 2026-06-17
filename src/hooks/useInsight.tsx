import { useCallback, useEffect, useRef, useState } from 'react'

import { buildAIPrompt } from '@/data/aiPrompt'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'
import { getInsight, type InsightData } from '@/services/aiService'

export const useInsight = (id: string) => {
  const isRequestPending = useRef(false)
  const { getFormData, updateSimulation } = useSimulationStorage()

  const [insight, setInsight] = useState<InsightData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsight = useCallback(
    async (simulationId: string) => {
      const simulation = await getFormData(simulationId)

      if (!simulation) {
        setError('Simulacao nao encontrada.')
        return
      }

      isRequestPending.current = true
      setIsLoading(true)
      setError(null)

      try {
        const prompt = buildAIPrompt(simulation)
        const data = await getInsight(prompt)
        setInsight(data)

        await updateSimulation(simulationId, {
          ...simulation,
          insight: data,
        } as SimulationRecord)
      } catch {
        setError('Erro ao gerar o diagnostico. Tente novamente.')
      } finally {
        isRequestPending.current = false
        setIsLoading(false)
      }
    },
    [getFormData, updateSimulation],
  )

  useEffect(() => {
    if (insight || isLoading || error || isRequestPending.current) {
      return
    }

    let isActive = true

    async function loadInsight() {
      try {
        const simulation = await getFormData(id)

        if (!isActive) {
          return
        }

        if (simulation?.insight) {
          setInsight(simulation.insight)
          return
        }

        await fetchInsight(id)
      } catch {
        if (isActive) {
          setError('Erro ao carregar o diagnostico. Tente novamente.')
        }
      }
    }

    void loadInsight()

    return () => {
      isActive = false
    }
  }, [error, fetchInsight, getFormData, id, insight, isLoading])

  return { insight, isLoading, error, fetchInsight }
}
