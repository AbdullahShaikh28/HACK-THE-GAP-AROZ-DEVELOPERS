"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const next = searchParams.get("next") ?? "/dashboard";

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        window.location.assign(next.startsWith("/") ? next : "/dashboard");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setMessage(
        "Account created. If email confirmation is enabled, check your inbox before signing in.",
      );

      router.push(data.session ? "/dashboard" : "/login");
      router.refresh();
    } catch (error) {
      const fallbackMessage =
        "Unable to reach Supabase. Double-check your URL/key, then restart the Next.js server after updating .env.local.";

      setError(
        error instanceof Error && error.message ? error.message : fallbackMessage,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {isLogin ? "Sign in" : "Create account"}
        </h1>
        <p className="text-sm text-muted">
          {isLogin
            ? "Use your Supabase credentials to access the dashboard."
            : "Register with email and password to get started."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isLogin ? "Sign in" : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isLogin ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-foreground hover:underline"
        >
          {isLogin ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </Card>
  );
}
