import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl space-y-6">
        <CardHeader className="flex flex-col items-center text-center space-y-4">
          <Check className="h-12 w-12 text-primary" />
          <CardTitle className="text-2xl font-bold">Welcome to Coaching OS</CardTitle>
          <CardDescription className="text-muted-foreground">
            Get started by setting up your coaching business profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Let's set up your profile to get the most out of Coaching OS
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end space-x-3">
          <a className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted" href="/dashboard">
            Skip for now
          </a>
          <a className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90" href="/dashboard/business-profile">
            Get Started
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
