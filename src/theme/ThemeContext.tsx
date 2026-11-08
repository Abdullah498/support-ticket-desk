import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
interface ThemeContextValue { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function readTheme(): Theme {
  try { return localStorage.getItem('support-ticket-theme') === 'dark' ? 'dark' : 'light'; }
  catch { return 'light'; }
}
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme);
  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('support-ticket-theme', next); } catch { /* Storage may be unavailable. */ }
      return next;
    });
  };
  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);
  return <ThemeContext.Provider value={value}><div className={`app-shell theme-${theme}`}>{children}</div></ThemeContext.Provider>;
}
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider.');
  return context;
}
