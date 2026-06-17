import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ConversationForm } from '@/components/features/Simulation/SimulationInsight/ConversationForm'
import { ConversationHistory } from '@/components/features/Simulation/SimulationInsight/ConversationHistory'
import type { SimulationRecord } from '@/data/simulation'
import { useConversationAi } from '@/hooks/useConversationAi'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

export function SimulationInsightPage() {
  const { id } = useParams<{ id: string }>()
  const { getFormData } = useSimulationStorage()
  const [data, setData] = useState<SimulationRecord | null>(null)
  const [isSimulationLoading, setIsSimulationLoading] = useState(true)
  const [simulationError, setSimulationError] = useState<string | null>(null)
  const { messages, isLoading, error, sendMessage } = useConversationAi(id ?? '')

  useEffect(() => {
    async function loadSimulation() {
      if (!id) {
        setIsSimulationLoading(false)
        return
      }

      try {
        setIsSimulationLoading(true)
        setSimulationError(null)
        const simulation = await getFormData(id)
        setData(simulation)
      } catch {
        setSimulationError('Nao foi possivel carregar a simulacao.')
      } finally {
        setIsSimulationLoading(false)
      }
    }

    void loadSimulation()
  }, [getFormData, id])

  if (isSimulationLoading) {
    return <p>Carregando simulacao...</p>
  }

  if (simulationError) {
    return <p>{simulationError}</p>
  }

  if (!data) {
    return <p>Simulacao nao encontrada!</p>
  }

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-2 py-2 sm:px-4 sm:py-14">
      {/* <PageHero
        title="Conversa sobre sua simulacao"
        subtitle={`Tire duvidas e explore caminhos para a meta: ${data.goalName}.`}
      /> */}
      <div className="flex min-w-0 flex-col gap-4">
        <ConversationHistory messages={messages} />
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Gerando resposta...
          </p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <ConversationForm
          disabled={isLoading}
          onSendMessage={sendMessage}
        />
      </div>
    </main>
  )
}
