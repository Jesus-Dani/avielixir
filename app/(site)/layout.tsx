import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PrivacyGate } from "@/components/layout/PrivacyGate";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PrivacyGate />
      <WhatsAppButton />
    </>
  );
}
