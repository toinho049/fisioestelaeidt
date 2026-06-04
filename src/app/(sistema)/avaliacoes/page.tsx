"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ClipboardList, Search, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import AvaliacaoModal from "@/components/AvaliacaoModal";

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

function ViewModal({ open, onClose, avaliacao, onExcluir }: {
  open: boolean;
  onClose: () => void;
  avaliacao: Avaliacao | null;
  onExcluir: (id: string) => void;
}) {
  if (!open || !avaliacao) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="rounded-2xl shadow-2xl overflow-y-auto" style={{ backgroundColor: "#fff", width: "100%", maxWidth: 700, maxHeight: "92vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 className="font-semibold" style={{ color: "#0f172a" }}>{avaliacao.paciente.nome}</h2>
            <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
              {TIPOS[avaliacao.tipo]?.label} · {format(new Date(avaliacao.data), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          {avaliacao.escalaDor !== null && (
            <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "#64748b" }}>Escala de Dor (EVA)</p>
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="w-4 h-4 rounded-sm" style={{ backgroundColor: i < (avaliacao.escalaDor ?? 0) ? (i < 3 ? "#10b981" : i < 6 ? "#f59e0b" : "#ef4444") : "#e2e8f0" }} />
                  ))}
                </div>
                <span className="text-lg font-black" style={{ color: (avaliacao.escalaDor ?? 0) < 4 ? "#10b981" : (avaliacao.escalaDor ?? 0) < 7 ? "#f59e0b" : "#ef4444" }}>
                  {avaliacao.escalaDor}/10
                </span>
              </div>
            </div>
          )}
          {[
            { label: "Queixa Principal", value: avaliacao.queixaPrincipal },
            { label: "Diagnóstico", value: avaliacao.diagnostico },
          ].filter(i => i.value).map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
              <p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>{label}</p>
              <p className="text-sm" style={{ color: "#334155" }}>{value}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => onExcluir(avaliacao.id)} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#ef4444", border: "1px solid #fee2e2" }}>Excluir</button>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-white" style={{ backgroundColor: "#0ea5e9" }}>Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default function AvaliacoesPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
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

  async function excluir(id: string) {
    if (!confirm("Excluir esta avaliação?")) return;
    await fetch(`/api/avaliacoes/${id}`, { method: "DELETE" });
    setViewModal(null);
    load();
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Avaliações</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{filtered.length} registro{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
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
            <button onClick={() => setModalOpen(true)} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Criar primeira avaliação</button>
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

      <AvaliacaoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        pacientes={pacientes}
      />

      <ViewModal
        open={!!viewModal}
        onClose={() => setViewModal(null)}
        avaliacao={viewModal}
        onExcluir={excluir}
      />
    </div>
  );
}
