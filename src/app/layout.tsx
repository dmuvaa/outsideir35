import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { getDbRole } from "@/lib/auth-role";
import { SITE_URL } from "@/lib/platform";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "OutsideIR35 - Contract Jobs & Compliance Portal",
  description: "The premium search engine for Outside IR35, SC/DV Cleared, and high-paying UK contract opportunities across tech, finance, construction, and healthcare.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  const user = data?.user
    ? { email: data.user.email, role: await getDbRole(supabase, data.user) }
    : null;

  return (
    <html lang="en">
      <body>
        <Navbar user={user} />
        <main style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
