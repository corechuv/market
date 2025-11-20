// src/context/LangContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type AppLanguage,
  getInitialLanguage,
  applyLanguage,
} from "../utils/lang/lang";

type LangContextValue = {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
};

const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<AppLanguage>(() => getInitialLanguage());

  // Каждый раз, когда lang меняется — синхронизируем <html lang> + localStorage
  useEffect(() => {
    applyLanguage(lang);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error("useLang must be used within LangProvider");
  }
  return ctx;
}
