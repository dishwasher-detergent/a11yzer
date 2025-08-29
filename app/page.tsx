import Link from "next/link";

import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getLoggedInUser } from "@/lib/auth";

export default async function Home() {
  const user = await getLoggedInUser();

  return (
    <>
      <header className="w-full border-b">
        <nav className="max-w-4xl mx-auto flex justify-between items-center py-2 px-4">
          <h1 className="font-bold">
            <Link href="/app">AI Accessibility Checker</Link>
          </h1>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {user ? (
              <Button size="sm" asChild>
                <Link href="/app">Go to App</Link>
              </Button>
            ) : (
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
