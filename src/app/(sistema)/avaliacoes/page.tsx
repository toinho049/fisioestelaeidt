"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ClipboardList, Search, X, ChevronRight, Activity } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Avaliacao {
  id: string;
  pacienteId: string;
  data: string;
  tipo: string;
  queixaPrincipal: string | null;
  diagnostico: string | null;
  escalaDor: number | null;
  paciente: { nome: string };
}

interface Paciente { id: string; nome: string }

const TIPOS: Record<string, { label: string; color: string; bg: string }> = {
  inicial:     { label: "Avaliação Inicial", color: "#0ea5e9", bg: "#e0f2fe" },
  reavaliacao: { label: "Reavaliação",       color: "#8b5cf6", bg: "#ede9fe" },
  alta:        { label: "Alta",              color: "#10b981", bg: "#d1fae5" },
};

// Articulações para ADM
const ARTICULACOES = [
  { key: "ombro_flex",   label: "Ombro — Flexão",    max: 180 },
  { key: "ombro_abd",    label: "Ombro — Abdução",   max: 180 },
  { key: "cotovelo_flex",label: "Cotovelo — Flexão",  max: 145 },
  { key: "punho_flex",   label: "Punho — Flexão",    max: 80  },
  { key: "punho_ext",    label: "Punho — Extensão",  max: 70  },
  { key: "quadril_flex", label: "Quadril — Flexão",  max: 125 },
  { key: "joelho_flex",  label: "Joelho — Flexão",   max: 130 },
  { key: "tornozelo_df", label: "Tornozelo — Dorsiflexão", max: 20 },
  { key: "cervical_flex",label: "Cervical — Flexão", max: 50  },
  { key: "lombar_flex",  label: "Lombar — Flexão",   max: 90  },
];

// Grupos musculares para força
const GRUPOS_MUSCULARES = [
  { key: "flex_ombro",  label: "Flexores Ombro" },
  { key: "ext_ombro",   label: "Extensores Ombro" },
  { key: "abd_ombro",   label: "Abdutores Ombro" },
  { key: "flex_cotovelo",label: "Flexores Cotovelo" },
  { key: "ext_cotovelo", label: "Extensores Cotovelo" },
  { key: "flex_quadril", label: "Flexores Quadril" },
  { key: "ext_quadril",  label: "Extensores Quadril" },
  { key: "flex_joelho",  label: "Flexores Joelho" },
  { key: "ext_joelho",   label: "Extensores Joelho" },
];

const ESCALA_FORCE = [0, 1, 2, 3, 4, 5];

function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="rounded-2xl shadow-2xl overflow-y-auto"
        style={{ backgroundColor: "#fff", width: "100%", maxWidth: wide ? 900 : 700, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const emptyForm = {
  pacienteId: "", tipo: "inicial", data: format(new Date(), "yyyy-MM-dd"),
  queixaPrincipal: "", historiaDoenca: "", historiaPregressa: "", medicamentos: "",
  comorbidades: "", habitosVida: "", inspecao: "", palpacao: "", testesEspeciais: "",
  postura: "", escalaDor: 0, localizacaoDor: "", diagnostico: "", objetivos: "",
  numeroSessoes: 10,
};

type AvaliacaoStep = "anamnese" | "exame" | "adm" | "forca" | "diagnostico";

const STEPS: { key: AvaliacaoStep; label: string }[] = [
  { key: "anamnese",    label: "Anamnese" },
  { key: "exame",       label: "Exame Físico" },
  { key: "adm",         label: "ADM" },
  { key: "forca",       label: "Força Muscular" },
  { key: "diagnostico", label: "Diagnóstico" },
];

export default function AvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<AvaliacaoStep>("anamnese");
  const [form, setForm] = useState(emptyForm);
  const [adm, setAdm] = useState<Record<string, string>>({});
  const [forca, setForca] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [viewModal, setViewModal] = useState<Avaliacao | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/avaliacoes");
    setAvaliacoes(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/pacientes").then(r => r.json()).then(setPacientes);
  }, [load]);

  const filtered = avaliacoes.filter(a =>
    busca ? a.paciente.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  function openModal() {
    setForm(emptyForm);
    setAdm({});
    setForca({});
    setStep("anamnese");
    setModalOpen(true);
  }

  async function salvar() {
    if (!form.pacienteId) return;
    setSaving(true);
    await fetch("/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, adm, forcaMuscular: forca }),
    });
    setSaving(false);
    setModalOpen(false);
    load();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir esta avaliação?")) return;
    await fetch(`/api/avaliacoes/${id}`, { method: "DELETE" });
    setViewModal(null);
    load();
  }

  const stepIdx = STEPS.findIndex(s => s.key === step);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Avaliações</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Nova Avaliação
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: "#94a3b8" }} />
        <input
          type="text"
          placeholder="Buscar por paciente..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none"
          style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", color: "#334155", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }}
          onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center py-16" style={{ color: "#94a3b8" }}>
            <ClipboardList style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
            <p className="text-sm font-medium">Nenhuma avaliação encontrada</p>
            <button onClick={openModal} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Criar primeira avaliação</button>
          </div>
        ) : filtered.map((a) => {
          const tipoCfg = TIPOS[a.tipo] ?? TIPOS.inicial;
          return (
            <div
              key={a.id}
              className="rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
              onClick={() => setViewModal(a)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: `hsl(${a.paciente.nome.charCodeAt(0) * 5 % 360}, 60%, 55%)` }}>
                    {a.paciente.nome.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{a.paciente.nome}</p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>{format(new Date(a.data), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: tipoCfg.bg, color: tipoCfg.color }}>
                  {tipoCfg.label}
                </span>
              </div>

              {a.escalaDor !== null && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs" style={{ color: "#64748b" }}>Dor:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 10 }, (_, i) => (
                      <div key={i} className="w-3 h-3 rounded-sm" style={{
                        backgroundColor: i < (a.escalaDor ?? 0)
                          ? i < 3 ? "#10b981" : i < 6 ? "#f59e0b" : "#ef4444"
                          : "#f1f5f9",
                      }} />
                    ))}
                  </div>
                  <span className="text-xs font-bold" style={{ color: (a.escalaDor ?? 0) < 4 ? "#10b981" : (a.escalaDor ?? 0) < 7 ? "#f59e0b" : "#ef4444" }}>
                    {a.escalaDor}/10
                  </span>
                </div>
              )}

              {a.queixaPrincipal && (
                <p className="text-xs line-clamp-2" style={{ color: "#64748b" }}>{a.queixaPrincipal}</p>
              )}
              {a.diagnostico && (
                <p className="text-xs font-medium mt-2" style={{ color: "#0ea5e9" }}>
                  Diag.: {a.diagnostico.slice(0, 50)}{a.diagnostico.length > 50 ? "…" : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Nova Avaliação — Multi-step */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} wide>
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: "#0f172a" }}>Nova Avaliação Fisioterapêutica</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Preencha as seções abaixo</p>
          </div>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>

        {/* Steps */}
        <div className="flex items-center px-7 py-3 gap-1" style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setStep(s.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: step === s.key ? "#0ea5e9" : "transparent",
                color: step === s.key ? "#fff" : i < stepIdx ? "#10b981" : "#94a3b8",
              }}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  backgroundColor: step === s.key ? "rgba(255,255,255,0.2)" : i < stepIdx ? "#d1fae5" : "#f1f5f9",
                  color: step === s.key ? "#fff" : i < stepIdx ? "#10b981" : "#94a3b8",
                }}
              >
                {i < stepIdx ? "✓" : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        <div className="px-7 py-5 overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {step === "anamnese" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Paciente *</label>
                  <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.pacienteId} onChange={(e) => setForm(f => ({ ...f, pacienteId: e.target.value }))}>
                    <option value="">Selecionar...</option>
                    {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Tipo</label>
                  <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}>
                    <option value="inicial">Avaliação Inicial</option>
                    <option value="reavaliacao">Reavaliação</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Queixa Principal *</label>
                <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.queixaPrincipal} onChange={(e) => setForm(f => ({ ...f, queixaPrincipal: e.target.value }))} placeholder="Descreva a queixa principal do paciente..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>História da Doença Atual (HDA)</label>
                <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.historiaDoenca} onChange={(e) => setForm(f => ({ ...f, historiaDoenca: e.target.value }))} placeholder="Início, evolução, fatores de piora/melhora..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>História Patológica Pregressa</label>
                  <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.historiaPregressa} onChange={(e) => setForm(f => ({ ...f, historiaPregressa: e.target.value }))} placeholder="Cirurgias, traumas, doenças prévias..." />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Medicamentos em Uso</label>
                  <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.medicamentos} onChange={(e) => setForm(f => ({ ...f, medicamentos: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Comorbidades</label>
                  <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.comorbidades} onChange={(e) => setForm(f => ({ ...f, comorbidades: e.target.value }))} placeholder="DM, HAS, obesidade..." />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Hábitos de Vida</label>
                  <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.habitosVida} onChange={(e) => setForm(f => ({ ...f, habitosVida: e.target.value }))} placeholder="Atividade física, trabalho, tabagismo..." />
                </div>
              </div>
            </div>
          )}

          {step === "exame" && (
            <div className="space-y-4">
              {/* EVA */}
              <div className="p-4 rounded-xl" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                <label className="block text-xs font-semibold mb-3" style={{ color: "#0f172a" }}>
                  Escala de Dor — EVA
                  <span className="ml-2 text-sm font-bold" style={{ color: form.escalaDor < 4 ? "#10b981" : form.escalaDor < 7 ? "#f59e0b" : "#ef4444" }}>
                    {form.escalaDor}/10
                  </span>
                </label>
                <input
                  type="range" min={0} max={10} step={1}
                  value={form.escalaDor}
                  onChange={(e) => setForm(f => ({ ...f, escalaDor: Number(e.target.value) }))}
                  className="w-full"
                  style={{ accentColor: form.escalaDor < 4 ? "#10b981" : form.escalaDor < 7 ? "#f59e0b" : "#ef4444" }}
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: "#94a3b8" }}>
                  <span>0 — Sem dor</span>
                  <span>5 — Moderada</span>
                  <span>10 — Insuportável</span>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Localização da Dor</label>
                  <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.localizacaoDor} onChange={(e) => setForm(f => ({ ...f, localizacaoDor: e.target.value }))} placeholder="Ex: região lombar, ombro direito..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Inspeção</label>
                <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.inspecao} onChange={(e) => setForm(f => ({ ...f, inspecao: e.target.value }))} placeholder="Edema, atrofia, deformidades, cicatrizes..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Palpação</label>
                  <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.palpacao} onChange={(e) => setForm(f => ({ ...f, palpacao: e.target.value }))} placeholder="Pontos dolorosos, temperatura, tensão muscular..." />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Testes Especiais</label>
                  <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.testesEspeciais} onChange={(e) => setForm(f => ({ ...f, testesEspeciais: e.target.value }))} placeholder="Neer, Apley, Lasègue, Thomas..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Avaliação Postural</label>
                <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.postura} onChange={(e) => setForm(f => ({ ...f, postura: e.target.value }))} placeholder="Anteriorização de cabeça, hipercifose, escoliose..." />
              </div>
            </div>
          )}

          {step === "adm" && (
            <div>
              <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>Registre a amplitude de movimento (em graus) para cada articulação avaliada.</p>
              <div className="grid grid-cols-2 gap-3">
                {ARTICULACOES.map(({ key, label, max }) => (
                  <div key={key} className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <label className="block text-xs font-medium mb-2" style={{ color: "#334155" }}>{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={max}
                        placeholder="—"
                        className="w-20 text-sm rounded-lg px-2 py-1.5 outline-none text-center font-bold"
                        style={{ border: "1px solid #e2e8f0", color: "#0f172a" }}
                        value={adm[key] ?? ""}
                        onChange={(e) => setAdm(a => ({ ...a, [key]: e.target.value }))}
                      />
                      <span className="text-xs" style={{ color: "#94a3b8" }}>/ {max}°</span>
                      {adm[key] && (
                        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "#e2e8f0", overflow: "hidden" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${Math.min(100, (Number(adm[key]) / max) * 100)}%`,
                            backgroundColor: (Number(adm[key]) / max) > 0.7 ? "#10b981" : (Number(adm[key]) / max) > 0.4 ? "#f59e0b" : "#ef4444",
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "forca" && (
            <div>
              <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>Escala Medical Research Council (MRC): 0=paralisia, 1=contração sem movimento, 2=movimento sem gravidade, 3=contra gravidade, 4=contra resistência parcial, 5=força normal.</p>
              <div className="grid grid-cols-2 gap-3">
                {GRUPOS_MUSCULARES.map(({ key, label }) => (
                  <div key={key} className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
                    <label className="block text-xs font-medium mb-2" style={{ color: "#334155" }}>{label}</label>
                    <div className="flex gap-1">
                      {ESCALA_FORCE.map((v) => (
                        <button
                          key={v}
                          onClick={() => setForca(f => ({ ...f, [key]: v }))}
                          className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
                          style={{
                            backgroundColor: forca[key] === v ? (v >= 4 ? "#10b981" : v >= 2 ? "#f59e0b" : "#ef4444") : "#fff",
                            color: forca[key] === v ? "#fff" : "#64748b",
                            border: `1px solid ${forca[key] === v ? "transparent" : "#e2e8f0"}`,
                          }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "diagnostico" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Diagnóstico Fisioterapêutico *</label>
                <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.diagnostico} onChange={(e) => setForm(f => ({ ...f, diagnostico: e.target.value }))} placeholder="Ex: Síndrome do impacto subacromial com limitação funcional de ombro direito..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Objetivos do Tratamento</label>
                <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.objetivos} onChange={(e) => setForm(f => ({ ...f, objetivos: e.target.value }))} placeholder="Ex: Reduzir dor, restaurar ADM de ombro, fortalecer manguito rotador..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Número de Sessões Estimado</label>
                <input type="number" min={1} max={100} className="w-32 text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.numeroSessoes} onChange={(e) => setForm(f => ({ ...f, numeroSessoes: Number(e.target.value) }))} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <div className="flex gap-2">
            {stepIdx > 0 && (
              <button onClick={() => setStep(STEPS[stepIdx - 1].key)} className="px-4 py-2 text-sm rounded-lg font-medium" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>
                ← Anterior
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg font-medium" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>
              Cancelar
            </button>
            {stepIdx < STEPS.length - 1 ? (
              <button
                onClick={() => setStep(STEPS[stepIdx + 1].key)}
                disabled={!form.pacienteId && step === "anamnese"}
                className="px-5 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "#0ea5e9" }}
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={salvar}
                disabled={saving || !form.pacienteId}
                className="px-5 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}
              >
                {saving ? "Salvando..." : "Salvar Avaliação"}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Visualizar */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)}>
        {viewModal && (
          <>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 className="font-semibold" style={{ color: "#0f172a" }}>{viewModal.paciente.nome}</h2>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  {TIPOS[viewModal.tipo]?.label} · {format(new Date(viewModal.data), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <button onClick={() => setViewModal(null)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {viewModal.escalaDor !== null && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                  <p className="text-xs font-medium mb-2" style={{ color: "#64748b" }}>Escala de Dor (EVA)</p>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 10 }, (_, i) => (
                        <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: i < (viewModal.escalaDor ?? 0) ? (i < 3 ? "#10b981" : i < 6 ? "#f59e0b" : "#ef4444") : "#e2e8f0" }} />
                      ))}
                    </div>
                    <span className="text-lg font-black" style={{ color: (viewModal.escalaDor ?? 0) < 4 ? "#10b981" : (viewModal.escalaDor ?? 0) < 7 ? "#f59e0b" : "#ef4444" }}>
                      {viewModal.escalaDor}/10
                    </span>
                  </div>
                </div>
              )}
              {[
                { label: "Queixa Principal", value: viewModal.queixaPrincipal },
                { label: "Diagnóstico", value: viewModal.diagnostico },
              ].filter(i => i.value).map(({ label, value }) => (
                <div key={label} className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>{label}</p>
                  <p className="text-sm" style={{ color: "#334155" }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => excluir(viewModal.id)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#ef4444", border: "1px solid #fee2e2" }}>Excluir</button>
              <button onClick={() => setViewModal(null)} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#0ea5e9" }}>Fechar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
