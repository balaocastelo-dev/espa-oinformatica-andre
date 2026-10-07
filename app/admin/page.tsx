import type { Metadata } from "next";
import { isAdminConfigured, isAdminSession } from "@/lib/auth";
import AdminApp from "./AdminApp";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Painel Administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (await isAdminSession()) return <AdminApp />;
  return <LoginForm configured={isAdminConfigured()} />;
}
