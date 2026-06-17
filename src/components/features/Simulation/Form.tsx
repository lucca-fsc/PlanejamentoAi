import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { type SimulationFormData,simulationFormSteps } from "@/data/simulation"
import { useSimulationStorage } from "@/hooks/useSimulationStorage"

import { FormStep } from "./FormStep"
import { StepProgress } from "./Progress"

export const SimulationForm = () => {
  const { saveFormData } = useSimulationStorage()
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<SimulationFormData>(
    {} as SimulationFormData)
  const totalSteps = simulationFormSteps.length;
  const currentStep = simulationFormSteps[currentStepIndex];

  const handleNextStep = async (value: string) => {

    const updatedFormData = { ...formData, [currentStep.id]: value }

    setFormData(updatedFormData);
    setError(null)

    if (currentStepIndex + 1 > totalSteps - 1) {
      try {
        setIsSaving(true)
        const id = await saveFormData(updatedFormData);
        void navigate(`/resultado/${id}`);
      } catch {
        setError('Nao foi possivel salvar a simulacao. Tente novamente.')
      } finally {
        setIsSaving(false)
      }
      return;
    }

    setCurrentStepIndex((prev) => prev + 1);
  }

  const handlePreviewStep = () => {
    if (currentStepIndex === 0) {
      return;
    }

    setCurrentStepIndex((prev) => prev - 1);
  }

  return (
    <>
      <StepProgress currentStep={currentStepIndex + 1} totalSteps={totalSteps} />
      <FormStep
        key={currentStep.id} {...currentStep}
        onBack={handlePreviewStep}
        onNext={handleNextStep}
        hideBackButton={currentStepIndex === 0}
        isSubmitting={isSaving} />
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </>
  )
}
