"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { UserNav } from "@/components/auth/UserNav";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Database } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { data: session, isPending } = useSession();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f5ebe0] via-[#e3d5ca] to-[#d6ccc2]">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Ultimate Starter</span>
          </div>
          <nav className="flex items-center space-x-4">
            {isPending ? (
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <UserNav />
              </>
            ) : (
              <Button onClick={() => setShowAuth(true)}>Sign In</Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          The Ultimate Next.js Starter
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Built with Next.js, Tailwind CSS, Better Auth, and Prisma.
          Everything you need to build your next project.
        </p>
        <div className="flex justify-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <Button size="lg">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Button size="lg" onClick={() => setShowAuth(true)}>
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border-2 border-[#c9ada7] rounded-lg bg-card hover:shadow-lg transition-shadow">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Built on Next.js with optimized performance and modern React features.
            </p>
          </div>
          <div className="p-6 border-2 border-[#c9ada7] rounded-lg bg-card hover:shadow-lg transition-shadow">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
            <p className="text-muted-foreground">
              Better Auth integration with email/password and social providers.
            </p>
          </div>
          <div className="p-6 border-2 border-[#c9ada7] rounded-lg bg-card hover:shadow-lg transition-shadow">
            <Database className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Type-Safe Database</h3>
            <p className="text-muted-foreground">
              Prisma ORM with PostgreSQL for reliable data management.
            </p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && !session && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => {
            setShowAuth(false);
            setShowSignUp(false);
          }}
        >
          {/* Refined Backdrop: Using a darker, more neutral wash to let the warm card pop */}
          <div
            className="absolute inset-0 bg-[#22150b]/60 backdrop-blur-sm animate-in fade-in duration-300"
            aria-hidden="true"
          />

          <div
            className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Improved Close Button */}
            <button
              onClick={() => {
                setShowAuth(false);
                setShowSignUp(false);
              }}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border border-[#c9ada7] flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground hover:border-destructive z-20 shadow-md transition-all duration-200 text-muted-foreground"
            >
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            {/* The Forms */}
            <div className="relative z-10">
              {showSignUp ? (
                <SignUpForm onToggle={() => setShowSignUp(false)} />
              ) : (
                <SignInForm onToggle={() => setShowSignUp(true)} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
