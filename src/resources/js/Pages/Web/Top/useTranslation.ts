import { useState, useCallback } from 'react'
import { translations, type Language, type TranslationKey } from './translations'

const STORAGE_KEY = 'task-bouquet-language'

export const useTranslation = () => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return (stored as Language) || 'ja'
    })

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem(STORAGE_KEY, lang)
    }, [])

    const t = useCallback((key: TranslationKey, params?: Record<string, string>) => {
        let text = translations[language][key]

        if (params) {
            Object.entries(params).forEach(([param, value]) => {
                text = text.replace(`{${param}}`, value)
            })
        }

        return text
    }, [language])

    return {
        language,
        setLanguage,
        t
    }
}