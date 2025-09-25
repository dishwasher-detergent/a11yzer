import { RecoveryFooter } from "@/components/recovery-footer";
import { ShineBorder } from "@/components/shine-border";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecoverForm } from "./form";

export default function RecoverPasswordPage() {
  return (
    <div>
      <Card className="w-full max-w-sm relative z-10">
        <ShineBorder
          shineColor={[
            "var(--color-pink-300)",
            "var(--color-red-300)",
            "var(--color-yellow-300)",
            "var(--color-green-300)",
            "var(--color-blue-300)",
          ]}
        />
        <CardHeader>
          <CardTitle className="text-lg">Password Recovery</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a password reset
            link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecoverForm />
        </CardContent>
      </Card>
      <div className="max-w-sm border bg-secondary p-2 px-4 rounded-b-lg -mt-6 pt-8 mx-2">
        <RecoveryFooter />
      </div>
    </div>
  );
}
