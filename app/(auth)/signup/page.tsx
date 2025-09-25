import { ShineBorder } from "@/components/shine-border";
import { SignUpFooter } from "@/components/signup-footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "./form";

export default function SignUpPage() {
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
          <CardTitle className="text-lg">Sign Up</CardTitle>
          <CardDescription>
            Enter your email below to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignUpForm />
        </CardContent>
      </Card>
      <div className="max-w-sm border bg-secondary p-2 px-4 rounded-b-lg -mt-6 pt-8 mx-2">
        <SignUpFooter />
      </div>
    </div>
  );
}
