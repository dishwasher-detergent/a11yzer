import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="p-4 overflow-y-auto">
      <h3 className="font-semibold text-base mb-2">Analysis History</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 3xl:grid-cols-8 grid-cols-1 gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square w-full" />
        ))}
      </div>
    </main>
  );
}
