import { ShineBorder } from "@/components/shine-border";
import { SignUpFooter } from "@/components/signup-footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "./form";

export default function SignUpPage() {
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
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Enter your email below to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignUpForm />
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <SignUpFooter />
      </CardFooter>
    </Card>
  );
}
