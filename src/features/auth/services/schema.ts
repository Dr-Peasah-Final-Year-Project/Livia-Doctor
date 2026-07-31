import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const forgotPasswordOtpSchema = z.object({
  otp: z.string().length(6, "Enter a valid 6-digit code"),
});

export type ForgotPasswordOtpForm = z.infer<typeof forgotPasswordOtpSchema>;
