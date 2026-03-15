"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function SignInForm({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting sign in with:", { email, password });
      await signIn.email({
        email,
        password,
      });
      toast.success("Signed in successfully!");
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error("Invalid email or password");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-none bg-[#fdfaf7] shadow-2xl ring-1 ring-[#c9ada7]/50">
      <CardHeader className="space-y-1 pb-6 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-[#4a331f]">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-[#8d7a6d]">
          Enter your details to continue your journey
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#4a331f]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-[#d6ccc2] focus:ring-2 focus:ring-[#9a8c98] focus:border-[#9a8c98] transition-all"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-[#4a331f]">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-[#d6ccc2] focus:ring-2 focus:ring-[#9a8c98] focus:border-[#9a8c98] transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <Button
            type="submit"
            className="w-full bg-[#4a331f] hover:bg-[#3d2817] text-white py-6 text-lg shadow-lg active:scale-[0.98] transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </Button>
          <p className="text-sm text-center text-[#8d7a6d]">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onToggle}
              className="text-[#4a331f] hover:underline font-semibold"
            >
              Create one for free
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
