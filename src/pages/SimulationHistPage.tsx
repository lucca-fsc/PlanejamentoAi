import { useEffect, useState } from 'react'

import { CardList } from '@/components/features/Simulation/SimulationHist/CardList'
import { PageHero } from '@/components/shared/PageHero'
import type { SimulationRecord } from '@/data/simulation'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

export function SimulationHistPage() {
  const { getAllFormData } = useSimulationStorage()
  const [simulations, setSimulations] = useState<SimulationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSimulations() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getAllFormData()
        setSimulations(data)
      } catch {
        setError('Nao foi possivel carregar o historico.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadSimulations()
  }, [getAllFormData])

  const handleDeletedSimulation = (id: string) => {
    setSimulations((currentSimulations) =>
      currentSimulations.filter((simulation) => simulation.id !== id),
    )
  }

  return (
    <main
      className="mx-auto max-w-6xl px-4 py-10 sm:py-14"
      data-simulation-count={simulations.length}
    >
      <PageHero
        title="Histórico de simulações"
        subtitle="Acompanhe o histórico de seus planos financeiros."
      />
      {isLoading && <p>Carregando historico...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex flex-col gap-4">
        {simulations.map((simulation) => (
          <CardList
            key={simulation.id}
            id={simulation.id}
            title={simulation.goalName}
            cost={simulation.goalAmount}
            createdAt={
              simulation.createdAt
                ? new Date(simulation.createdAt).toLocaleDateString('pt-BR')
                : '-'
            }
            goalAmount={simulation.income}
            goalDeadline={simulation.goalDeadline}
            onDeleted={handleDeletedSimulation}
          />
        ))}
      </div>
    </main>
  )
}
