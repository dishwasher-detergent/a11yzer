import { Suspense } from "react";

import { ShineBorder } from "@/components/shine-border";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetForm } from "./form";

export default function ResetPasswordPage() {
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
        <CardTitle>Set New Password</CardTitle>
        <CardDescription>Please enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
