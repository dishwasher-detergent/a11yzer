import { Hue } from "@/components/hue";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid min-h-dvh p-2 md:p-0 w-full md:place-items-center bg-muted relative">
      {children}
      <div className="absolute top-1/2 translate-y-1/2 w-full hidden md:grid place-items-center z-0">
        <Hue />
      </div>
    </main>
  );
}
