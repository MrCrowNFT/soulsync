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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/hooks/use-profile";

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
      // Call signup method from Zustand hook
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* Error alert for API errors */}
              {(errors.requestError || error) && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {errors.requestError || error || "Signup failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Username Field */}
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Field */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name Field */}
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Gender Field */}
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
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
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Photo URL Field (Optional) */}
              <div className="grid gap-2">
                <Label htmlFor="photo">Profile Photo URL (Optional)</Label>
                <Input
                  id="photo"
                  type="text"
                  placeholder="Enter profile photo URL"
                  value={formData.photo}
                  onChange={handleChange}
                />
              </div>

              {/* Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {errors.passwordMismatch && (
                  <p className="text-sm text-red-500">
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/login/" className="underline underline-offset-4">
                Log in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}