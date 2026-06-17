interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[]
    }
  }[]
}

const API_KEY = String(import.meta.env.VITE_GEMINI_API_KEY)
const MODEL_NAME = 'gemini-2.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`

const callGeminiAPI = async (prompt: string) => {
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`)
  }

  return (await response.json()) as GeminiResponse
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: { content: string }
  suggestions: { items: string[] }
  extraIncome: { items: string[] }
  investment: { items: string[] }
  motivation: { content: string }
}

const extractJsonFromText = (text: string) => {
  const trimmedText = text.trim()
  const fencedJsonMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)

  if (fencedJsonMatch?.[1]) {
    return fencedJsonMatch[1].trim()
  }

  const firstBraceIndex = trimmedText.indexOf('{')
  const lastBraceIndex = trimmedText.lastIndexOf('}')

  if (firstBraceIndex >= 0 && lastBraceIndex > firstBraceIndex) {
    return trimmedText.slice(firstBraceIndex, lastBraceIndex + 1)
  }

  return trimmedText
}

export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI(prompt)
  const json = response.candidates[0].content.parts[0].text
  return JSON.parse(extractJsonFromText(json)) as InsightData
}

export const getConversationAnswer = async (prompt: string) => {
  const response = await callGeminiAPI(prompt)
  return response.candidates[0].content.parts[0].text
}
