"use client";

import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function SignUpForm({ onToggle }: { onToggle: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signUp.email({
        email,
        password,
        name,
      });
      toast.success("Account created successfully!");
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error(error?.message || "Failed to create account");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-none bg-[#fdfaf7] shadow-2xl ring-1 ring-[#c9ada7]/50">
      <CardHeader className="space-y-1 pb-6 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-[#4a331f]">
          Create Account
        </CardTitle>
        <CardDescription className="text-[#8d7a6d]">
          Join us and start your next big project
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#4a331f] font-medium">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white border-[#d6ccc2] focus:ring-2 focus:ring-[#9a8c98] focus:border-[#9a8c98] transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-[#4a331f] font-medium">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white border-[#d6ccc2] focus:ring-2 focus:ring-[#9a8c98] focus:border-[#9a8c98] transition-all"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-[#4a331f] font-medium">Password</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                className="bg-white border-[#d6ccc2] focus:ring-2 focus:ring-[#9a8c98] focus:border-[#9a8c98] transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-[#4a331f] font-medium">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                className="bg-white border-[#d6ccc2] focus:ring-2 focus:ring-[#9a8c98] focus:border-[#9a8c98] transition-all"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button
            type="submit"
            className="w-full bg-[#4a331f] hover:bg-[#3d2817] text-white py-6 text-lg shadow-lg active:scale-[0.98] transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Get Started"}
          </Button>
          <p className="text-sm text-center text-[#8d7a6d]">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggle}
              className="text-[#4a331f] hover:underline font-semibold transition-colors"
            >
              Sign in here
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
