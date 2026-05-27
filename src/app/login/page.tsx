"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { LogoDark } from "@/components/Logo";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const erro = searchParams.get("error");

  const [form, setForm] = useState({ email: "", senha: "" });
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erroLocal, setErroLocal] = useState<string | null>(
    erro === "CredentialsSignin" ? "Email ou senha incorretos." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.senha) {
      setErroLocal("Preencha email e senha.");
      return;
    }
    setLoading(true);
    setErroLocal(null);

    const res = await signIn("credentials", {
      email: form.email,
      senha: form.senha,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setErroLocal("Email ou senha incorretos. Tente novamente.");
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[45%] flex-shrink-0"
        style={{
          background: "linear-gradient(145deg, #0c1427 0%, #0f2040 60%, #0c1427 100%)",
        }}
      >
        <LogoDark size={38} showText />

        <div>
          <blockquote className="text-xl font-bold leading-relaxed mb-4" style={{ color: "#e2e8f0" }}>
            "O sistema que cuida da{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              sua clínica
            </span>
            {" "}para você cuidar dos seus pacientes."
          </blockquote>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}
            >
              DF
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#cbd5e1" }}>Equipe DomFisio</p>
              <p className="text-xs" style={{ color: "#475569" }}>Sistema de Gestão para Fisioterapeutas</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[["2k+", "Profissionais"], ["180k+", "Pacientes"], ["99.9%", "Uptime"]].map(([v, l]) => (
            <div key={l} className="text-center p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p
                className="text-lg font-black"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                {v}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ backgroundColor: "#f8fafc" }}>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <LogoDark size={40} showText />
          </div>

          <div className="rounded-2xl p-8" style={{ backgroundColor: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
            <div className="mb-7">
              <h1 className="text-2xl font-black" style={{ color: "#0f172a" }}>Bem-vindo!</h1>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Entre com sua conta para continuar</p>
            </div>

            {erroLocal && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-5 text-sm" style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                {erroLocal}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 15, height: 15, color: "#9ca3af" }} />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="seu@email.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ border: "1px solid #e5e7eb", color: "#111827", backgroundColor: "#f9fafb" }}
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.backgroundColor = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 15, height: 15, color: "#9ca3af" }} />
                  <input
                    type={showSenha ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{ border: "1px solid #e5e7eb", color: "#111827", backgroundColor: "#f9fafb" }}
                    value={form.senha}
                    onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))}
                    onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.backgroundColor = "#fff"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#9ca3af" }}
                  >
                    {showSenha ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-xs font-medium" style={{ color: "#0ea5e9" }}>
                  Esqueci minha senha
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-70 mt-1"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(14,165,233,0.35)",
                }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(14,165,233,0.45)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(14,165,233,0.35)"; }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Entrando...
                  </span>
                ) : "Entrar"}
              </button>
            </form>

            {/* Demo hint */}
            <div className="mt-5 p-3 rounded-xl text-center" style={{ backgroundColor: "#f0f9ff", border: "1px dashed #bae6fd" }}>
              <p className="text-xs font-medium" style={{ color: "#0369a1" }}>Conta de demonstração</p>
              <p className="text-xs mt-0.5" style={{ color: "#0284c7" }}>
                admin@domfisio.com / <strong>admin123</strong>
              </p>
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#9ca3af" }}>
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold" style={{ color: "#0ea5e9" }}>
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
