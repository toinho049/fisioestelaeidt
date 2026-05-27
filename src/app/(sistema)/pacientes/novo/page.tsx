"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const emptyForm = {
  nome: "", cpf: "", dataNascimento: "", telefone: "", email: "",
  endereco: "", convenio: "", numeroConvenio: "", observacoes: "",
};

export default function NovoPacientePage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function salvar() {
    if (!form.nome.trim()) return;
    setSaving(true);
    const res = await fetch("/api/pacientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const created = await res.json();
    router.push(`/pacientes/${created.id}`);
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/pacientes" className="inline-flex items-center gap-1.5 text-sm" style={{ color: "#64748b" }}>
        <ArrowLeft style={{ width: 15, height: 15 }} /> Voltar
      </Link>

      <div className="rounded-xl p-6" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <h1 className="font-bold text-lg mb-5" style={{ color: "#0f172a" }}>Novo Paciente</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Nome completo *</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Nome completo do paciente" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>CPF</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.cpf} onChange={(e) => setForm(f => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Data de Nascimento</label>
              <input type="date" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.dataNascimento} onChange={(e) => setForm(f => ({ ...f, dataNascimento: e.target.value }))} onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Telefone</label>
              <input type="tel" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(00) 00000-0000" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Email</label>
              <input type="email" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Endereço</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.endereco} onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro, cidade — CEP" onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Convênio</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.convenio} onChange={(e) => setForm(f => ({ ...f, convenio: e.target.value }))} placeholder="Particular, Unimed..." onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Número do Convênio</label>
              <input type="text" className="w-full text-sm rounded-lg px-3 py-2.5 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.numeroConvenio} onChange={(e) => setForm(f => ({ ...f, numeroConvenio: e.target.value }))} onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Observações</label>
            <textarea rows={3} className="w-full text-sm rounded-lg px-3 py-2.5 outline-none resize-none" style={{ border: "1px solid #e2e8f0" }} value={form.observacoes} onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))} onFocus={(e) => { e.target.style.borderColor = "#0ea5e9"; }} onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }} />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-5" style={{ borderTop: "1px solid #f1f5f9" }}>
          <Link href="/pacientes" className="px-4 py-2 text-sm rounded-lg font-medium" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>Cancelar</Link>
          <button onClick={salvar} disabled={saving || !form.nome.trim()} className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#0ea5e9" }}>
            {saving ? "Salvando..." : "Cadastrar Paciente"}
          </button>
        </div>
      </div>
    </div>
  );
}
