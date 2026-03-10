import { ClientLayoutWrapper } from "./ClientLayoutWrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Membungkus seluruh halaman di route (main) dengan aturan UI pintar
    <ClientLayoutWrapper>
      {children}
    </ClientLayoutWrapper>
  );
}