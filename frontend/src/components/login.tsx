import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProfile } from "@/hooks/use-profile";
import { User, Lock, AlertCircle } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  // Get the login method and state from the Zustand hook
  const { login, isLoading, error } = useProfile();

  // Local state for form inputs
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      // Call the login method from Zustand
      await login({
        username: username,
        password: password,
      });

      // Redirect on successful login
      window.location.href = "/";
    } catch (error) {
      // Handle any errors not caught by zustand
      setLocalError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 max-w-md mx-auto", className)}
      {...props}
    >
      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-3xl font-bold text-primary">
            Welcome Back!!
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Log in to continue your journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {(error || localError) && (
              <Alert
                variant="destructive"
                className="bg-destructive/10 border-destructive text-destructive"
              >
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Login Error</AlertTitle>
                <AlertDescription>
                  {error || localError || "Login failed. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            {/* Username Field */}
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <User size={18} />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 bg-background focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <a
                  href="#"
                  className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={18} />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-background focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?
              </span>{" "}
              <a
                href="/signup/"
                className="text-primary font-medium hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
