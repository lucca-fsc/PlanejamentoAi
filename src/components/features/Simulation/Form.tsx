import { PiggyBank } from "lucide-react"
import { FormStep } from "./FormStep"
import { StepProgress } from "./Progress"

export const SimulationForm = () => {
    return (
        <>
            <StepProgress currentStep={3} totalSteps={6} />
            <FormStep
                icon={PiggyBank}
                title="Renda Mensal Bruta"
                question="Quanto é depositado na sua conta todo mês?"
                inputProps={{
                    type: 'text',
                    placeholder: 'Ex: 5.000,00',
                    suffix: 'R$'
                }} />
        </>
    )
}