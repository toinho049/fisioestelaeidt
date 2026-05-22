"use client";

import Link from "next/link";
import { LogoIcon, LogoDark } from "@/components/Logo";
import {
  CalendarDays, Users, ClipboardList, FileText, DollarSign,
  Dumbbell, Target, BarChart3, CheckCircle, ArrowRight,
  Star, ChevronRight, Activity, Shield, Zap,
} from "lucide-react";

const features = [
  {
    icon: CalendarDays,
    title: "Agenda Inteligente",
    desc: "Calendário semanal com visualização por profissional, confirmação de presença e alertas de ausência.",
    color: "#0ea5e9",
  },
  {
    icon: ClipboardList,
    title: "Avaliação Completa",
    desc: "Anamnese estruturada, exame físico, ADM por articulação, escalas de dor EVA e diagnóstico fisioterapêutico.",
    color: "#8b5cf6",
  },
  {
    icon: FileText,
    title: "Prontuário Eletrônico",
    desc: "Evoluções de sessão em linha do tempo, com templates por especialidade e histórico completo.",
    color: "#10b981",
  },
  {
    icon: Target,
    title: "Plano de Tratamento",
    desc: "Defina objetivos, número de sessões e acompanhe o progresso do paciente em tempo real.",
    color: "#f59e0b",
  },
  {
    icon: Dumbbell,
    title: "Biblioteca de Exercícios",
    desc: "Cadastre exercícios e crie protocolos personalizados para cada paciente com facilidade.",
    color: "#ef4444",
  },
  {
    icon: DollarSign,
    title: "Gestão Financeira",
    desc: "Controle de pagamentos, convênios, lançamentos por mês e relatório de receita.",
    color: "#06b6d4",
  },
  {
    icon: BarChart3,
    title: "Relatórios e Indicadores",
    desc: "Evolução da dor em gráfico, taxa de frequência, produtividade por profissional.",
    color: "#6366f1",
  },
  {
    icon: Users,
    title: "Gestão de Pacientes",
    desc: "Ficha completa com histórico de agenda, avaliações, evoluções e financeiro integrados.",
    color: "#ec4899",
  },
];

const stats = [
  { value: "2.000+", label: "Fisioterapeutas usando" },
  { value: "180k+", label: "Pacientes cadastrados" },
  { value: "4.9★", label: "Avaliação média" },
  { value: "99.9%", label: "Uptime garantido" },
];

const howItWorks = [
  { step: "01", title: "Cadastre seus pacientes", desc: "Importe ou cadastre manualmente com foto, convênio e histórico clínico completo." },
  { step: "02", title: "Realize a avaliação inicial", desc: "Formulários estruturados de anamnese, exame físico, ADM e escalas de dor em minutos." },
  { step: "03", title: "Gerencie toda a clínica", desc: "Agenda, evoluções, plano de tratamento, exercícios e financeiro em um único sistema." },
];

const testimonials = [
  { name: "Dra. Ana Costa", role: "Fisioterapeuta Ortopédica", stars: 5, text: "O DomFisio transformou minha clínica. A avaliação completa e o acompanhamento de progresso são incríveis." },
  { name: "Dr. Rafael Souza", role: "Fisioterapeuta Neurológico", stars: 5, text: "Finalmente um sistema que entende o nosso fluxo de trabalho. A agenda e o prontuário são perfeitos." },
  { name: "Dra. Camila Lima", role: "Clínica Esportiva", stars: 5, text: "A biblioteca de exercícios e o plano de tratamento me poupam horas por semana. Recomendo demais!" },
];

const plans = [
  {
    name: "Solo",
    price: "R$ 79",
    desc: "Para fisioterapeutas autônomos",
    features: ["1 profissional", "Pacientes ilimitados", "Agenda completa", "Avaliações e prontuário", "Financeiro básico"],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Clínica",
    price: "R$ 199",
    desc: "Para clínicas com equipe",
    features: ["Até 5 profissionais", "Tudo do Solo", "Plano de tratamento", "Biblioteca de exercícios", "Relatórios avançados", "Suporte prioritário"],
    cta: "Testar 14 dias grátis",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    desc: "Para grandes redes e hospitais",
    features: ["Profissionais ilimitados", "Tudo do Clínica", "API de integração", "Dados on-premise", "SLA garantido"],
    cta: "Falar com vendas",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff", fontFamily: "Inter, sans-serif" }}>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-3"
        style={{ backgroundColor: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderBottom: "1px solid #f1f5f9" }}
      >
        <LogoDark size={32} />
        <div className="hidden md:flex items-center gap-8">
          {["Funcionalidades", "Como funciona", "Planos", "Depoimentos"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-sm font-medium transition-colors" style={{ color: "#64748b" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#0ea5e9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ color: "#64748b" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
            style={{ color: "#334155", border: "1px solid #e2e8f0" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#0ea5e9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
          >
            Criar conta
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(14,165,233,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(14,165,233,0.3)"; }}
          >
            Teste grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background blur blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: "#0ea5e9" }} />
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: "#10b981" }} />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ backgroundColor: "#eff6ff", color: "#0ea5e9", border: "1px solid #bfdbfe" }}>
            <Zap style={{ width: 12, height: 12 }} />
            Novo: Avaliações completas com escalas de dor e ADM
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6" style={{ color: "#0f172a" }}>
            O sistema completo para{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              fisioterapeutas
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "#64748b" }}>
            Agenda inteligente, avaliações estruturadas, prontuário eletrônico,
            plano de tratamento e gestão financeira — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-base transition-all"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", boxShadow: "0 8px 30px rgba(14,165,233,0.35)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.45)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(14,165,233,0.35)"; }}
            >
              Começar gratuitamente
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <a
              href="#como-funciona"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
              style={{ color: "#334155", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#0ea5e9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
            >
              Ver demonstração
            </a>
          </div>

          {/* App preview mockup */}
          <div
            className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl"
            style={{
              maxWidth: 820,
              border: "1px solid #e2e8f0",
              background: "linear-gradient(135deg, #0c1427 0%, #0f172a 100%)",
            }}
          >
            {/* Mockup header */}
            <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#10b981" }} />
              <div className="flex-1 mx-4">
                <div className="h-5 rounded-md max-w-xs mx-auto" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
              </div>
            </div>
            {/* Mockup content */}
            <div className="flex" style={{ minHeight: 360 }}>
              {/* Sidebar mockup */}
              <div className="w-48 flex-shrink-0 p-3 space-y-1" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-4 px-2">
                  <LogoIcon size={24} />
                  <div className="h-3 w-16 rounded" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} />
                </div>
                {[["#0ea5e9", "Dashboard", true], ["#64748b", "Agenda", false], ["#64748b", "Pacientes", false], ["#64748b", "Avaliações", false], ["#64748b", "Financeiro", false]].map(([color, label, active]) => (
                  <div key={String(label)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: active ? "rgba(14,165,233,0.12)" : "transparent" }}>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: String(color), opacity: active ? 1 : 0.3 }} />
                    <div className="h-2 rounded flex-1" style={{ backgroundColor: active ? "#38bdf8" : "rgba(255,255,255,0.1)" }} />
                  </div>
                ))}
              </div>
              {/* Content mockup */}
              <div className="flex-1 p-5">
                <div className="grid grid-cols-4 gap-3 mb-5">
                  {[["#0ea5e9", "Pacientes", "248"], ["#10b981", "Hoje", "12"], ["#8b5cf6", "Receita", "R$8.4k"], ["#f59e0b", "A receber", "R$1.2k"]].map(([color, label, val]) => (
                    <div key={String(label)} className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-5 h-5 rounded-lg mb-2" style={{ backgroundColor: `${String(color)}22` }}>
                        <div className="w-2.5 h-2.5 rounded m-1.25" style={{ backgroundColor: String(color), margin: "3.75px" }} />
                      </div>
                      <div className="h-2 w-12 rounded mb-1" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                      <div className="h-4 w-16 rounded" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
                    </div>
                  ))}
                </div>
                {/* Calendar mockup */}
                <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex gap-2 mb-3">
                    {["Seg", "Ter", "Qua", "Qui", "Sex"].map((d) => (
                      <div key={d} className="flex-1 text-center">
                        <div className="text-xs mb-2" style={{ color: "#475569" }}>{d}</div>
                        <div className="space-y-1.5">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-6 rounded-md" style={{ backgroundColor: ["rgba(14,165,233,0.3)", "rgba(16,185,129,0.3)", "rgba(139,92,246,0.3)", "rgba(245,158,11,0.3)", "rgba(239,68,68,0.2)"][Math.floor(Math.random() * 5)], display: Math.random() > 0.35 ? "block" : "none" }} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14" style={{ backgroundColor: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black mb-1" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{value}</p>
              <p className="text-sm" style={{ color: "#64748b" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ backgroundColor: "#f0fdf4", color: "#10b981", border: "1px solid #bbf7d0" }}>
              <Activity style={{ width: 12, height: 12 }} /> Funcionalidades
            </div>
            <h2 className="text-4xl font-black mb-4" style={{ color: "#0f172a" }}>
              Tudo que você precisa,{" "}
              <span style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                em um só lugar
              </span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#64748b" }}>
              Do agendamento à alta do paciente, o DomFisio cobre cada etapa do seu fluxo clínico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="rounded-2xl p-5 transition-all duration-200 group"
                style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${color}15` }}>
                  <Icon style={{ width: 20, height: 20, color }} />
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: "#0f172a" }}>{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ backgroundColor: "#eff6ff", color: "#0ea5e9", border: "1px solid #bfdbfe" }}>
              <Zap style={{ width: 12, height: 12 }} /> Como funciona
            </div>
            <h2 className="text-4xl font-black" style={{ color: "#0f172a" }}>
              Simples de usar,{" "}
              <span style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                poderoso na prática
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-xl font-black text-white"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", boxShadow: "0 8px 24px rgba(14,165,233,0.3)" }}
                >
                  {step}
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: "#0f172a" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black" style={{ color: "#0f172a" }}>
              Quem usa,{" "}
              <span style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                aprova
              </span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, stars, text }) => (
              <div
                key={name}
                className="rounded-2xl p-6"
                style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} style={{ width: 14, height: 14, color: "#f59e0b", fill: "#f59e0b" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#334155" }}>"{text}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}
                  >
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{name}</p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-24 px-6" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ backgroundColor: "#f0fdf4", color: "#10b981", border: "1px solid #bbf7d0" }}>
              <Shield style={{ width: 12, height: 12 }} /> Planos
            </div>
            <h2 className="text-4xl font-black" style={{ color: "#0f172a" }}>
              Preço justo para cada tamanho de{" "}
              <span style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                clínica
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(({ name, price, desc, features, cta, highlight }) => (
              <div
                key={name}
                className="rounded-2xl p-7 relative"
                style={{
                  backgroundColor: highlight ? "#0f172a" : "#fff",
                  border: highlight ? "2px solid #0ea5e9" : "1px solid #e2e8f0",
                  boxShadow: highlight ? "0 20px 60px rgba(14,165,233,0.2)" : "0 1px 3px rgba(0,0,0,0.04)",
                  transform: highlight ? "scale(1.03)" : "scale(1)",
                }}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}>
                    Mais popular
                  </div>
                )}
                <h3 className="font-black text-lg mb-1" style={{ color: highlight ? "#fff" : "#0f172a" }}>{name}</h3>
                <p className="text-xs mb-4" style={{ color: highlight ? "#64748b" : "#94a3b8" }}>{desc}</p>
                <div className="mb-6">
                  <span className="text-3xl font-black" style={{ color: highlight ? "#fff" : "#0f172a" }}>{price}</span>
                  {price !== "Sob consulta" && <span className="text-sm ml-1" style={{ color: highlight ? "#64748b" : "#94a3b8" }}>/mês</span>}
                </div>
                <ul className="space-y-2.5 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: highlight ? "#cbd5e1" : "#334155" }}>
                      <CheckCircle style={{ width: 14, height: 14, color: "#10b981", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all"
                  style={highlight ? {
                    background: "linear-gradient(135deg, #0ea5e9, #10b981)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(14,165,233,0.4)",
                  } : {
                    backgroundColor: "#f8fafc",
                    color: "#334155",
                    border: "1px solid #e2e8f0",
                  }}
                  onMouseEnter={(e) => { if (!highlight) e.currentTarget.style.borderColor = "#0ea5e9"; }}
                  onMouseLeave={(e) => { if (!highlight) e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  {cta} <ChevronRight style={{ width: 14, height: 14 }} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6">
        <div
          className="max-w-3xl mx-auto text-center rounded-3xl py-16 px-8"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
        >
          <LogoIcon size={52} />
          <h2 className="text-3xl font-black text-white mt-6 mb-4">
            Pronto para transformar sua clínica?
          </h2>
          <p className="mb-8" style={{ color: "#94a3b8" }}>
            Comece hoje mesmo. Sem cartão de crédito, sem burocracia.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base transition-all"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", boxShadow: "0 8px 30px rgba(14,165,233,0.35)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(14,165,233,0.5)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(14,165,233,0.35)"; }}
          >
            Criar conta gratuita <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6" style={{ backgroundColor: "#0f172a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoIcon size={28} />
            <span className="font-black text-white">Dom<span style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Fisio</span></span>
          </div>
          <p className="text-sm" style={{ color: "#475569" }}>
            © {new Date().getFullYear()} DomFisio. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {["Privacidade", "Termos", "Suporte"].map((item) => (
              <a key={item} href="#" className="text-xs transition-colors" style={{ color: "#475569" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#475569"; }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
