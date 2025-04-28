import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/use-profile";
import { User, Mail, Lock, Calendar, Image, AlertCircle } from "lucide-react";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { signup, isLoading, error } = useProfile();

  // State to manage form inputs
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    lastName: "",
    gender: "prefer-not-to-say" as "male" | "female" | "non-binary" | "other" | "prefer-not-to-say",
    birthDate: "",
    photo: "",
  });

  // State to manage validation errors
  const [errors, setErrors] = useState({
    passwordMismatch: false,
    requestError: null as string | null,
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle select changes
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value as "male" | "female" | "non-binary" | "other" | "prefer-not-to-say",
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password and confirm password
    if (formData.password !== formData.confirmPassword) {
      setErrors({ ...errors, passwordMismatch: true });
      return; // Stop form submission if passwords don't match
    }

    // Reset errors
    setErrors({ passwordMismatch: false, requestError: null });

    try {
      await signup({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        name: formData.name,
        lastName: formData.lastName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        photo: formData.photo || undefined,
      });
      
      // Redirect on success
      window.location.href = "/login";
    } catch (error) {
      // Handle errors
      setErrors({
        ...errors,
        requestError: error instanceof Error ? error.message : "Signup failed. Please try again.",
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 max-w-md mx-auto", className)} {...props}>
      <Card className="border-border shadow-lg">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-3xl font-bold text-primary">Join SoulSync</CardTitle>
          <CardDescription className="text-muted-foreground">Create your account to start your journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error alert for API errors */}
            {(errors.requestError || error) && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-semibold">Sign Up Error</AlertTitle>
                <AlertDescription>
                  {errors.requestError || error || "Signup failed. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-background focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-background focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-background focus:border-primary focus:ring-primary"
                />
              </div>

              {/* Last Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-background focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Gender Field */}
              <div className="grid gap-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="bg-background focus:border-primary focus:ring-primary">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Birth Date Field */}
              <div className="grid gap-2">
                <Label htmlFor="birthDate" className="text-sm font-medium">
                  Birth Date
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <Calendar size={18} />
                  </div>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-background focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Photo URL Field */}
            <div className="grid gap-2">
              <Label htmlFor="photo" className="text-sm font-medium">
                Profile Photo URL <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                  <Image size={18} />
                </div>
                <Input
                  id="photo"
                  type="text"
                  placeholder="Enter profile photo URL"
                  value={formData.photo}
                  onChange={handleChange}
                  className="pl-10 bg-background focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 bg-background focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={cn(
                      "pl-10 bg-background focus:border-primary focus:ring-primary",
                      errors.passwordMismatch && "border-destructive focus:border-destructive"
                    )}
                  />
                </div>
                {errors.passwordMismatch && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle size={14} />
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? "Creating your account..." : "Create Account"}
            </Button>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Already have an account?</span>{" "}
              <a 
                href="/login/" 
                className="text-primary font-medium hover:text-primary/80 underline underline-offset-4 transition-colors"
              >
                Log in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}