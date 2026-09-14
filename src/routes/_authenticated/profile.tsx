import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { UserAvatar } from "@/features/dashboard/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  Phone,
  Mail,
  Pencil,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { getUserProfile } from "@/features/profile/services/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  loader: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { profile: null };
    const profile = await getUserProfile(user.id);
    return { profile };
  },
  component: ProfilePage,
});

const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
});

type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

type ActiveSheet = "personal_info" | "email" | "password" | null;

function ProfilePage() {
  const { profile } = Route.useLoaderData();
  const { user } = useAuth();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);

  const displayName = profile?.name ?? user?.user_metadata?.name ?? "Doctor";
  const displayEmail = profile?.email ?? user?.email ?? "";
  const displayPhone = profile?.phone ?? "";
  const displaySpecialty = profile?.specialty?.name ?? "";
  const avatarUrl = profile?.avatar_url ?? user?.user_metadata?.avatar_url;

  const memberSinceYear = profile?.created_at
    ? new Date(profile.created_at).getFullYear()
    : user?.created_at
      ? new Date(user.created_at).getFullYear()
      : null;

  return (
    <div className="py-10 px-8 space-y-6 bg-accent min-h-full max-w-2xl">
      {/* Profile Card */}
      <div className="border rounded-lg bg-white p-6 space-y-4">
        <div className="flex flex-col items-center text-center">
          <UserAvatar src={avatarUrl} seed={user?.id ?? ""} size="lg" />
          <h2 className="font-heading text-lg font-medium mt-4">{displayName}</h2>
          {memberSinceYear && (
            <span className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/10 rounded-full px-2.5 py-1 mt-2">
              Member since {memberSinceYear}
            </span>
          )}
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Stethoscope className="size-4 shrink-0" />
            <span>{displaySpecialty || "No specialty set"}</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate">{displayEmail}</span>
          </div>
          {displayPhone && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="size-4 shrink-0" />
              <span>{displayPhone}</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setActiveSheet("personal_info")}
        >
          <Pencil className="size-4" />
          Edit Profile
        </Button>
      </div>

      {/* Account Section */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Account</h3>
        <div className="border rounded-lg bg-white divide-y">
          <button
            onClick={() => setActiveSheet("personal_info")}
            className="flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Pencil className="size-4 text-muted-foreground" />
              <span>Personal Info</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setActiveSheet("email")}
            className="flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              <span>Email</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setActiveSheet("password")}
            className="flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lock className="size-4 text-muted-foreground" />
              <span>Password</span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Sheets */}
      <PersonalInfoSheet
        open={activeSheet === "personal_info"}
        onOpenChange={(open) => setActiveSheet(open ? "personal_info" : null)}
        userId={user?.id ?? ""}
        displayName={displayName}
        displayPhone={displayPhone}
      />
      <EmailSheet
        open={activeSheet === "email"}
        onOpenChange={(open) => setActiveSheet(open ? "email" : null)}
        displayEmail={displayEmail}
      />
      <PasswordSheet
        open={activeSheet === "password"}
        onOpenChange={(open) => setActiveSheet(open ? "password" : null)}
      />
    </div>
  );
}

function PersonalInfoSheet({
  open,
  onOpenChange,
  userId,
  displayName,
  displayPhone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  displayName: string;
  displayPhone: string;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoValues>({
    defaultValues: {
      name: displayName,
      phone: displayPhone.replace("+233", ""),
    },
  });

  async function onSubmit(data: PersonalInfoValues) {
    setIsSaving(true);
    try {
      const updates: { name?: string; phone?: string } = {};

      if (data.name !== displayName) {
        updates.name = data.name;
      }

      const phoneWithPrefix = data.phone ? `+233${data.phone}` : "";
      if (phoneWithPrefix !== displayPhone) {
        updates.phone = phoneWithPrefix;
      }

      if (Object.keys(updates).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const { error } = await supabase
        .from("user_profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      if (updates.name) {
        await supabase.auth.updateUser({ data: { name: updates.name } });
      }

      toast.success("Profile updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Edit Personal Info</SheetTitle>
          <SheetDescription>Update your name and phone number</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">+233</span>
              <Input
                id="phone"
                type="tel"
                placeholder="24 123 4567"
                className="pl-12"
                {...register("phone")}
              />
            </div>
          </div>
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function EmailSheet({
  open,
  onOpenChange,
  displayEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayEmail: string;
}) {
  const [step, setStep] = useState<"verify_current" | "verify_new">("verify_current");
  const [currentOtp, setCurrentOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [currentCodeSent, setCurrentCodeSent] = useState(false);
  const [newCodeSent, setNewCodeSent] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const currentOtpRef = useRef<HTMLInputElement>(null);
  const newOtpRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setStep("verify_current");
    setCurrentOtp("");
    setNewEmail("");
    setNewOtp("");
    setCurrentCodeSent(false);
    setNewCodeSent(false);
    setIsBusy(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetState();
    onOpenChange(open);
  }

  async function sendCurrentCode() {
    setIsBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: displayEmail });
      if (error) throw error;
      setCurrentCodeSent(true);
      toast.success("Code sent to your current email");
      setTimeout(() => currentOtpRef.current?.focus(), 100);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setIsBusy(false);
    }
  }

  async function verifyCurrentCode() {
    setIsBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: displayEmail,
        token: currentOtp,
        type: "email_change",
      });
      if (error) throw error;
      setStep("verify_new");
      toast.success("Current email verified");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsBusy(false);
    }
  }

  async function sendNewCode() {
    if (!newEmail || newEmail === displayEmail) {
      toast.error("Enter a different email address");
      return;
    }
    setIsBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: newEmail });
      if (error) throw error;
      setNewCodeSent(true);
      toast.success(`Code sent to ${newEmail}`);
      setTimeout(() => newOtpRef.current?.focus(), 100);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setIsBusy(false);
    }
  }

  async function verifyNewCode() {
    setIsBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: newOtp,
        type: "email_change",
      });
      if (error) throw error;
      toast.success("Email updated");
      handleOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Change Email</SheetTitle>
          <SheetDescription>Verify your current email, then set a new one</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-6">
          {/* Step 1: Verify current email */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Current Email</Label>
              {step === "verify_new" && (
                <span className="text-xs text-emerald-600 font-medium">Verified</span>
              )}
            </div>
            <div className="h-10 w-full rounded-lg border bg-muted/50 px-3 flex items-center text-sm text-muted-foreground">
              {displayEmail}
            </div>

            {!currentCodeSent ? (
              <Button
                onClick={sendCurrentCode}
                disabled={isBusy}
                variant="outline"
                className="w-full"
              >
                {isBusy ? <Loader2 className="size-4 animate-spin" /> : "Send Code"}
              </Button>
            ) : step === "verify_current" ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your email</p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={currentOtp}
                    onChange={setCurrentOtp}
                    ref={currentOtpRef}
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
                <Button
                  onClick={verifyCurrentCode}
                  disabled={isBusy || currentOtp.length < 6}
                  className="w-full"
                >
                  {isBusy ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
                </Button>
                <button
                  onClick={sendCurrentCode}
                  disabled={isBusy}
                  className="text-xs text-primary hover:underline w-full text-center"
                >
                  Didn't get it? Resend code
                </button>
              </div>
            ) : null}
          </div>

          {/* Step 2: New email */}
          {step === "verify_new" && (
            <>
              <div className="h-px bg-border" />
              <div className="space-y-3">
                <Label>New Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={newCodeSent}
                />

                {!newCodeSent ? (
                  <Button
                    onClick={sendNewCode}
                    disabled={isBusy || !newEmail}
                    className="w-full"
                  >
                    {isBusy ? <Loader2 className="size-4 animate-spin" /> : "Send Code"}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to {newEmail}</p>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={newOtp}
                        onChange={setNewOtp}
                        ref={newOtpRef}
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
                    <Button
                      onClick={verifyNewCode}
                      disabled={isBusy || newOtp.length < 6}
                      className="w-full"
                    >
                      {isBusy ? <Loader2 className="size-4 animate-spin" /> : "Verify & Save"}
                    </Button>
                    <button
                      onClick={sendNewCode}
                      disabled={isBusy}
                      className="text-xs text-primary hover:underline w-full text-center"
                    >
                      Didn't get it? Resend code
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PasswordSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: PasswordValues) {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      if (error) throw error;
      toast.success("Password updated");
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Change Password</SheetTitle>
          <SheetDescription>Enter your new password below</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" {...register("currentPassword")} />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
