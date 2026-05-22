"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Building2, X, Phone, Mail, BadgeCheck } from "lucide-react";

interface Fisioterapeuta {
  id: string;
  nome: string;
  crefito: string | null;
  especialidade: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
  criadoEm: string;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-md shadow-2xl" style={{ backgroundColor: "#fff" }} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const emptyForm = { nome: "", crefito: "", especialidade: "", telefone: "", email: "" };
const ESPECIALIDADES = ["Ortopedia", "Neurologia", "Esportiva", "Pediátrica", "Respiratória", "Dermatofuncional", "Obstetrícia", "Geriatria", "Outra"];

export default function EquipePage() {
  const [equipe, setEquipe] = useState<Fisioterapeuta[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/fisioterapeutas");
    setEquipe(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function salvar() {
    if (!form.nome.trim()) return;
    setSaving(true);
    await fetch("/api/fisioterapeutas", {
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
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Equipe</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>{equipe.length} profissional{equipe.length !== 1 ? "is" : ""} cadastrado{equipe.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)", boxShadow: "0 4px 14px rgba(14,165,233,0.3)" }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo Profissional
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
        </div>
      ) : equipe.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ color: "#94a3b8" }}>
          <Building2 style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
          <p className="text-sm font-medium">Nenhum profissional cadastrado</p>
          <button onClick={() => setModalOpen(true)} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Adicionar primeiro profissional</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipe.map((f) => (
            <div key={f.id} className="rounded-2xl p-5" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ background: "linear-gradient(135deg, #0ea5e9, #10b981)" }}>
                  {f.nome.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: "#0f172a" }}>{f.nome}</p>
                  {f.especialidade && <p className="text-xs truncate" style={{ color: "#0ea5e9" }}>{f.especialidade}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: f.ativo ? "#d1fae5" : "#f1f5f9", color: f.ativo ? "#065f46" : "#64748b" }}>
                  {f.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="space-y-2">
                {f.crefito && (
                  <div className="flex items-center gap-2">
                    <BadgeCheck style={{ width: 13, height: 13, color: "#10b981", flexShrink: 0 }} />
                    <span className="text-xs font-medium" style={{ color: "#334155" }}>{f.crefito}</span>
                  </div>
                )}
                {f.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone style={{ width: 13, height: 13, color: "#94a3b8", flexShrink: 0 }} />
                    <span className="text-xs" style={{ color: "#64748b" }}>{f.telefone}</span>
                  </div>
                )}
                {f.email && (
                  <div className="flex items-center gap-2">
                    <Mail style={{ width: 13, height: 13, color: "#94a3b8", flexShrink: 0 }} />
                    <span className="text-xs truncate" style={{ color: "#64748b" }}>{f.email}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold" style={{ color: "#0f172a" }}>Novo Profissional</h2>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Nome completo *</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Dr(a). Nome Sobrenome" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>CREFITO</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.crefito} onChange={(e) => setForm(f => ({ ...f, crefito: e.target.value }))} placeholder="CREFITO-3/XXXXX-F" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Especialidade</label>
              <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0", color: form.especialidade ? "#334155" : "#94a3b8" }} value={form.especialidade} onChange={(e) => setForm(f => ({ ...f, especialidade: e.target.value }))}>
                <option value="">Selecionar...</option>
                {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Telefone</label>
              <input type="tel" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Email</label>
              <input type="email" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>Cancelar</button>
          <button onClick={salvar} disabled={saving || !form.nome.trim()} className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#0ea5e9" }}>
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
