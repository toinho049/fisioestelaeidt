"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, X, ClipboardList } from "lucide-react";
import AvaliacaoModal from "@/components/AvaliacaoModal";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00 - 20:00

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  agendado:  { bg: "#dbeafe", text: "#1d4ed8", border: "#3b82f6" },
  confirmado:{ bg: "#d1fae5", text: "#065f46", border: "#10b981" },
  realizado: { bg: "#e0e7ff", text: "#3730a3", border: "#6366f1" },
  cancelado: { bg: "#fee2e2", text: "#991b1b", border: "#ef4444" },
  faltou:    { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
};


interface Paciente { id: string; nome: string }
interface Fisioterapeuta { id: string; nome: string }
interface Agendamento {
  id: string;
  pacienteId: string;
  fisioterapeutaId: string | null;
  data: string;
  duracao: number;
  status: string;
  tipo: string;
  observacoes: string | null;
  sala: string | null;
  paciente: { id: string; nome: string };
  fisioterapeuta?: { id: string; nome: string } | null;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-2xl w-full max-w-lg shadow-2xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const [semanaAtual, setSemanaAtual] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [fisios, setFisios] = useState<Fisioterapeuta[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<Agendamento | null>(null);
  const [avaliacaoModal, setAvaliacaoModal] = useState(false);
  const [pacienteParaAvaliar, setPacienteParaAvaliar] = useState<string | undefined>();
  const [filtroFisio, setFiltroFisio] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [form, setForm] = useState({
    pacienteId: "",
    fisioterapeutaId: "",
    data: "",
    hora: "08:00",
    duracao: 50,
    tipo: "consulta",
    status: "agendado",
    sala: "",
    observacoes: "",
  });
  const [saving, setSaving] = useState(false);

  const inicioSemana = startOfWeek(semanaAtual, { weekStartsOn: 1 });
  const diasSemana = Array.from({ length: 6 }, (_, i) => addDays(inicioSemana, i));

  const loadAgendamentos = useCallback(async () => {
    const inicio = format(inicioSemana, "yyyy-MM-dd'T'00:00:00");
    const fim = format(addDays(inicioSemana, 6), "yyyy-MM-dd'T'23:59:59");
    const params = new URLSearchParams({ inicio, fim });
    if (filtroFisio) params.set("fisioterapeutaId", filtroFisio);
    if (filtroStatus) params.set("status", filtroStatus);
    const res = await fetch(`/api/agendamentos?${params}`);
    const data = await res.json();
    setAgendamentos(data);
  }, [semanaAtual, filtroFisio, filtroStatus]);

  useEffect(() => {
    loadAgendamentos();
    fetch("/api/pacientes").then(r => r.json()).then(setPacientes);
    fetch("/api/fisioterapeutas").then(r => r.json()).then(setFisios);
  }, [loadAgendamentos]);

  const agendamentosDia = (dia: Date) =>
    agendamentos.filter(ag => isSameDay(parseISO(ag.data), dia));

  async function salvarAgendamento() {
    if (!form.pacienteId || !form.data) return;
    setSaving(true);
    const dataHora = `${form.data}T${form.hora}:00`;
    await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, data: dataHora }),
    });
    setSaving(false);
    setModalOpen(false);
    setForm({ pacienteId: "", fisioterapeutaId: "", data: "", hora: "08:00", duracao: 50, tipo: "consulta", status: "agendado", sala: "", observacoes: "" });
    loadAgendamentos();
  }

  async function atualizarStatus(id: string, status: string) {
    await fetch(`/api/agendamentos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setDetailModal(null);
    loadAgendamentos();
  }

  async function excluirAgendamento(id: string) {
    if (!confirm("Excluir este agendamento?")) return;
    await fetch(`/api/agendamentos/${id}`, { method: "DELETE" });
    setDetailModal(null);
    loadAgendamentos();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
        style={{ backgroundColor: "#fff", borderBottom: "1px solid #f1f5f9" }}
      >
        {/* Filters */}
        <select
          className="text-sm rounded-lg px-3 py-1.5 outline-none"
          style={{ border: "1px solid #e2e8f0", color: "#334155", backgroundColor: "#f8fafc" }}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="agendado">Agendado</option>
          <option value="confirmado">Confirmado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
          <option value="faltou">Faltou</option>
        </select>

        <select
          className="text-sm rounded-lg px-3 py-1.5 outline-none"
          style={{ border: "1px solid #e2e8f0", color: "#334155", backgroundColor: "#f8fafc" }}
          value={filtroFisio}
          onChange={(e) => setFiltroFisio(e.target.value)}
        >
          <option value="">Todos os profissionais</option>
          {fisios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>

        <div className="flex-1" />

        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSemanaAtual(subWeeks(semanaAtual, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            <ChevronLeft style={{ width: 14, height: 14, color: "#64748b" }} />
          </button>
          <span className="text-sm font-semibold px-2" style={{ color: "#0f172a" }}>
            {format(inicioSemana, "dd MMM", { locale: ptBR })} – {format(addDays(inicioSemana, 5), "dd MMM 'de' yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setSemanaAtual(addWeeks(semanaAtual, 1))}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            <ChevronRight style={{ width: 14, height: 14, color: "#64748b" }} />
          </button>
          <button
            onClick={() => setSemanaAtual(new Date())}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ml-1"
            style={{ border: "1px solid #e2e8f0", color: "#64748b", backgroundColor: "#f8fafc" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f8fafc"; }}
          >
            Hoje
          </button>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: "#0ea5e9" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0284c7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#0ea5e9"; }}
        >
          <Plus style={{ width: 15, height: 15 }} />
          Novo Agendamento
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: "#f8fafc" }}>
        <div style={{ display: "grid", gridTemplateColumns: "56px repeat(6, 1fr)", minWidth: 700 }}>
          {/* Header Row */}
          <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, zIndex: 10 }} />
          {diasSemana.map((dia) => {
            const isHoje = isSameDay(dia, new Date());
            return (
              <div
                key={dia.toISOString()}
                className="text-center py-2.5 text-xs font-semibold"
                style={{
                  backgroundColor: "#fff",
                  borderBottom: "1px solid #f1f5f9",
                  borderLeft: "1px solid #f1f5f9",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  color: isHoje ? "#0ea5e9" : "#64748b",
                }}
              >
                <div style={{ color: isHoje ? "#0ea5e9" : "#94a3b8", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.05em" }}>
                  {format(dia, "EEE", { locale: ptBR })}
                </div>
                <div
                  className="mx-auto mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: isHoje ? "#0ea5e9" : "transparent",
                    color: isHoje ? "#fff" : "#0f172a",
                  }}
                >
                  {format(dia, "d")}
                </div>
              </div>
            );
          })}

          {/* Time + Events */}
          {HOURS.map((hora) => (
            <>
              <div
                key={`time-${hora}`}
                className="text-right pr-2 text-xs flex-shrink-0"
                style={{
                  height: 56,
                  paddingTop: 4,
                  color: "#94a3b8",
                  borderBottom: "1px solid #f1f5f9",
                  backgroundColor: "#fff",
                }}
              >
                {String(hora).padStart(2, "0")}:00
              </div>
              {diasSemana.map((dia) => {
                const isHoje = isSameDay(dia, new Date());
                const eventos = agendamentosDia(dia).filter(ag => {
                  const h = new Date(ag.data).getHours();
                  return h === hora;
                });
                return (
                  <div
                    key={`${dia.toISOString()}-${hora}`}
                    className="relative"
                    style={{
                      height: 56,
                      borderBottom: "1px solid #f1f5f9",
                      borderLeft: "1px solid #f1f5f9",
                      backgroundColor: isHoje ? "#fafeff" : "#fff",
                    }}
                    onClick={() => {
                      const dataStr = format(dia, "yyyy-MM-dd");
                      const horaStr = `${String(hora).padStart(2, "0")}:00`;
                      setForm(f => ({ ...f, data: dataStr, hora: horaStr }));
                      setModalOpen(true);
                    }}
                  >
                    {eventos.map(ag => {
                      const cor = STATUS_COLORS[ag.status] ?? STATUS_COLORS.agendado;
                      const min = new Date(ag.data).getMinutes();
                      const topPx = (min / 60) * 56;
                      const heightPx = Math.max((ag.duracao / 60) * 56 - 2, 20);
                      return (
                        <div
                          key={ag.id}
                          onClick={(e) => { e.stopPropagation(); setDetailModal(ag); }}
                          className="absolute left-0.5 right-0.5 rounded px-1.5 overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                          style={{
                            top: topPx,
                            height: heightPx,
                            backgroundColor: cor.bg,
                            borderLeft: `3px solid ${cor.border}`,
                            zIndex: 5,
                          }}
                        >
                          <p className="text-xs font-semibold truncate leading-tight mt-0.5" style={{ color: cor.text }}>
                            {ag.paciente.nome.split(" ")[0]}
                          </p>
                          {heightPx > 30 && (
                            <p className="text-xs truncate" style={{ color: cor.text, opacity: 0.7, fontSize: 10 }}>
                              {format(new Date(ag.data), "HH:mm")} · {ag.tipo}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Modal - Novo Agendamento */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
          <h2 className="font-semibold" style={{ color: "#0f172a" }}>Novo Agendamento</h2>
          <button onClick={() => setModalOpen(false)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Paciente *</label>
            <select
              className="w-full text-sm rounded-lg px-3 py-2 outline-none"
              style={{ border: "1px solid #e2e8f0", color: "#334155" }}
              value={form.pacienteId}
              onChange={(e) => setForm(f => ({ ...f, pacienteId: e.target.value }))}
            >
              <option value="">Selecionar paciente...</option>
              {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Data *</label>
              <input
                type="date"
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ border: "1px solid #e2e8f0", color: "#334155" }}
                value={form.data}
                onChange={(e) => setForm(f => ({ ...f, data: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Hora *</label>
              <input
                type="time"
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ border: "1px solid #e2e8f0", color: "#334155" }}
                value={form.hora}
                onChange={(e) => setForm(f => ({ ...f, hora: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Tipo</label>
              <select
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ border: "1px solid #e2e8f0", color: "#334155" }}
                value={form.tipo}
                onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}
              >
                <option value="consulta">Consulta</option>
                <option value="retorno">Retorno</option>
                <option value="avaliacao">Avaliação</option>
                <option value="procedimento">Procedimento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Duração (min)</label>
              <input
                type="number"
                min={10}
                max={180}
                step={5}
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ border: "1px solid #e2e8f0", color: "#334155" }}
                value={form.duracao}
                onChange={(e) => setForm(f => ({ ...f, duracao: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Profissional</label>
              <select
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ border: "1px solid #e2e8f0", color: "#334155" }}
                value={form.fisioterapeutaId}
                onChange={(e) => setForm(f => ({ ...f, fisioterapeutaId: e.target.value }))}
              >
                <option value="">Selecionar...</option>
                {fisios.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Sala</label>
              <input
                type="text"
                placeholder="Ex: Sala 1"
                className="w-full text-sm rounded-lg px-3 py-2 outline-none"
                style={{ border: "1px solid #e2e8f0", color: "#334155" }}
                value={form.sala}
                onChange={(e) => setForm(f => ({ ...f, sala: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#64748b" }}>Observações</label>
            <textarea
              rows={2}
              className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-none"
              style={{ border: "1px solid #e2e8f0", color: "#334155" }}
              value={form.observacoes}
              onChange={(e) => setForm(f => ({ ...f, observacoes: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 text-sm rounded-lg font-medium"
            style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
          >
            Cancelar
          </button>
          <button
            onClick={salvarAgendamento}
            disabled={saving || !form.pacienteId || !form.data}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#0ea5e9" }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </Modal>

      {/* Modal - Detalhe */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)}>
        {detailModal && (
          <>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <h2 className="font-semibold" style={{ color: "#0f172a" }}>{detailModal.paciente.nome}</h2>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  {format(parseISO(detailModal.data), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
              <button onClick={() => setDetailModal(null)}><X style={{ width: 18, height: 18, color: "#94a3b8" }} /></button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Tipo</p>
                  <p className="text-sm font-medium mt-0.5 capitalize" style={{ color: "#0f172a" }}>{detailModal.tipo}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Duração</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "#0f172a" }}>{detailModal.duracao} min</p>
                </div>
                {detailModal.sala && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>Sala</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "#0f172a" }}>{detailModal.sala}</p>
                  </div>
                )}
                {detailModal.fisioterapeuta && (
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>Profissional</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "#0f172a" }}>{detailModal.fisioterapeuta.nome}</p>
                  </div>
                )}
              </div>
              {detailModal.observacoes && (
                <div className="p-3 rounded-lg" style={{ backgroundColor: "#f8fafc" }}>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Observações</p>
                  <p className="text-sm mt-0.5" style={{ color: "#0f172a" }}>{detailModal.observacoes}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "#64748b" }}>Alterar Status</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_COLORS).map(([s, c]) => (
                    <button
                      key={s}
                      onClick={() => atualizarStatus(detailModal.id, s)}
                      className="text-xs font-medium px-3 py-1 rounded-full transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: c.bg,
                        color: c.text,
                        border: detailModal.status === s ? `2px solid ${c.border}` : "2px solid transparent",
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between px-6 py-4" style={{ borderTop: "1px solid #f1f5f9" }}>
              <button
                onClick={() => excluirAgendamento(detailModal.id)}
                className="text-sm font-medium px-4 py-2 rounded-lg"
                style={{ color: "#ef4444", border: "1px solid #fee2e2" }}
              >
                Excluir
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => { setPacienteParaAvaliar(detailModal.pacienteId); setDetailModal(null); setAvaliacaoModal(true); }}
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-white"
                  style={{ background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)" }}
                >
                  <ClipboardList style={{ width: 14, height: 14 }} />
                  Avaliar
                </button>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-sm font-medium px-4 py-2 rounded-lg"
                  style={{ border: "1px solid #e2e8f0", color: "#64748b" }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>

      <AvaliacaoModal
        open={avaliacaoModal}
        onClose={() => setAvaliacaoModal(false)}
        onSaved={() => {}}
        pacienteIdInicial={pacienteParaAvaliar}
        pacientes={pacientes}
      />
    </div>
  );
}
