import { createContext, useContext, useState } from 'react'
import translations from '../lib/i18n'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('be_lang') || 'en')

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem('be_lang', l)
  }

  const t = (section, key) => translations[lang]?.[section]?.[key] ?? translations['en']?.[section]?.[key] ?? key

  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
