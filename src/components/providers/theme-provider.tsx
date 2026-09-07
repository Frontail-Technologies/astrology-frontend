"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"

import { themeStorageKey, type Theme } from "@/lib/theme"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const defaultTheme: Theme = "dark"

function applyTheme(theme: Theme) {
  const root = document.documentElement

  root.classList.remove("light", "dark")
  root.classList.add(theme)
  root.style.colorScheme = theme
  window.localStorage.setItem(themeStorageKey, theme)
}

function getInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return defaultTheme
  }

  return document.documentElement.classList.contains("light") ? "light" : "dark"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)

  useEffect(() => {
    setThemeState(getInitialTheme())
  }, [])

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    applyTheme(nextTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark"
      applyTheme(nextTheme)
      return nextTheme
    })
  }, [])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme
    }),
    [setTheme, theme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.")
  }

  return context
}
