import { type SimulationFormData, type SimulationRecord } from '@/data/simulation'


const LOCAL_STORAGE_KEY = 'simulation-data'

export const useSimulationStorage = () => {
  const saveFormData = (formData: SimulationFormData) => {
    const id = crypto.randomUUID()
    const record: SimulationRecord = { ...formData, id }

    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage
      ? (JSON.parse(storage) as SimulationRecord[])
      : []

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...savedData, record]),
    )

    return id
  }


  const getFormData = (id: string): SimulationRecord | null => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!storage) {
      return null
    }

    const savedData = JSON.parse(storage) as SimulationRecord[]
    return savedData.find((record) => record.id === id) || null
  }

  const deleteFormData = (id: string): boolean => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)

    if (!storage) {
      return false
    }

    const savedData = JSON.parse(storage) as SimulationRecord[]
    const updatedData = savedData.filter((record) => record.id !== id)

    if (updatedData.length === savedData.length) {
      return false
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData))

    return true
  }

  const updateSimulation = (id: string, data: SimulationRecord) => {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY)
    const savedData = storage ? (JSON.parse(storage) as SimulationRecord[]) : []

    const updated = savedData.map((record) =>
      record.id === id ? { ...data } : record,
    )

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
  }


  return { saveFormData, getFormData, updateSimulation, deleteFormData }
}
