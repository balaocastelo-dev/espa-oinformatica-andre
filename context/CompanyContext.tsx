"use client";

import { createContext, useContext } from "react";
import type { CompanySettings } from "@/lib/company";

const CompanyContext = createContext<CompanySettings | null>(null);

export default function CompanyProvider({
  settings,
  children,
}: {
  settings: CompanySettings;
  children: React.ReactNode;
}) {
  return <CompanyContext.Provider value={settings}>{children}</CompanyContext.Provider>;
}

export function useCompany(): CompanySettings {
  const settings = useContext(CompanyContext);
  if (!settings) throw new Error("useCompany deve ser usado dentro de CompanyProvider");
  return settings;
}
