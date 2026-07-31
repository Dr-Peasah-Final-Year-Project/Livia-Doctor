import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { forgotPasswordOtpSchema, forgotPasswordSchema, loginSchema, type ForgotPasswordForm, type ForgotPasswordOtpForm, type LoginForm } from "@/features/auth/services/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Loader, Lock, Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<"email" | "otp">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const forgotForm = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
  });

  const otpForm = useForm<ForgotPasswordOtpForm>({
    resolver: zodResolver(forgotPasswordOtpSchema),
    mode: "onSubmit",
  });

  const otpValue = otpForm.watch("otp");

  async function onSubmit(data: LoginForm) {
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setLoginError(error.message);
      return;
    }
    router.navigate({ to: "/dashboard" });
  }

  async function onForgotSubmit(data: ForgotPasswordForm) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setForgotEmail(data.email);
    setForgotStep("otp");
  }

  async function onOtpSubmit(data: ForgotPasswordOtpForm) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("OTP verified:", data.otp);
    setForgotOpen(false);
    setForgotStep("email");
    forgotForm.reset();
    otpForm.reset();
  }

  function handleForgotOpenChange(open: boolean) {
    setForgotOpen(open);
    if (!open) {
      setForgotStep("email");
      forgotForm.reset();
      otpForm.reset();
    }
  }

  return (
    <div className="w-full min-h-screen grid grid-cols-7">
      <div className="col-span-7 md:col-span-3 p-8 flex flex-col">
        <header className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 28 28"
            className="text-primary"
          >
            <path
              fill="currentColor"
              d="M10.75 2.998A1.75 1.75 0 0 0 9 4.748V9H4.75A1.75 1.75 0 0 0 3 10.75v6.5c0 .966.784 1.75 1.75 1.75H9v4.251c0 .967.784 1.75 1.75 1.75h6.5a1.75 1.75 0 0 0 1.75-1.75V19h4.25A1.75 1.75 0 0 0 25 17.25v-6.5A1.75 1.75 0 0 0 23.25 9H19V4.748a1.75 1.75 0 0 0-1.75-1.75z"
            />
          </svg>
          <h1 className="text-xl font-bold text-primary">Livia Health</h1>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-1 text-center">
              <h1 className="text-xl font-semibold">Sign in to Livia Health</h1>
              <p className="text-muted-foreground text-sm">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-8"
                    {...register("email")}
                    {...errors.email && { "aria-invalid": true, "aria-describedby": "email-error" }}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    className="pl-8 pr-9"
                    {...register("password")}
                    {...errors.password && { "aria-invalid": true, "aria-describedby": "password-error" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 size-6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {loginError && (
                <p className="text-sm text-destructive text-center">{loginError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader className="animate-spin" /> : "Sign in"}
              </Button>
            </form>

            <Dialog.Root open={forgotOpen} onOpenChange={handleForgotOpenChange}>
              <p className="text-center text-sm text-muted-foreground">
                <Dialog.Trigger className="text-primary hover:underline outline-none">
                  Forgot your password?
                </Dialog.Trigger>
              </p>

              <Dialog.Popup>
                {forgotStep === "email" ? (
                  <>
                    <div className="flex flex-col items-center text-center">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <Lock className="size-5 text-primary" />
                      </div>
                      <Dialog.Title>Forgot password?</Dialog.Title>
                      <Dialog.Description className="mt-1">
                        Enter your email and we'll send you a 6-digit code to reset your password.
                      </Dialog.Description>
                    </div>
                    <Dialog.Close />

                    <form
                      onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
                      className="mt-6 space-y-4"
                      noValidate
                    >
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="name@example.com"
                            className="pl-8"
                            {...forgotForm.register("email")}
                            {...forgotForm.formState.errors.email && { "aria-invalid": true, "aria-describedby": "forgot-email-error" }}
                          />
                        </div>
                        {forgotForm.formState.errors.email && (
                          <p id="forgot-email-error" className="text-sm text-destructive">
                            {forgotForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={forgotForm.formState.isSubmitting}
                      >
                        {forgotForm.formState.isSubmitting ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Send reset link"
                        )}
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setForgotStep("email")}
                      className="absolute top-4 left-4 size-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label="Back to email step"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <Dialog.Close />

                    <div className="flex flex-col items-center text-center">
                      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <Mail className="size-5 text-primary" />
                      </div>
                      <Dialog.Title>Check your email</Dialog.Title>
                      <Dialog.Description className="mt-1">
                        We sent a 6-digit code to <span className="text-foreground font-medium">{forgotEmail}</span>
                      </Dialog.Description>
                    </div>

                    <form
                      onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                      className="mt-6 space-y-4"
                      noValidate
                    >
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otpValue}
                          onChange={(value) => otpForm.setValue("otp", value, { shouldValidate: value.length === 6 })}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {otpForm.formState.errors.otp && (
                        <p className="text-sm text-destructive text-center">
                          {otpForm.formState.errors.otp.message}
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={otpForm.formState.isSubmitting}
                      >
                        {otpForm.formState.isSubmitting ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Verify code"
                        )}
                      </Button>
                    </form>
                  </>
                )}
              </Dialog.Popup>
            </Dialog.Root>
          </div>
        </main>
      </div>
      <div className="col-span-4 hidden md:block bg-blue-200">

      </div>
    </div>
  );
}
