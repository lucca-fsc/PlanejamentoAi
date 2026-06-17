import type { ChatMessage } from '@/data/conversation'
import type { SimulationRecord } from '@/data/simulation'
import { parseCurrency } from '@/utils/currency'
import { calcMonthlySavings } from '@/utils/simulation'

export type BuildAiPromptContext = {
  messages: ChatMessage[]
  simulation?: SimulationRecord | null
  maxMessages?: number
}

const DEFAULT_MAX_MESSAGES = 8

const ROLE_LABEL: Record<ChatMessage['role'], string> = {
  user: 'Usuario',
  assistant: 'Educador financeiro',
}

const formatCurrencyValue = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

const buildSimulationContext = (simulation?: SimulationRecord | null) => {
  if (!simulation) {
    return 'Nenhum dado de simulacao foi informado. Responda apenas com base na conversa e, quando faltar contexto, peca uma informacao objetiva.'
  }

  const monthlySavings = calcMonthlySavings(simulation)
  const goalDeadlineInMonths = Number.parseInt(simulation.goalDeadline, 10)
  const monthlySavingsNeeded =
    goalDeadlineInMonths > 0
      ? parseCurrency(simulation.goalAmount) / goalDeadlineInMonths
      : 0

  return `Dados da simulacao do usuario:
- Renda mensal bruta: ${simulation.income}
- Custos fixos essenciais: ${simulation.expenses}
- Dividas e parcelas mensais: ${simulation.debts}
- Valor disponivel por mes: ${formatCurrencyValue(monthlySavings)}
- Meta: ${simulation.goalName}
- Custo da meta: ${simulation.goalAmount}
- Prazo desejado: ${simulation.goalDeadline} meses
- Economia mensal necessaria para atingir a meta no prazo: ${formatCurrencyValue(monthlySavingsNeeded)}
- Saldo apos reservar para a meta: ${formatCurrencyValue(monthlySavings - monthlySavingsNeeded)}`
}

const buildConversationContext = (
  messages: ChatMessage[],
  maxMessages = DEFAULT_MAX_MESSAGES,
) => {
  const recentMessages = messages.slice(-maxMessages)

  if (recentMessages.length === 0) {
    return 'A conversa ainda nao possui mensagens anteriores.'
  }

  return recentMessages
    .map((message) => `${ROLE_LABEL[message.role]}: ${message.content}`)
    .join('\n')
}

export function buildAiConversationPrompt({
  messages,
  simulation,
  maxMessages = DEFAULT_MAX_MESSAGES,
}: BuildAiPromptContext) {
  return `Voce e um educador financeiro especializado em financas pessoais para pessoas no Brasil. Converse com o usuario de forma clara, acolhedora e pratica, como alguem que ajuda a transformar numeros em proximos passos realistas.

${buildSimulationContext(simulation)}

Contexto recente da conversa:
${buildConversationContext(messages, maxMessages)}

Diretrizes para a resposta:
- Responda em portugues do Brasil.
- Fale diretamente com o usuario em segunda pessoa.
- Seja didatico, objetivo e encorajador, sem infantilizar.
- Use os dados da simulacao quando eles ajudarem a resposta.
- Se a pergunta envolver uma decisao financeira, explique o raciocinio e proponha um proximo passo concreto.
- Se faltar alguma informacao importante, faca no maximo uma pergunta objetiva antes de orientar.
- Evite prometer resultados, ganhos garantidos ou recomendar produtos especificos como se fossem adequados para todos.
- Nao use markdown pesado; prefira paragrafos curtos e, quando fizer sentido, listas simples.
- Mantenha a resposta curta o suficiente para uma conversa de chat.`
}
