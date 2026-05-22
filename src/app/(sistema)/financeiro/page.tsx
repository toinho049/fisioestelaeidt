"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, DollarSign, TrendingUp, TrendingDown, X, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Pagamento {
  id: string;
  pacienteId: string;
  valor: number;
  desconto: number;
  formaPagamento: string;
  status: string;
  dataVencimento: string | null;
  dataPagamento: string | null;
  descricao: string | null;
  criadoEm: string;
  paciente: { nome: string };
}

interface Totais {
  status: string;
  _sum: { valor: number | null };
}

interface Paciente { id: string; nome: string }

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  pago:      { bg: "#d1fae5", text: "#065f46", icon: CheckCircle },
  pendente:  { bg: "#fef3c7", text: "#92400e", icon: Clock },
  cancelado: { bg: "#fee2e2", text: "#991b1b", icon: X },
};

const FORMAS_PAGAMENTO = ["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia", "convenio"];
const FORMAS_LABEL: Record<string, string> = {
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  pix: "PIX",
  transferencia: "Transferência",
  convenio: "Convênio",
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

const emptyForm = {
  pacienteId: "", valor: "", desconto: "0",
  formaPagamento: "pix", status: "pendente",
  dataVencimento: "", dataPagamento: "", descricao: "",
};

export default function FinanceiroPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [totais, setTotais] = useState<Totais[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ mes: String(mes), ano: String(ano) });
    if (filtroStatus) params.set("status", filtroStatus);
    const res = await fetch(`/api/pagamentos?${params}`);
    const data = await res.json();
    setPagamentos(data.pagamentos);
    setTotais(data.totais);
    setLoading(false);
  }, [mes, ano, filtroStatus]);

  useEffect(() => {
    load();
    fetch("/api/pacientes").then(r => r.json()).then(setPacientes);
  }, [load]);

  const getTotalStatus = (status: string) => {
    const t = totais.find(t => t.status === status);
    return t?._sum?.valor ?? 0;
  };

  async function salvar() {
    if (!form.pacienteId || !form.valor) return;
    setSaving(true);
    await fetch("/api/pagamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setModalOpen(false);
    setForm(emptyForm);
    load();
  }

  async function marcarPago(id: string) {
    await fetch(`/api/pagamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pago", dataPagamento: new Date().toISOString() }),
    });
    load();
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este pagamento?")) return;
    await fetch(`/api/pagamentos/${id}`, { method: "DELETE" });
    load();
  }

  const recebido = getTotalStatus("pago");
  const pendente = getTotalStatus("pendente");
  const total = recebido + pendente;

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#0f172a" }}>Financeiro</h1>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
            {meses[mes - 1]} de {ano}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month selector */}
          <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ border: "1px solid #e2e8f0", backgroundColor: "#fff" }}>
            <select className="text-sm outline-none" style={{ color: "#334155", backgroundColor: "transparent" }} value={mes} onChange={(e) => setMes(Number(e.target.value))}>
              {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select className="text-sm outline-none" style={{ color: "#334155", backgroundColor: "transparent" }} value={ano} onChange={(e) => setAno(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: "#0ea5e9" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0284c7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0ea5e9"; }}
          >
            <Plus style={{ width: 15, height: 15 }} />
            Lançar Pagamento
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total do Período", value: total, icon: DollarSign, color: "#0ea5e9", subtitle: `${pagamentos.length} lançamentos` },
          { label: "Recebido", value: recebido, icon: TrendingUp, color: "#10b981", subtitle: "Pagamentos confirmados" },
          { label: "Pendente", value: pendente, icon: TrendingDown, color: "#f59e0b", subtitle: "Aguardando pagamento" },
        ].map(({ label, value, icon: Icon, color, subtitle }) => (
          <div key={label} className="rounded-xl p-5 flex items-start gap-4" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="rounded-xl p-2.5 flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
              <Icon style={{ width: 22, height: 22, color }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "#64748b" }}>{label}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: "#0f172a" }}>
                R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#fff", border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
          <div className="flex gap-2">
            {["", "pago", "pendente", "cancelado"].map(s => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{
                  backgroundColor: filtroStatus === s ? "#0ea5e9" : "transparent",
                  color: filtroStatus === s ? "#fff" : "#64748b",
                  border: filtroStatus === s ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                }}
              >
                {s === "" ? "Todos" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: "#94a3b8" }}>{pagamentos.length} registros</p>
        </div>

        {/* Table Header */}
        <div
          className="grid text-xs font-semibold px-5 py-3"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px", color: "#64748b", borderBottom: "1px solid #f1f5f9" }}
        >
          <span>Paciente</span>
          <span>Valor</span>
          <span>Forma</span>
          <span>Vencimento</span>
          <span>Status</span>
          <span />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#e2e8f0", borderTopColor: "#0ea5e9" }} />
          </div>
        ) : pagamentos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16" style={{ color: "#94a3b8" }}>
            <DollarSign style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.3 }} />
            <p className="text-sm font-medium">Nenhum lançamento encontrado</p>
            <button onClick={() => setModalOpen(true)} className="text-xs mt-2 font-medium" style={{ color: "#0ea5e9" }}>Criar primeiro lançamento</button>
          </div>
        ) : (
          pagamentos.map((pg, i) => {
            const cfg = STATUS_STYLES[pg.status] ?? STATUS_STYLES.pendente;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={pg.id}
                className="grid items-center px-5 py-3.5 text-sm"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px",
                  borderBottom: i < pagamentos.length - 1 ? "1px solid #f8fafc" : "none",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: `hsl(${pg.paciente.nome.charCodeAt(0) * 5 % 360}, 60%, 55%)` }}>
                    {pg.paciente.nome.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate" style={{ color: "#0f172a" }}>{pg.paciente.nome}</p>
                    {pg.descricao && <p className="text-xs truncate" style={{ color: "#94a3b8" }}>{pg.descricao}</p>}
                  </div>
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "#0f172a" }}>
                    R$ {pg.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  {pg.desconto > 0 && (
                    <p className="text-xs" style={{ color: "#94a3b8" }}>desc. R$ {pg.desconto.toFixed(2)}</p>
                  )}
                </div>
                <p style={{ color: "#64748b" }}>{FORMAS_LABEL[pg.formaPagamento] ?? pg.formaPagamento}</p>
                <p style={{ color: "#64748b" }}>
                  {pg.dataVencimento ? format(new Date(pg.dataVencimento), "dd/MM/yyyy") : "—"}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
                  <StatusIcon style={{ width: 10, height: 10 }} />
                  {pg.status.charAt(0).toUpperCase() + pg.status.slice(1)}
                </span>
                <div className="flex gap-2 justify-end">
                  {pg.status === "pendente" && (
                    <button
                      onClick={() => marcarPago(pg.id)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ backgroundColor: "#d1fae5", color: "#065f46" }}
                      title="Marcar como pago"
                    >
                      Pago
                    </button>
                  )}
                  <button
                    onClick={() => excluir(pg.id)}
                    className="text-xs font-medium px-2 py-1 rounded-lg"
                    style={{ backgroundColor: "#fee2e2", color: "#991b1b" }}
                    title="Excluir"
                  >
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Novo Pagamento */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold" style={{ color: "#0f172a" }}>Lançar Pagamento</h2>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Paciente *</label>
            <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0", color: "#334155" }} value={form.pacienteId} onChange={(e) => setForm(f => ({ ...f, pacienteId: e.target.value }))}>
              <option value="">Selecionar paciente...</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Valor (R$) *</label>
              <input type="number" step="0.01" min="0" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.valor} onChange={(e) => setForm(f => ({ ...f, valor: e.target.value }))} placeholder="0,00" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Desconto (R$)</label>
              <input type="number" step="0.01" min="0" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.desconto} onChange={(e) => setForm(f => ({ ...f, desconto: e.target.value }))} placeholder="0,00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Forma de Pagamento</label>
              <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0", color: "#334155" }} value={form.formaPagamento} onChange={(e) => setForm(f => ({ ...f, formaPagamento: e.target.value }))}>
                {FORMAS_PAGAMENTO.map(fp => <option key={fp} value={fp}>{FORMAS_LABEL[fp]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Status</label>
              <select className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0", color: "#334155" }} value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Data de Vencimento</label>
              <input type="date" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.dataVencimento} onChange={(e) => setForm(f => ({ ...f, dataVencimento: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Data de Pagamento</label>
              <input type="date" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.dataPagamento} onChange={(e) => setForm(f => ({ ...f, dataPagamento: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Descrição</label>
            <input type="text" className="w-full text-sm rounded-lg px-3 py-2 outline-none" style={{ border: "1px solid #e2e8f0" }} value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Sessão de fisioterapia, avaliação..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-lg font-medium" style={{ border: "1px solid #e2e8f0", color: "#64748b" }}>Cancelar</button>
          <button onClick={salvar} disabled={saving || !form.pacienteId || !form.valor} className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50" style={{ backgroundColor: "#0ea5e9" }}>
            {saving ? "Salvando..." : "Lançar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
