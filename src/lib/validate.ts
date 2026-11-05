import { z } from "zod";
import { COUNTRY_CODES } from "./countries";

export const uidSchema = z.string().trim().regex(/^\d{5,15}$/, "UID must be 5 to 15 digits.");

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "Username is too short.")
  .max(24, "Username is too long.");

const countrySchema = z.string().refine((c) => COUNTRY_CODES.includes(c), "Choose your country.");

const playingSinceSchema = z
  .string()
  .regex(/^20(1[89]|[2-9]\d)-(0[1-9]|1[0-2])$/, "Choose when you started playing.");

export const registerSchema = z.object({
  username: usernameSchema,
  uid: uidSchema,
  country: countrySchema,
  playingSince: playingSinceSchema,
});

export const loginSchema = z.object({ username: usernameSchema, uid: uidSchema });

export const profileSchema = z
  .object({
    country: countrySchema,
    playingSince: playingSinceSchema,
    avatarUrl: z.url(),
  })
  .partial();

export const matchSchema = z.object({
  playedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose the match date."),
  kills: z.number("Enter your eliminations.").int().min(0).max(99, "Eliminations must be 99 or less."),
  damage: z.number("Enter your damage.").int().min(0).max(20000, "Damage looks too high."),
  survivalMin: z.number("Enter your survival time.").min(0).max(60, "Survival time must be 60 minutes or less."),
  placement: z.number("Enter your finish position.").int().min(1).max(100, "Finish position must be 1 to 100."),
  screenshotUrl: z.url(),
});

/** Usernames match regardless of case or stylised-width characters. */
export const usernameKey = (name: string) => name.trim().normalize("NFKC").toLowerCase();

export function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check your details and try again.";
}
