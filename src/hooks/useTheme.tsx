import { ThemeContext } from "@/context/theme/ThemeContext"
import { useContext } from "react"

export function useTheme() {
    const context = useContext(ThemeContext)

    if (context === undefined) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
    }

    return context
}