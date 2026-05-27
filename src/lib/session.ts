import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireClinicaId(): Promise<{ clinicaId: string } | NextResponse> {
  const session = await getSession();
  if (!session?.user?.clinicaId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return { clinicaId: session.user.clinicaId };
}
