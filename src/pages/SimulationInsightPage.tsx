import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { ConversationForm } from '@/components/features/Simulation/SimulationInsight/ConversationForm'
import { ConversationHistory } from '@/components/features/Simulation/SimulationInsight/ConversationHistory'
import { PageHero } from '@/components/shared/PageHero'
import type { ChatMessage } from '@/data/conversation'
import { useConversationStorage } from '@/hooks/useConversationStorage'
import { useSimulationStorage } from '@/hooks/useSimulationStorage'

export function SimulationInsightPage() {
  const { id } = useParams<{ id: string }>()
  const { getFormData } = useSimulationStorage()
  const { getMessagesBySimulationId, saveMessages } = useConversationStorage()
  const data = id ? getFormData(id) : null
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    id ? getMessagesBySimulationId(id) : [],
  )

  if (!data) {
    return <p>Simulacao nao encontrada!</p>
  }

  const handleSendMessage = (content: string) => {
    const newMessages = saveMessages([
      {
        simulationId: data.id,
        role: 'user',
        content,
      },
      {
        simulationId: data.id,
        role: 'assistant',
        content:
          'Recebi sua mensagem. Em breve esta resposta sera gerada pela IA considerando os dados da sua simulacao.',
      },
    ])

    setMessages((currentMessages) => [...currentMessages, ...newMessages])
  }

  return (
    <main className="mx-auto w-full max-w-7xl overflow-x-hidden px-2 py-2 sm:px-4 sm:py-14">
      {/* <PageHero
        title="Conversa sobre sua simulacao"
        subtitle={`Tire duvidas e explore caminhos para a meta: ${data.goalName}.`}
      /> */}
      <div className="flex min-w-0 flex-col gap-4">
        <ConversationHistory messages={messages} />
        <ConversationForm onSendMessage={handleSendMessage} />
      </div>
    </main>
  )
}
