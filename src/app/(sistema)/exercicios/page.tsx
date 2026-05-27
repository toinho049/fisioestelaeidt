"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Dumbbell, Search, X, Filter } from "lucide-react";

interface Exercicio {
  id: string;
  nome: string;
  descricao: string | null;
  categoria: string | null;
  instrucoes: string | null;
  series: number | null;
  repeticoes: string | null;
  tempo: string | null;
  nivel: string;
  _count: { prescricoes: number };
}

const CATEGORIAS = ["força", "alongamento", "equilíbrio", "cardio", "funcional", "respiratório", "neurológico"];
const NIVEIS: Record<string, { label: string; color: string; bg: string }> = {
  leve:     { label: "Leve",     color: "#10b981", bg: "#d1fae5" },
  moderado: { label: "Moderado", color: "#f59e0b", bg: "#fef3c7" },
  intenso:  { label: "Intenso",  color: "#ef4444", bg: "#fee2e2" },
};

const CAT_COLORS: Record<string, string> = {
  "força": "#ef4444", "alongamento": "#8b5cf6", "equilíbrio": "#0ea5e9",
  "cardio": "#f59e0b", "funcional": "#10b981", "respiratório": "#06b6d4", "neurológico": "#6366f1",
};

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-lg shadow-2xl" style={{ backgroundColor: "#fff" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const emptyForm = { nome: "", descricao: "", categoria: "", instrucoes: "", series: "", repeticoes: "", tempo: "", nivel: "moderado" };

export default function ExerciciosPage() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState<Exercicio | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroCategoria) params.set("categoria", filtroCategoria);
    if (busca) params.set("q", busca);
    const res = await fetch(`/api/exercicios?${params}`);
    setExercicios(await res.json());
    setLoading(false);
  }, [filtroCategoria, busca]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function salvar() {
    if (!form.nome) return;
    setSaving(true);
    await fetch("/api/exercicios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Biblioteca de Exercícios</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{exercicios.length} exercício{exercicios.length !== 1 ? "s" : ""} cadastrado{exercicios.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #ef4444, #8b5cf6)", boxShadow: "0 4px 14px rgba(239,68,68,0.25)" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo Exercício
        </button>
      </div>

      {/* Search + filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ width: 14, height: 14, color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Buscar exercício..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none"
            style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", color: "#334155", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }}
            onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
          />
        </div>
        <select
          className="text-sm rounded-xl px-3 py-2 outline-none"
          style={{ border: "1px solid #e2e8f0", color: "#334155", backgroundColor: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Todas categorias</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Categoria chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroCategoria("")}
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: filtroCategoria === "" ? "#0f172a" : "#f1f5f9", color: filtroCategoria === "" ? "#fff" : "#64748b" }}
        >
          Todos
        </button>
        {CATEGORIAS.map(cat => {
          const color = CAT_COLORS[cat] ?? "#64748b";
          const active = filtroCategoria === cat;
          return (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(active ? "" : cat)}
              className="text-xs font-medium px-3 py-1 rounded-full capitalize transition-all"
              style={{
                backgroundColor: active ? color : `${color}18`,
                color: active ? "#fff" : color,
                border: `1px solid ${color}30`,
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
        </div>
      ) : exercicios.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ color: "#94a3b8" }}>
          <Dumbbell style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
          <p className="text-sm font-medium">Nenhum exercício encontrado</p>
          <button onClick={() => setModalOpen(true)} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Cadastrar exercício</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercicios.map((ex) => {
            const catColor = CAT_COLORS[ex.categoria ?? ""] ?? "#64748b";
            const nivelCfg = NIVEIS[ex.nivel] ?? NIVEIS.moderado;
            return (
              <div
                key={ex.id}
                className="rounded-xl p-4 cursor-pointer transition-all"
                style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
                onClick={() => setViewModal(ex)}
              >
                {/* Icon + categoria */}
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${catColor}18` }}>
                    <Dumbbell style={{ width: 18, height: 18, color: catColor }} />
                  </div>
                  {ex.categoria && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
                      {ex.categoria}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-sm mb-1 line-clamp-2" style={{ color: "#0f172a" }}>{ex.nome}</h3>
                {ex.descricao && <p className="text-xs line-clamp-2 mb-3" style={{ color: "#64748b" }}>{ex.descricao}</p>}

                {/* Details chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ex.series && <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{ex.series} séries</span>}
                  {ex.repeticoes && <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{ex.repeticoes} rep</span>}
                  {ex.tempo && <span className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}>{ex.tempo}</span>}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: nivelCfg.bg, color: nivelCfg.color }}>{nivelCfg.label}</span>
                  {ex._count.prescricoes > 0 && (
                    <span className="text-xs" style={{ color: "#94a3b8" }}>{ex._count.prescricoes} prescrição{ex._count.prescricoes > 1 ? "ões" : ""}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo Exercício */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold" style={{ color: "#0f172a" }}>Novo Exercício</h2>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Nome do Exercício *</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Agachamento com faixa elástica" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Categoria</label>
              <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.categoria} onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}>
                <option value="">Selecionar...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Nível</label>
              <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.nivel} onChange={(e) => setForm(f => ({ ...f, nivel: e.target.value }))}>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="intenso">Intenso</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Descrição</label>
            <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Instruções de Execução</label>
            <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.instrucoes} onChange={(e) => setForm(f => ({ ...f, instrucoes: e.target.value }))} placeholder="Posicionamento, execução, pontos de atenção..." onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Séries</label>
              <input type="number" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.series} onChange={(e) => setForm(f => ({ ...f, series: e.target.value }))} placeholder="3" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Repetições</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.repeticoes} onChange={(e) => setForm(f => ({ ...f, repeticoes: e.target.value }))} placeholder="10-15" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Tempo</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.tempo} onChange={(e) => setForm(f => ({ ...f, tempo: e.target.value }))} placeholder="30s" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>Cancelar</button>
          <button onClick={salvar} disabled={saving || !form.nome} className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#0ea5e9" }}>
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </Modal>

      {/* Modal Ver Exercício */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)}>
        {viewModal && (
          <>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <h2 className="font-semibold" style={{ color: "#0f172a" }}>{viewModal.nome}</h2>
              <button onClick={() => setViewModal(null)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="flex gap-2 flex-wrap">
                {viewModal.categoria && <span className="text-xs px-3 py-1 rounded-full font-medium capitalize" style={{ backgroundColor: `${CAT_COLORS[viewModal.categoria] ?? "#64748b"}18`, color: CAT_COLORS[viewModal.categoria] ?? "#64748b" }}>{viewModal.categoria}</span>}
                <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: NIVEIS[viewModal.nivel]?.bg, color: NIVEIS[viewModal.nivel]?.color }}>{NIVEIS[viewModal.nivel]?.label}</span>
              </div>
              {viewModal.descricao && <p className="text-sm" style={{ color: "#334155" }}>{viewModal.descricao}</p>}
              <div className="grid grid-cols-3 gap-3">
                {viewModal.series && <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "#f8fafc" }}><p className="text-xs" style={{ color: "#94a3b8" }}>Séries</p><p className="text-lg font-bold" style={{ color: "#0f172a" }}>{viewModal.series}</p></div>}
                {viewModal.repeticoes && <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "#f8fafc" }}><p className="text-xs" style={{ color: "#94a3b8" }}>Repetições</p><p className="text-lg font-bold" style={{ color: "#0f172a" }}>{viewModal.repeticoes}</p></div>}
                {viewModal.tempo && <div className="p-3 rounded-xl text-center" style={{ backgroundColor: "#f8fafc" }}><p className="text-xs" style={{ color: "#94a3b8" }}>Tempo</p><p className="text-lg font-bold" style={{ color: "#0f172a" }}>{viewModal.tempo}</p></div>}
              </div>
              {viewModal.instrucoes && <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}><p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Instruções</p><p className="text-sm whitespace-pre-line" style={{ color: "#334155" }}>{viewModal.instrucoes}</p></div>}
            </div>
            <div className="flex justify-end px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => setViewModal(null)} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#0ea5e9" }}>Fechar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
