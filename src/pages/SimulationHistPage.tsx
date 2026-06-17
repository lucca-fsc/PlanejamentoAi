import { useState } from 'react'

import { CardList } from '@/components/features/Simulation/SimulationHist/CardList'
import { PageHero } from '@/components/shared/PageHero'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

type StorageRecordWithId = {
  id?: unknown
}

function getUniqueIdsFromStorageKey(storageKey: string): string[] {
  const storage = localStorage.getItem(storageKey)

  if (!storage) {
    return []
  }

  try {
    const records = JSON.parse(storage) as unknown

    if (!Array.isArray(records)) {
      return []
    }

    const ids = records
      .map((record: StorageRecordWithId) => record.id)
      .filter((id): id is string => typeof id === 'string')

    return [...new Set(ids)]
  } catch {
    return []
  }
}

export function SimulationHistPage() {
  const { getFormData } = useSimulationStorage()
  const [simulationIds, setSimulationIds] = useState(() =>
    getUniqueIdsFromStorageKey('simulation-data'),
  )
  const currentDate = new Date().toLocaleDateString('pt-BR')
  const simulations = simulationIds
    .map((id) => getFormData(id))
    .filter((simulation) => simulation !== null)

  const handleDeletedSimulation = (id: string) => {
    setSimulationIds((currentIds) =>
      currentIds.filter((simulationId) => simulationId !== id),
    )
  }

  return (
    <main
      className="mx-auto max-w-6xl px-4 py-10 sm:py-14"
      data-simulation-count={simulationIds.length}
    >
      <PageHero
        title="Histórico de simulações"
        subtitle="Acompanhe o histórico de seus planos financeiros."
      />
      <div className="flex flex-col gap-4">
        {simulations.map((simulation) => (
          <CardList
            key={simulation.id}
            id={simulation.id}
            title={simulation.goalName}
            cost={simulation.goalAmount}
            createdAt={currentDate}
            goalAmount={simulation.income}
            goalDeadline={simulation.goalDeadline}
            onDeleted={handleDeletedSimulation}
          />
        ))}
      </div>
    </main>
  )
}
