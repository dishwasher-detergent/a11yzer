export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid min-h-dvh p-2 md:p-0 w-full md:place-items-center bg-muted/25 relative">
      {children}
    </main>
  );
}
