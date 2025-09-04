import { RecoveryFooter } from "@/components/recovery-footer";
import { ShineBorder } from "@/components/shine-border";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecoverForm } from "./form";

export default function RecoverPasswordPage() {
  return (
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
      <CardFooter className="flex flex-col items-start">
        <RecoveryFooter />
      </CardFooter>
    </Card>
  );
}
