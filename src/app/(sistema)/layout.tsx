import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Sidebar />
      <Header />
      <main
        style={{
          marginLeft: 240,
          marginTop: 56,
          minHeight: "calc(100vh - 56px)",
          padding: "24px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
