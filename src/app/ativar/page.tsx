"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogoDark } from "@/components/Logo";
import {
  Key, CheckCircle, AlertCircle, ArrowRight, Clock,
  ShieldCheck, FileText, ChevronRight, Send,
} from "lucide-react";
import Link from "next/link";

interface LicencaAtiva {
  ativa: boolean;
  nomeClinica?: string;
  plano?: string;
  diasRestantes?: number;
  dataExpiracao?: string;
  token?: string;
}

const PLANOS = [
  { nome: "Solo", dias: 30, preco: "R$ 79/mês", desc: "1 profissional" },
  { nome: "Clínica", dias: 30, preco: "R$ 199/mês", desc: "Até 5 profissionais" },
  { nome: "Enterprise", dias: 30, preco: "Consulte", desc: "Ilimitado" },
];

type Tab = "token" | "solicitar";

export default function AtivarPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("token");

  // Estado — Ativar token
  const [token, setToken] = useState("");
  const [loadingToken, setLoadingToken] = useState(false);
  const [erroToken, setErroToken] = useState<string | null>(null);
  const [sucessoToken, setSucessoToken] = useState<{
    nomeClinica: string; plano: string; diasValidade: number; dataExpiracao: string;
  } | null>(null);

  // Estado — Solicitar
  const [formSol, setFormSol] = useState({
    nomeClinica: "",
    telefone: "",
    planoNome: "Solo",
    diasPlano: 30,
  });
  const [loadingSol, setLoadingSol] = useState(false);
  const [erroSol, setErroSol] = useState<string | null>(null);
  const [sucessoSol, setSucessoSol] = useState(false);

  // Status licença atual
  const [licencaAtual, setLicencaAtual] = useState<LicencaAtiva | null>(null);
  const [checando, setChecando] = useState(true);

  useEffect(() => {
    fetch("/api/saas/ativar")
      .then(r => r.json())
      .then(d => { setLicencaAtual(d); setChecando(false); })
      .catch(() => setChecando(false));
  }, []);

  // Pré-preenche nome da clínica com nome do usuário
  useEffect(() => {
    if (session?.user?.name && !formSol.nomeClinica) {
      setFormSol(f => ({ ...f, nomeClinica: `Clínica de ${session.user.name.split(" ")[0]}` }));
    }
  }, [session]);

  // ── Token ──
  function handleTokenChange(val: string) {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const rest = clean.startsWith("DOM") ? clean.slice(3) : clean;
    const parts = [rest.slice(0, 4), rest.slice(4, 8), rest.slice(8, 12)].filter(p => p.length > 0);
    setToken(("DOM-" + parts.join("-")).slice(0, 18));
    setErroToken(null);
  }

  async function ativarToken() {
    if (token.length < 18) { setErroToken("Token incompleto. Formato: DOM-XXXX-XXXX-XXXX"); return; }
    setLoadingToken(true);
    setErroToken(null);
    const res = await fetch("/api/saas/ativar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setLoadingToken(false);
    if (!res.ok) setErroToken(data.error ?? "Erro ao ativar.");
    else {
      setSucessoToken(data.licenca);
      setLicencaAtual({
        ativa: true,
        nomeClinica: data.licenca.nomeClinica,
        plano: data.licenca.plano,
        dataExpiracao: data.licenca.dataExpiracao,
        diasRestantes: calcularDiasRestantes(data.licenca.dataExpiracao),
      });
    }
  }

  // ── Solicitar ──
  async function enviarSolicitacao() {
    if (!formSol.nomeClinica.trim()) { setErroSol("Informe o nome da clínica."); return; }
    setLoadingSol(true);
    setErroSol(null);
    const res = await fetch("/api/saas/solicitacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeTitular: session?.user?.name ?? "Sem nome",
        email: session?.user?.email ?? "",
        nomeClinica: formSol.nomeClinica,
        telefone: formSol.telefone || null,
        planoNome: formSol.planoNome,
        diasPlano: formSol.diasPlano,
      }),
    });
    const data = await res.json();
    setLoadingSol(false);
    if (!res.ok) setErroSol(data.error ?? "Erro ao enviar solicitação.");
    else setSucessoSol(true);
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  function calcularDiasRestantes(dataExpiracao?: string | null) {
    if (!dataExpiracao) return null;
    const expiracao = new Date(dataExpiracao);
    const hoje = new Date();
    const hojeUtc = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const expiracaoUtc = Date.UTC(expiracao.getFullYear(), expiracao.getMonth(), expiracao.getDate());
    return Math.max(0, Math.round((expiracaoUtc - hojeUtc) / 86400000));
  }

  const diasRestantes = licencaAtual?.diasRestantes ?? 0;
  const alerta = diasRestantes <= 7;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: "#f8fafc" }}>
      <div className="w-full max-w-lg space-y-5">
        <div className="flex justify-center">
          <LogoDark size={42} showText />
        </div>

        {/* Status da licença atual */}
        {!checando && licencaAtual?.ativa && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: alerta ? "#fef2f2" : "#f0fdf4",
              border: `1px solid ${alerta ? "#fecaca" : "#bbf7d0"}`,
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: alerta ? "#fee2e2" : "#d1fae5" }}>
              <ShieldCheck style={{ width: 18, height: 18, color: alerta ? "#ef4444" : "#10b981" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: alerta ? "#dc2626" : "#166534" }}>
                {alerta ? `Licença expira em ${diasRestantes} dias!` : "Licença Ativa"}
              </p>
              <p className="text-xs" style={{ color: alerta ? "#ef4444" : "#15803d" }}>
                {licencaAtual.nomeClinica} · {licencaAtual.plano} · {diasRestantes} dias restantes
              </p>
            </div>
            <button onClick={() => router.push("/dashboard")} className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ backgroundColor: alerta ? "#ef4444" : "#10b981", color: "#fff" }}>
              Ir ao sistema →
            </button>
          </div>
        )}

        {/* Card principal */}
        <div className="rounded-2xl shadow-lg" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9" }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid #f1f5f9" }}>
            {[
              { key: "token" as Tab, label: "Tenho um Token", icon: Key },
              { key: "solicitar" as Tab, label: "Solicitar Licença", icon: Send },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all"
                style={{
                  color: tab === key ? "#0ea5e9" : "#94a3b8",
                  borderBottom: tab === key ? "2px solid #0ea5e9" : "2px solid transparent",
                  backgroundColor: tab === key ? "#f0f9ff" : "transparent",
                  borderRadius: key === "token" ? "16px 0 0 0" : "0 16px 0 0",
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />
                {label}
              </button>
            ))}
          </div>

          {/* ── ABA TOKEN ── */}
          {tab === "token" && (
            <div className="p-7">
              {!sucessoToken ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}>
                      <Key style={{ width: 22, height: 22, color: "#fff" }} />
                    </div>
                    <h2 className="text-lg font-black" style={{ color: "#0f172a" }}>Ativar com Token</h2>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Insira o token recebido da equipe DomFisio</p>
                  </div>

                  {erroToken && (
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                      <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                      {erroToken}
                    </div>
                  )}

                  <div className="mb-5">
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => handleTokenChange(e.target.value)}
                      placeholder="DOM-XXXX-XXXX-XXXX"
                      maxLength={18}
                      className="w-full text-center text-xl font-mono font-bold py-3 px-4 rounded-xl outline-none"
                      style={{ border: erroToken ? "2px solid #ef4444" : "2px solid #e2e8f0", color: "#0f172a", backgroundColor: "#f8fafc", letterSpacing: "0.12em" }}
                      onFocus={(e) => { if (!erroToken) e.target.style.borderColor = "#0ea5e9"; }}
                      onBlur={(e) => { if (!erroToken) e.target.style.borderColor = "#e2e8f0"; }}
                      onKeyDown={(e) => { if (e.key === "Enter") ativarToken(); }}
                    />
                    {/* Indicadores de progresso */}
                    <div className="flex justify-center gap-1.5 mt-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-1 w-10 rounded-full" style={{ backgroundColor: (token.split("-")[i]?.length ?? 0) === 4 ? "#0ea5e9" : "#e2e8f0" }} />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={ativarToken}
                    disabled={loadingToken || token.length < 18}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
                  >
                    {loadingToken
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Validando...</>
                      : <>Ativar Sistema <ArrowRight style={{ width: 15, height: 15 }} /></>
                    }
                  </button>

                  <p className="text-center text-xs mt-4" style={{ color: "#94a3b8" }}>
                    Ainda não tem token?{" "}
                    <button onClick={() => setTab("solicitar")} className="font-semibold" style={{ color: "#0ea5e9" }}>
                      Solicitar agora
                    </button>
                  </p>
                </>
              ) : (
                /* Sucesso ativação */
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#d1fae5" }}>
                    <CheckCircle style={{ width: 32, height: 32, color: "#10b981" }} />
                  </div>
                  <h2 className="text-xl font-black mb-1" style={{ color: "#0f172a" }}>Sistema Ativado!</h2>
                  <p className="text-sm mb-5" style={{ color: "#64748b" }}><strong>{sucessoToken.nomeClinica}</strong> — {sucessoToken.plano}</p>
                  <div className="p-4 rounded-xl mb-5 text-left space-y-2" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <div className="flex justify-between">
                      <span className="text-xs" style={{ color: "#064e3b" }}>Validade</span>
                      <span className="text-sm font-bold" style={{ color: "#065f46" }}>{sucessoToken.diasValidade} dias</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs flex items-center gap-1" style={{ color: "#064e3b" }}><Clock style={{ width: 11, height: 11 }} />Expira em</span>
                      <span className="text-sm font-bold" style={{ color: "#065f46" }}>{formatDate(sucessoToken.dataExpiracao)}</span>
                    </div>
                  </div>
                  <button onClick={() => router.push("/dashboard")} className="w-full py-3 rounded-xl text-white font-bold text-sm" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}>
                    Entrar no Sistema →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ABA SOLICITAR ── */}
          {tab === "solicitar" && (
            <div className="p-7">
              {!sucessoSol ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                      <FileText style={{ width: 22, height: 22, color: "#fff" }} />
                    </div>
                    <h2 className="text-lg font-black" style={{ color: "#0f172a" }}>Solicitar Licença</h2>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      Preencha os dados e receberá o token por email
                    </p>
                  </div>

                  {erroSol && (
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
                      <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                      {erroSol}
                    </div>
                  )}

                  {/* Dados pré-preenchidos */}
                  {session?.user && (
                    <div className="p-3 rounded-xl mb-4 flex items-center gap-3" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}>
                        {session.user.name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#0f172a" }}>{session.user.name}</p>
                        <p className="text-xs" style={{ color: "#94a3b8" }}>{session.user.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Nome da Clínica *</label>
                      <input
                        type="text"
                        placeholder="Ex: Clínica Reabilita"
                        className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                        style={{ border: "1px solid #e2e8f0", color: "#0f172a", backgroundColor: "#f9fafb" }}
                        value={formSol.nomeClinica}
                        onChange={(e) => setFormSol(f => ({ ...f, nomeClinica: e.target.value }))}
                        onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.backgroundColor = "#fff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
                        style={{ border: "1px solid #e2e8f0", color: "#0f172a", backgroundColor: "#f9fafb" }}
                        value={formSol.telefone}
                        onChange={(e) => setFormSol(f => ({ ...f, telefone: e.target.value }))}
                        onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; e.target.style.backgroundColor = "#fff"; }}
                        onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.backgroundColor = "#f9fafb"; }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: "#374151" }}>Plano Desejado</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PLANOS.map(p => (
                          <button
                            key={p.nome}
                            onClick={() => setFormSol(f => ({ ...f, planoNome: p.nome, diasPlano: p.dias }))}
                            className="p-3 rounded-xl text-left transition-all"
                            style={{
                              border: formSol.planoNome === p.nome ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
                              backgroundColor: formSol.planoNome === p.nome ? "#f0f9ff" : "#fff",
                            }}
                          >
                            <p className="text-xs font-bold" style={{ color: formSol.planoNome === p.nome ? "#0ea5e9" : "#0f172a" }}>{p.nome}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{p.preco}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>{p.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={enviarSolicitacao}
                    disabled={loadingSol || !formSol.nomeClinica.trim()}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}
                  >
                    {loadingSol
                      ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Enviando...</>
                      : <><Send style={{ width: 15, height: 15 }} />Enviar Solicitação</>
                    }
                  </button>

                  <p className="text-center text-xs mt-4" style={{ color: "#94a3b8" }}>
                    Já tem token?{" "}
                    <button onClick={() => setTab("token")} className="font-semibold" style={{ color: "#0ea5e9" }}>
                      Ativar aqui
                    </button>
                  </p>
                </>
              ) : (
                /* Sucesso solicitação */
                <div className="text-center py-2">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                    <CheckCircle style={{ width: 32, height: 32, color: "#fff" }} />
                  </div>
                  <h2 className="text-xl font-black mb-2" style={{ color: "#0f172a" }}>Solicitação Enviada!</h2>
                  <p className="text-sm mb-2" style={{ color: "#64748b" }}>
                    Nossa equipe recebeu sua solicitação e entrará em contato em breve.
                  </p>
                  <p className="text-sm font-medium mb-6" style={{ color: "#64748b" }}>
                    O token de ativação será enviado para{" "}
                    <strong style={{ color: "#0f172a" }}>{session?.user?.email}</strong>.
                  </p>

                  <div className="p-4 rounded-xl mb-6" style={{ backgroundColor: "#fef3c7", border: "1px solid #fde68a" }}>
                    <p className="text-xs font-semibold" style={{ color: "#92400e" }}>Próximo passo</p>
                    <p className="text-xs mt-1" style={{ color: "#78350f" }}>
                      Assim que receber o token, volte aqui e ative na aba{" "}
                      <strong>"Tenho um Token"</strong>.
                    </p>
                  </div>

                  <button
                    onClick={() => { setSucessoSol(false); setTab("token"); }}
                    className="w-full py-3 rounded-xl font-bold text-sm"
                    style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                  >
                    Já tenho o token →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
