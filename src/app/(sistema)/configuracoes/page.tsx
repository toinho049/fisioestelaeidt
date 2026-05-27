"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Lock, User, Palette, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function ConfiguracoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notificacoes, setNotificacoes] = useState({
    agendamentos: true,
    pagamentos: true,
    atualizacoes: true,
  });
  const [tema, setTema] = useState("claro");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSaveNotificacoes = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Configurações de notificações salvas!");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTema = async () => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      alert("Tema atualizado!");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <p style={{ color: "#64748b" }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#0f172a" }}>
          Configurações
        </h1>
        <p style={{ color: "#64748b" }}>
          Gerencie suas preferências e segurança
        </p>
      </div>

      <div className="space-y-6">
        {/* Perfil */}
        <div className="p-6 rounded-lg bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <User style={{ width: 20, height: 20, color: "#0ea5e9" }} />
            <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>
              Perfil
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: "#0f172a" }}
              >
                Nome
              </label>
              <input
                type="text"
                value={session?.user?.name ?? ""}
                disabled
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                }}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: "#0f172a" }}
              >
                Email
              </label>
              <input
                type="email"
                value={session?.user?.email ?? ""}
                disabled
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                }}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium"
                style={{ color: "#0f172a" }}
              >
                Função
              </label>
              <input
                type="text"
                value={session?.user?.role ?? ""}
                disabled
                className="w-full mt-1 px-3 py-2 rounded-lg border text-sm capitalize"
                style={{
                  borderColor: "#e2e8f0",
                  backgroundColor: "#f8fafc",
                  color: "#64748b",
                }}
              />
            </div>
          </div>
        </div>

        {/* Notificações */}
        <div className="p-6 rounded-lg bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Bell style={{ width: 20, height: 20, color: "#0ea5e9" }} />
            <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>
              Notificações
            </h2>
          </div>
          <div className="space-y-4">
            {Object.entries(notificacoes).map(([key, value]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setNotificacoes((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#0ea5e9" }}
                />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#0f172a" }}
                  >
                    {key === "agendamentos" && "Notificações de Agendamentos"}
                    {key === "pagamentos" && "Alertas de Pagamentos"}
                    {key === "atualizacoes" && "Atualizações do Sistema"}
                  </p>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {key === "agendamentos" &&
                      "Receba avisos sobre agendamentos"}
                    {key === "pagamentos" &&
                      "Alertas sobre pagamentos pendentes"}
                    {key === "atualizacoes" &&
                      "Novidades e melhorias do sistema"}
                  </p>
                </div>
              </label>
            ))}
            <button
              onClick={handleSaveNotificacoes}
              disabled={saving}
              className="w-full mt-4 px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: saving ? "#cbd5e1" : "#0ea5e9" }}
            >
              {saving ? "Salvando..." : "Salvar Preferências"}
            </button>
          </div>
        </div>

        {/* Tema */}
        <div className="p-6 rounded-lg bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Palette style={{ width: 20, height: 20, color: "#0ea5e9" }} />
            <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>
              Aparência
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <label
                className="text-sm font-medium block mb-3"
                style={{ color: "#0f172a" }}
              >
                Tema
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["claro", "escuro"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTema(t)}
                    className="p-3 rounded-lg border-2 text-sm font-medium capitalize transition-all"
                    style={{
                      borderColor: tema === t ? "#0ea5e9" : "#e2e8f0",
                      backgroundColor: tema === t ? "#f0f9ff" : "#ffffff",
                      color: tema === t ? "#0ea5e9" : "#0f172a",
                    }}
                  >
                    {t === "claro" ? "☀️ Claro" : "🌙 Escuro"}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSaveTema}
              disabled={saving}
              className="w-full px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: saving ? "#cbd5e1" : "#0ea5e9" }}
            >
              {saving ? "Salvando..." : "Aplicar Tema"}
            </button>
          </div>
        </div>

        {/* Segurança */}
        <div className="p-6 rounded-lg bg-white border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Lock style={{ width: 20, height: 20, color: "#0ea5e9" }} />
            <h2 className="text-lg font-semibold" style={{ color: "#0f172a" }}>
              Segurança
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-sm" style={{ color: "#64748b" }}>
              Última sessão ativa: Hoje
            </p>
            <button
              className="w-full px-4 py-2 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: "#ef4444" }}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut
                className="inline mr-2"
                style={{ width: 16, height: 16 }}
              />
              Sair de todas as sessões
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
