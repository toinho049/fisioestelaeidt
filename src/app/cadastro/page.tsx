"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoDark } from "@/components/Logo";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmarSenha: "" });
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const senhasIguais = form.senha === form.confirmarSenha && form.confirmarSenha.length > 0;
  const senhaForte = form.senha.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!form.nome.trim() || !form.email.trim() || !form.senha) {
      setErro("Preencha todos os campos.");
      return;
    }
    if (!senhaForte) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (!senhasIguais) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErro(data.error ?? "Erro ao criar conta.");
    } else {
      setSucesso(true);
      // Após criar conta, redireciona para login e depois para /ativar
      setTimeout(() => router.push("/login?msg=cadastro&next=/ativar"), 2500);
    }
  }

  const inputStyle = {
    border: "1px solid #e5e7eb",
    color: "#111827",
    backgroundColor: "#f9fafb",
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[45%] flex-shrink-0"
        style={{ background: "linear-gradient(145deg, #0c1427 0%, #0f2040 60%, #0c1427 100%)" }}
      >
        <LogoDark size={38} showText />

        <div>
          <h2 className="text-2xl font-black text-white mb-3 leading-snug">
            Comece a transformar<br />
            <span style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              sua clínica hoje.
            </span>
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Crie sua conta gratuitamente e tenha acesso a agenda, avaliações, prontuário eletrônico e muito mais.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Agenda inteligente com calendário semanal",
              "Avaliações completas (ADM, EVA, força muscular)",
              "Prontuário eletrônico e plano de tratamento",
              "Gestão financeira e relatórios",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <CheckCircle style={{ width: 15, height: 15, color: "#10b981", flexShrink: 0 }} />
                <span className="text-sm" style={{ color: "#cbd5e1" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[["2k+", "Profissionais"], ["180k+", "Pacientes"], ["99.9%", "Uptime"]].map(([v, l]) => (
            <div key={l} className="text-center p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-lg font-black" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{v}</p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ backgroundColor: "#f8fafc" }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-8">
            <LogoDark size={40} showText />
          </div>

          <div className="rounded-2xl p-8" style={{ backgroundColor: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>

            {sucesso ? (
              /* Tela de sucesso */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#d1fae5" }}>
                  <CheckCircle style={{ width: 32, height: 32, color: "#10b981" }} />
                </div>
                <h2 className="text-xl font-black mb-2" style={{ color: "#0f172a" }}>Conta criada!</h2>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Redirecionando para o login...
                </p>
                <div className="mt-4 w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#e2e8f0" }}>
                  <div className="h-full rounded-full animate-pulse" style={{ backgroundColor: "#10b981", width: "100%" }} />
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h1 className="text-2xl font-black" style={{ color: "#0f172a" }}>Criar conta</h1>
                  <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Preencha os dados para começar</p>
                </div>

                {erro && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm" style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                    <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
                    {erro}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>
                      Nome completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 15, height: 15, color: "#9ca3af" }} />
                      <input
                        type="text"
                        autoComplete="name"
                        required
                        placeholder="Dr(a). Nome Sobrenome"
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                        style={inputStyle}
                        value={form.nome}
                        onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
                        onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.backgroundColor = "#fff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>
                  </div>

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
                        style={inputStyle}
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
                        autoComplete="new-password"
                        required
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all"
                        style={{
                          ...inputStyle,
                          borderColor: form.senha && !senhaForte ? "#ef4444" : "#e5e7eb",
                        }}
                        value={form.senha}
                        onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))}
                        onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.backgroundColor = "#fff"; }}
                        onBlur={(e) => { e.target.style.borderColor = form.senha && !senhaForte ? "#ef4444" : "#e5e7eb"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                      <button type="button" onClick={() => setShowSenha(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
                        {showSenha ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                      </button>
                    </div>
                    {/* Força da senha */}
                    {form.senha.length > 0 && (
                      <div className="mt-1.5 flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex-1 h-1 rounded-full" style={{
                            backgroundColor: form.senha.length >= i * 4
                              ? i === 1 ? "#ef4444" : i === 2 ? "#f59e0b" : "#10b981"
                              : "#e2e8f0",
                          }} />
                        ))}
                        <span className="text-xs ml-1" style={{ color: form.senha.length < 4 ? "#ef4444" : form.senha.length < 8 ? "#f59e0b" : "#10b981" }}>
                          {form.senha.length < 4 ? "Fraca" : form.senha.length < 8 ? "Média" : "Forte"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirmar senha */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Confirmar senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2" style={{ width: 15, height: 15, color: "#9ca3af" }} />
                      <input
                        type={showConfirmar ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        placeholder="Repita a senha"
                        className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all"
                        style={{
                          ...inputStyle,
                          borderColor: form.confirmarSenha && !senhasIguais ? "#ef4444" : form.confirmarSenha && senhasIguais ? "#10b981" : "#e5e7eb",
                        }}
                        value={form.confirmarSenha}
                        onChange={(e) => setForm(f => ({ ...f, confirmarSenha: e.target.value }))}
                        onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.backgroundColor = "#fff"; }}
                        onBlur={(e) => {
                          if (form.confirmarSenha) e.target.style.borderColor = senhasIguais ? "#10b981" : "#ef4444";
                          else e.target.style.borderColor = "#e5e7eb";
                          e.target.style.backgroundColor = "#f9fafb";
                        }}
                      />
                      <button type="button" onClick={() => setShowConfirmar(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }}>
                        {showConfirmar ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                      </button>
                    </div>
                    {form.confirmarSenha && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: senhasIguais ? "#10b981" : "#ef4444" }}>
                        {senhasIguais
                          ? <><CheckCircle style={{ width: 11, height: 11 }} /> Senhas coincidem</>
                          : <><AlertCircle style={{ width: 11, height: 11 }} /> Senhas não coincidem</>
                        }
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-70 mt-1"
                    style={{
                      background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                      boxShadow: "0 4px 14px rgba(14,165,233,0.35)",
                    }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(14,165,233,0.45)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(14,165,233,0.35)"; }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Criando conta...
                      </span>
                    ) : "Criar conta grátis"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-center text-xs mt-5" style={{ color: "#9ca3af" }}>
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#0ea5e9" }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
