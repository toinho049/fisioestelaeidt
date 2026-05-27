"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, User, Phone, Mail, Calendar, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Paciente {
  id: string;
  nome: string;
  cpf: string | null;
  dataNascimento: string | null;
  telefone: string | null;
  email: string | null;
  convenio: string | null;
  ativo: boolean;
  criadoEm: string;
  _count: { agendamentos: number; prontuarios: number };
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]" style={{ backgroundColor: "#fff" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const emptyForm = {
  nome: "", cpf: "", dataNascimento: "", telefone: "", email: "",
  endereco: "", convenio: "", numeroConvenio: "", observacoes: "",
};

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = busca ? `?q=${encodeURIComponent(busca)}` : "";
    const res = await fetch(`/api/pacientes${params}`);
    setPacientes(await res.json());
    setLoading(false);
  }, [busca]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function salvar() {
    if (!form.nome.trim()) return;
    setSaving(true);
    await fetch("/api/pacientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  const calcIdade = (dob: string | null) => {
    if (!dob) return null;
    const anos = Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
    return `${anos} anos`;
  };

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Pacientes</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
            {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} encontrado{pacientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#0ea5e9" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0284c7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0ea5e9"; }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ width: 15, height: 15, color: "#94a3b8" }} />
        <input
          type="text"
          placeholder="Buscar por nome, CPF ou email..."
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none"
          style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", color: "#334155", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }}
          onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="grid text-xs font-semibold px-5 py-3" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 40px", color: "#64748b", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
          <span>Paciente</span>
          <span>Contato</span>
          <span>Convênio</span>
          <span>Atendimentos</span>
          <span>Status</span>
          <span />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
          </div>
        ) : pacientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "#94a3b8" }}>
            <User style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
            <p className="text-sm font-medium">Nenhum paciente encontrado</p>
            <button onClick={() => setModalOpen(true)} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>
              Cadastrar primeiro paciente
            </button>
          </div>
        ) : (
          <div>
            {pacientes.map((p, i) => (
              <Link
                key={p.id}
                href={`/pacientes/${p.id}`}
                className="grid items-center px-5 py-3.5 transition-colors"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 40px",
                  borderBottom: i < pacientes.length - 1 ? "1px solid #f8fafc" : "none",
                  backgroundColor: "#fff",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: `hsl(${p.nome.charCodeAt(0) * 5 % 360}, 60%, 55%)` }}
                  >
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#0f172a" }}>{p.nome}</p>
                    <p className="text-xs truncate" style={{ color: "#94a3b8" }}>
                      {calcIdade(p.dataNascimento) ?? p.cpf ?? "Sem dados adicionais"}
                    </p>
                  </div>
                </div>
                <div className="min-w-0">
                  {p.telefone && (
                    <p className="text-xs flex items-center gap-1 truncate" style={{ color: "#64748b" }}>
                      <Phone style={{ width: 11, height: 11 }} />{p.telefone}
                    </p>
                  )}
                  {p.email && (
                    <p className="text-xs flex items-center gap-1 truncate mt-0.5" style={{ color: "#94a3b8" }}>
                      <Mail style={{ width: 11, height: 11 }} />{p.email}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#64748b" }}>{p.convenio ?? "Particular"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#334155" }}>{p._count.agendamentos} sessões</p>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{p._count.prontuarios} registros</p>
                </div>
                <div>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: p.ativo ? "#d1fae5" : "#f1f5f9",
                      color: p.ativo ? "#065f46" : "#64748b",
                    }}
                  >
                    {p.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <ChevronRight style={{ width: 14, height: 14, color: "#cbd5e1" }} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold" style={{ color: "#0f172a" }}>Novo Paciente</h2>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Nome completo *</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome do paciente" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>CPF</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.cpf} onChange={(e) => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Data de Nascimento</label>
              <input type="date" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.dataNascimento} onChange={(e) => setForm(f => ({ ...f, dataNascimento: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Telefone</label>
              <input type="tel" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Email</label>
              <input type="email" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Endereço</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.endereco} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro, cidade" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Convênio</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.convenio} onChange={(e) => setForm(f => ({ ...f, convenio: e.target.value }))} placeholder="Particular, Unimed..." />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Nº do Convênio</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.numeroConvenio} onChange={(e) => setForm(f => ({ ...f, numeroConvenio: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Observações</label>
            <textarea rows={2} className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg font-medium" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>Cancelar</button>
          <button onClick={salvar} disabled={saving || !form.nome.trim()} className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#0ea5e9" }}>
            {saving ? "Salvando..." : "Cadastrar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
