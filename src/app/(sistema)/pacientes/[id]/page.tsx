import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Phone, Mail, MapPin, ClipboardList, FileText, ShieldCheck } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

function calcularIdade(dataNascimento: string | null) {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  const idade = hoje.getFullYear() - nascimento.getFullYear();
  const mesDiff = hoje.getMonth() - nascimento.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
    return idade - 1;
  }
  return idade;
}

export default async function PacientePage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const paciente = await prisma.paciente.findUnique({
    where: { id },
  });

  if (!paciente) {
    notFound();
  }

  const idade = calcularIdade(paciente.dataNascimento);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/pacientes"
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "#0ea5e9" }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Voltar para pacientes
          </Link>
          <h1 className="text-2xl font-bold mt-4" style={{ color: "#0f172a" }}>{paciente.nome}</h1>
          <p className="text-sm mt-2" style={{ color: "#64748b" }}>
            {paciente.convenio ?? "Particular"} · {paciente.cpf ?? "CPF não informado"}
          </p>
        </div>
        <div className="rounded-2xl px-4 py-2 text-sm font-semibold" style={{ backgroundColor: paciente.ativo ? "#d1fae5" : "#f1f5f9", color: paciente.ativo ? "#065f46" : "#64748b" }}>
          {paciente.ativo ? "Ativo" : "Inativo"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "#0f172a" }}>
            <ShieldCheck style={{ width: 16, height: 16 }} /> Dados do paciente
          </div>
          <div className="space-y-4 text-sm" style={{ color: "#334155" }}>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] mb-1" style={{ color: "#64748b" }}>Nascimento</p>
              <p>{paciente.dataNascimento ? format(new Date(paciente.dataNascimento), "dd/MM/yyyy", { locale: ptBR }) : "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] mb-1" style={{ color: "#64748b" }}>Idade</p>
              <p>{idade !== null ? `${idade} anos` : "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] mb-1" style={{ color: "#64748b" }}>Telefone</p>
              <p>{paciente.telefone ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] mb-1" style={{ color: "#64748b" }}>Email</p>
              <p>{paciente.email ?? "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] mb-1" style={{ color: "#64748b" }}>Endereço</p>
              <p>{paciente.endereco ?? "Não informado"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold mb-4" style={{ color: "#0f172a" }}>
            <FileText style={{ width: 16, height: 16 }} /> Histórico
          </div>
          <div className="space-y-4 text-sm" style={{ color: "#334155" }}>
            <div className="flex items-center gap-2">
              <Phone style={{ width: 14, height: 14, color: "#94a3b8" }} />
              <span>{paciente.telefone ?? "Telefone não cadastrado"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail style={{ width: 14, height: 14, color: "#94a3b8" }} />
              <span>{paciente.email ?? "Email não cadastrado"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin style={{ width: 14, height: 14, color: "#94a3b8" }} />
              <span>{paciente.endereco ?? "Endereço não cadastrado"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
