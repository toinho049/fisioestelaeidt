"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Target, X, ChevronRight, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Plano {
  id: string;
  pacienteId: string;
  titulo: string;
  objetivoCurto: string | null;
  objetivoLongo: string | null;
  sessoesTotais: number;
  sessoesRealizadas: number;
  status: string;
  dataInicio: string;
  dataFim: string | null;
  tecnicas: string | null;
  recursos: string | null;
  observacoes: string | null;
  paciente: { nome: string };
}

interface Paciente { id: string; nome: string }

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ativo:     { label: "Ativo",     color: "#0ea5e9", bg: "#e0f2fe" },
  concluido: { label: "Concluído", color: "#10b981", bg: "#d1fae5" },
  suspenso:  { label: "Suspenso",  color: "#f59e0b", bg: "#fef3c7" },
};

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]" style={{ backgroundColor: "#fff" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const emptyForm = {
  pacienteId: "", titulo: "", objetivoCurto: "", objetivoLongo: "",
  sessoesTotais: 10, sessoesRealizadas: 0, tecnicas: "", recursos: "",
  status: "ativo", dataInicio: format(new Date(), "yyyy-MM-dd"), dataFim: "", observacoes: "",
};

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<Plano | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = filtroStatus ? `?status=${filtroStatus}` : "";
    const res = await fetch(`/api/planos${params}`);
    setPlanos(await res.json());
    setLoading(false);
  }, [filtroStatus]);

  useEffect(() => {
    load();
    fetch("/api/pacientes").then(r => r.json()).then(setPacientes);
  }, [load]);

  async function salvar() {
    if (!form.pacienteId || !form.titulo) return;
    setSaving(true);
    await fetch("/api/planos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  async function atualizarSessao(id: string, delta: number) {
    const plano = planos.find(p => p.id === id);
    if (!plano) return;
    const nova = Math.max(0, Math.min(plano.sessoesTotais, plano.sessoesRealizadas + delta));
    await fetch(`/api/planos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessoesRealizadas: nova }),
    });
    load();
  }

  async function mudarStatus(id: string, status: string) {
    await fetch(`/api/planos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setEditModal(null);
    load();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir plano de tratamento?")) return;
    await fetch(`/api/planos/${id}`, { method: "DELETE" });
    setEditModal(null);
    load();
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Plano de Tratamento</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{planos.length} plano{planos.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo Plano
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[["", "Todos"], ["ativo", "Ativos"], ["concluido", "Concluídos"], ["suspenso", "Suspensos"]].map(([val, lbl]) => (
          <button
            key={val}
            onClick={() => setFiltroStatus(val)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: filtroStatus === val ? "#0ea5e9" : "#fff",
              color: filtroStatus === val ? "#fff" : "#64748b",
              border: `1px solid ${filtroStatus === val ? "#0ea5e9" : "#e2e8f0"}`,
            }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
        </div>
      ) : planos.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ color: "#94a3b8" }}>
          <Target style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
          <p className="text-sm font-medium">Nenhum plano de tratamento</p>
          <button onClick={() => setModalOpen(true)} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Criar primeiro plano</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {planos.map((plano) => {
            const pct = plano.sessoesTotais > 0 ? Math.round((plano.sessoesRealizadas / plano.sessoesTotais) * 100) : 0;
            const cfg = STATUS_CONFIG[plano.status] ?? STATUS_CONFIG.ativo;
            return (
              <div
                key={plano.id}
                className="rounded-xl p-5 transition-all"
                style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "#0f172a" }}>{plano.titulo}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#94a3b8" }}>{plano.paciente.nome}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <button
                      onClick={() => setEditModal(plano)}
                      className="p-1 rounded-lg"
                      style={{ color: "#94a3b8" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#0ea5e9"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#94a3b8"; }}
                    >
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs" style={{ color: "#64748b" }}>Progresso</span>
                    <span className="text-xs font-bold" style={{ color: pct >= 100 ? "#10b981" : "#0f172a" }}>
                      {plano.sessoesRealizadas}/{plano.sessoesTotais} sessões ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: "#f1f5f9" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 100 ? "#10b981" : "linear-gradient(90deg, #0ea5e9, #6366f1)",
                      }}
                    />
                  </div>
                </div>

                {/* Objetivos */}
                {plano.objetivoCurto && (
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: "#64748b" }}>
                    <span className="font-medium" style={{ color: "#334155" }}>Meta: </span>
                    {plano.objetivoCurto}
                  </p>
                )}

                {/* Sessão counter */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #f8fafc" }}>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    {format(new Date(plano.dataInicio), "dd/MM/yyyy")}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => atualizarSessao(plano.id, -1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold transition-colors"
                      style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fecaca"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fee2e2"; }}
                    >
                      −
                    </button>
                    <span className="text-sm font-bold w-6 text-center" style={{ color: "#0f172a" }}>{plano.sessoesRealizadas}</span>
                    <button
                      onClick={() => atualizarSessao(plano.id, 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold transition-colors"
                      style={{ backgroundColor: "#d1fae5", color: "#10b981" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#a7f3d0"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#d1fae5"; }}
                    >
                      +
                    </button>
                    <span className="text-xs ml-1" style={{ color: "#94a3b8" }}>sessão</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Novo Plano */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold" style={{ color: "#0f172a" }}>Novo Plano de Tratamento</h2>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Paciente *</label>
            <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.pacienteId} onChange={(e) => setForm(f => ({ ...f, pacienteId: e.target.value }))}>
              <option value="">Selecionar...</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Título do Plano *</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ex: Reabilitação pós-cirúrgica de joelho" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Objetivo de Curto Prazo</label>
              <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.objetivoCurto} onChange={(e) => setForm(f => ({ ...f, objetivoCurto: e.target.value }))} placeholder="Ex: Reduzir dor em 4 semanas" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Objetivo de Longo Prazo</label>
              <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.objetivoLongo} onChange={(e) => setForm(f => ({ ...f, objetivoLongo: e.target.value }))} placeholder="Ex: Retorno às atividades esportivas" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Total de Sessões</label>
              <input type="number" min={1} className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.sessoesTotais} onChange={(e) => setForm(f => ({ ...f, sessoesTotais: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Data de Início</label>
              <input type="date" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.dataInicio} onChange={(e) => setForm(f => ({ ...f, dataInicio: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Previsão de Alta</label>
              <input type="date" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.dataFim} onChange={(e) => setForm(f => ({ ...f, dataFim: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Técnicas Utilizadas</label>
              <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.tecnicas} onChange={(e) => setForm(f => ({ ...f, tecnicas: e.target.value }))} placeholder="Cinesioterapia, eletroterapia, FNP..." />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Recursos Terapêuticos</label>
              <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.recursos} onChange={(e) => setForm(f => ({ ...f, recursos: e.target.value }))} placeholder="TENS, ultrassom, laser, faixa..." />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>Cancelar</button>
          <button onClick={salvar} disabled={saving || !form.pacienteId || !form.titulo} className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#0ea5e9" }}>
            {saving ? "Salvando..." : "Criar Plano"}
          </button>
        </div>
      </Modal>

      {/* Modal Editar / Detalhe */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)}>
        {editModal && (
          <>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 className="font-semibold" style={{ color: "#0f172a" }}>{editModal.titulo}</h2>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{editModal.paciente.nome}</p>
              </div>
              <button onClick={() => setEditModal(null)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                <p className="text-xs font-medium mb-2" style={{ color: "#64748b" }}>Progresso</p>
                <div className="h-2 rounded-full mb-1" style={{ backgroundColor: "#e2e8f0" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, (editModal.sessoesRealizadas / editModal.sessoesTotais) * 100)}%`, backgroundColor: "#0ea5e9" }} />
                </div>
                <p className="text-xs" style={{ color: "#64748b" }}>{editModal.sessoesRealizadas} de {editModal.sessoesTotais} sessões</p>
              </div>
              {editModal.objetivoCurto && <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}><p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Objetivo Curto Prazo</p><p className="text-sm" style={{ color: "#334155" }}>{editModal.objetivoCurto}</p></div>}
              {editModal.objetivoLongo && <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}><p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Objetivo Longo Prazo</p><p className="text-sm" style={{ color: "#334155" }}>{editModal.objetivoLongo}</p></div>}
              {editModal.tecnicas && <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}><p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>Técnicas</p><p className="text-sm" style={{ color: "#334155" }}>{editModal.tecnicas}</p></div>}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "#64748b" }}>Alterar Status</p>
                <div className="flex gap-2">
                  {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                    <button key={s} onClick={() => mudarStatus(editModal.id, s)} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: c.bg, color: c.color, border: editModal.status === s ? `2px solid ${c.color}` : "2px solid transparent" }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => excluir(editModal.id)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#ef4444", border: "1px solid #fee2e2" }}>Excluir</button>
              <button onClick={() => setEditModal(null)} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#0ea5e9" }}>Fechar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
