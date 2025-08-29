import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

export function OnboardingCard() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>Welcome to AI Accessibility Checker</CardTitle>
          <CardDescription>
            To get started, you'll need to create or join a team. Teams help
            organize your accessibility analyses and collaborate with others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Create your first team to begin analyzing websites for
              accessibility issues.
            </p>
            <Button asChild className="w-full">
              <Link href="/teams/create">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Already have a team invitation? Check your email for the invite
              link.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
