"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, FileText, Search, X, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Prontuario {
  id: string;
  pacienteId: string;
  data: string;
  tipo: string;
  queixa: string | null;
  diagnostico: string | null;
  conduta: string | null;
  evolucao: string | null;
  paciente: { nome: string };
}

interface Paciente { id: string; nome: string }

const TIPO_LABELS: Record<string, string> = {
  evolucao: "Evolução",
  avaliacao: "Avaliação Inicial",
  anamnese: "Anamnese",
  alta: "Alta",
};

const TIPO_COLORS: Record<string, { bg: string; text: string }> = {
  evolucao:  { bg: "#e0e7ff", text: "#3730a3" },
  avaliacao: { bg: "#d1fae5", text: "#065f46" },
  anamnese:  { bg: "#dbeafe", text: "#1d4ed8" },
  alta:      { bg: "#fef3c7", text: "#92400e" },
};

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]" style={{ backgroundColor: "#fff" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const emptyForm = {
  pacienteId: "", tipo: "evolucao", data: format(new Date(), "yyyy-MM-dd"),
  queixa: "", anamnese: "", exame: "", diagnostico: "", conduta: "", evolucao: "",
};

export default function AtendimentosPage() {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState<Prontuario | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/prontuarios");
    const data = await res.json();
    setProntuarios(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetch("/api/pacientes").then(r => r.json()).then(setPacientes);
  }, [load]);

  const filtered = prontuarios.filter(p =>
    busca ? p.paciente.nome.toLowerCase().includes(busca.toLowerCase()) : true
  );

  async function salvar() {
    if (!form.pacienteId) return;
    setSaving(true);
    await fetch("/api/prontuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este registro?")) return;
    await fetch(`/api/prontuarios/${id}`, { method: "DELETE" });
    setViewModal(null);
    load();
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Atendimentos</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#0ea5e9" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0284c7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0ea5e9"; }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo Registro
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ width: 15, height: 15, color: "#94a3b8" }} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-16" style={{ color: "#94a3b8" }}>
            <FileText style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
            <p className="text-sm font-medium">Nenhum registro encontrado</p>
            <button onClick={() => setModalOpen(true)} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Criar primeiro registro</button>
          </div>
        ) : (
          filtered.map(p => {
            const tipoCfg = TIPO_COLORS[p.tipo] ?? TIPO_COLORS.evolucao;
            return (
              <div
                key={p.id}
                className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                onClick={() => setViewModal(p)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: `hsl(${p.paciente.nome.charCodeAt(0) * 5 % 360}, 60%, 55%)` }}
                    >
                      {p.paciente.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#0f172a" }}>{p.paciente.nome}</p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>{format(new Date(p.data), "dd/MM/yyyy", { locale: ptBR })}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: tipoCfg.bg, color: tipoCfg.text }}>
                    {TIPO_LABELS[p.tipo] ?? p.tipo}
                  </span>
                </div>
                {(p.evolucao ?? p.conduta ?? p.diagnostico) && (
                  <p className="text-xs line-clamp-2" style={{ color: "#64748b" }}>
                    {p.evolucao ?? p.conduta ?? p.diagnostico}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Novo Registro */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold" style={{ color: "#0f172a" }}>Novo Registro Clínico</h2>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Paciente *</label>
              <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0", color: "#334155" }} value={form.pacienteId} onChange={(e) => setForm(f => ({ ...f, pacienteId: e.target.value }))}>
                <option value="">Selecionar...</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Tipo</label>
              <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0", color: "#334155" }} value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}>
                {Object.entries(TIPO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Data</label>
            <input type="date" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.data} onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))} />
          </div>
          {["queixa", "anamnese", "exame", "diagnostico", "conduta", "evolucao"].map((campo) => (
            <div key={campo}>
              <label className="block text-xs font-medium mb-1 capitalize" style={{ color: "#64748b" }}>
                {campo === "exame" ? "Exame Físico" : campo === "evolucao" ? "Evolução" : campo.charAt(0).toUpperCase() + campo.slice(1)}
              </label>
              <textarea
                rows={campo === "evolucao" ? 3 : 2}
                className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none"
                style={{ border: "1px solid #e2e8f0", color: "#334155" }}
                value={(form as Record<string, string>)[campo]}
                onChange={(e) => setForm(f => ({ ...f, [campo]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg font-medium" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>Cancelar</button>
          <button onClick={salvar} disabled={saving || !form.pacienteId} className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#0ea5e9" }}>
            {saving ? "Salvando..." : "Salvar Registro"}
          </button>
        </div>
      </Modal>

      {/* Modal Visualizar */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)}>
        {viewModal && (
          <>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 className="font-semibold" style={{ color: "#0f172a" }}>{viewModal.paciente.nome}</h2>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{TIPO_LABELS[viewModal.tipo]} · {format(new Date(viewModal.data), "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <button onClick={() => setViewModal(null)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {[
                { label: "Queixa Principal", value: viewModal.queixa },
                { label: "Diagnóstico", value: viewModal.diagnostico },
                { label: "Conduta", value: viewModal.conduta },
                { label: "Evolução", value: viewModal.evolucao },
              ].filter(item => item.value).map(({ label, value }) => (
                <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>{label}</p>
                  <p className="text-sm" style={{ color: "#334155" }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => excluir(viewModal.id)} className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: "#ef4444", border: "1px solid #fee2e2" }}>Excluir</button>
              <button onClick={() => setViewModal(null)} className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#0ea5e9" }}>Fechar</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
