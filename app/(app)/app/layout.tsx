import { Nav } from "@/components/ui/nav";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex w-full grow flex-col bg-muted">
      <Nav />
      <section className="mx-auto max-w-6xl w-full border-x flex-1 bg-background">
        {children}
      </section>
    </main>
  );
}
