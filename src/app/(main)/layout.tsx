import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Desktop navbar — hidden on mobile (TopSearchBar takes over) */}
      {/* <Navbar /> */}

      {/*
        Mobile: no extra top padding — TopSearchBar is sticky inside page.
        Desktop: Navbar adds its own spacer div internally.
      */}
      <main className="min-h-screen">{children}</main>

      {/* Footer — hidden on mobile via lg:block */}
      <div className="hidden lg:block">
        <Footer />
      </div>
    </>
  );
}