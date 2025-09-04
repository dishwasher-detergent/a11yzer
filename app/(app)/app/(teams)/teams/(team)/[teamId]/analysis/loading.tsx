import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="overflow-hidden h-dvh flex flex-col flex-nowrap justify-end px-4 pb-4 md:px-8 md:pb-8">
      <Skeleton className="w-full h-16" />
    </main>
  );
}
