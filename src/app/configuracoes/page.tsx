export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black" style={{ color: "#0f172a" }}>Configurações</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            Ajuste preferências e informações do sistema.
          </p>
        </div>
      </div>

      <div className="rounded-3xl p-6" style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <p className="text-sm" style={{ color: "#475569" }}>
          Esta seção ainda não foi implementada. Em breve você poderá configurar preferências da clínica, integrações e informações da conta.
        </p>
      </div>
    </div>
  );
}
