"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";

interface Paciente { id: string; nome: string }

const ARTICULACOES = [
  { key: "ombro_flex",    label: "Ombro — Flexão",           max: 180 },
  { key: "ombro_abd",     label: "Ombro — Abdução",          max: 180 },
  { key: "cotovelo_flex", label: "Cotovelo — Flexão",        max: 145 },
  { key: "punho_flex",    label: "Punho — Flexão",           max: 80  },
  { key: "punho_ext",     label: "Punho — Extensão",         max: 70  },
  { key: "quadril_flex",  label: "Quadril — Flexão",         max: 125 },
  { key: "joelho_flex",   label: "Joelho — Flexão",          max: 130 },
  { key: "tornozelo_df",  label: "Tornozelo — Dorsiflexão",  max: 20  },
  { key: "cervical_flex", label: "Cervical — Flexão",        max: 50  },
  { key: "lombar_flex",   label: "Lombar — Flexão",          max: 90  },
];

const GRUPOS_MUSCULARES = [
  { key: "flex_ombro",     label: "Flexores Ombro" },
  { key: "ext_ombro",      label: "Extensores Ombro" },
  { key: "abd_ombro",      label: "Abdutores Ombro" },
  { key: "flex_cotovelo",  label: "Flexores Cotovelo" },
  { key: "ext_cotovelo",   label: "Extensores Cotovelo" },
  { key: "flex_quadril",   label: "Flexores Quadril" },
  { key: "ext_quadril",    label: "Extensores Quadril" },
  { key: "flex_joelho",    label: "Flexores Joelho" },
  { key: "ext_joelho",     label: "Extensores Joelho" },
];

const ESCALA_FORCA = [0, 1, 2, 3, 4, 5];

type Step = "anamnese" | "exame" | "adm" | "forca" | "diagnostico";

const STEPS: { key: Step; label: string }[] = [
  { key: "anamnese",    label: "Anamnese" },
  { key: "exame",       label: "Exame Físico" },
  { key: "adm",         label: "ADM" },
  { key: "forca",       label: "Força Muscular" },
  { key: "diagnostico", label: "Diagnóstico" },
];

const emptyForm = {
  pacienteId: "", tipo: "inicial", data: format(new Date(), "yyyy-MM-dd"),
  queixaPrincipal: "", historiaDoenca: "", historiaPregressa: "", medicamentos: "",
  comorbidades: "", habitosVida: "", inspecao: "", palpacao: "", testesEspeciais: "",
  postura: "", escalaDor: 0, localizacaoDor: "", diagnostico: "", objetivos: "",
  numeroSessoes: 10,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Pré-seleciona o paciente (ex.: vindo da agenda) */
  pacienteIdInicial?: string;
  /** Lista de pacientes disponíveis */
  pacientes: Paciente[];
}

export default function AvaliacaoModal({ open, onClose, onSaved, pacienteIdInicial, pacientes }: Props) {
  const [step, setStep] = useState<Step>("anamnese");
  const [form, setForm] = useState(emptyForm);
  const [adm, setAdm] = useState<Record<string, string>>({});
  const [forca, setForca] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, pacienteId: pacienteIdInicial ?? "" });
      setAdm({});
      setForca({});
      setStep("anamnese");
    }
  }, [open, pacienteIdInicial]);

  if (!open) return null;

  const stepIdx = STEPS.findIndex(s => s.key === step);

  async function salvar() {
    if (!form.pacienteId) return;
    setSaving(true);
    await fetch("/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, adm, forcaMuscular: forca }),
    });
    setSaving(false);
    onClose();
    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-y-auto"
        style={{ backgroundColor: "#fff", width: "100%", maxWidth: 900, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: "#0f172a" }}>Nova Avaliação Fisioterapêutica</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>Preencha as seções abaixo</p>
          </div>
          <button onClick={onClose}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
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

        {/* Content */}
        <div className="px-7 py-5 overflow-y-auto" style={{ maxHeight: "55vh" }}>
          {step === "anamnese" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Paciente *</label>
                  <select
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                    style={{ border: "1px solid #e2e8f0" }}
                    value={form.pacienteId}
                    onChange={(e) => setForm(f => ({ ...f, pacienteId: e.target.value }))}
                    disabled={!!pacienteIdInicial}
                  >
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
                  <span>0 — Sem dor</span><span>5 — Moderada</span><span>10 — Insuportável</span>
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
                        type="number" min={0} max={max} placeholder="—"
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
                      {ESCALA_FORCA.map((v) => (
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
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg font-medium" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>
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
      </div>
    </div>
  );
}
