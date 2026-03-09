export const AUTH_VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address.",
    required: "Email is required.",
  },
  password: {
    minLength: 8,
    message: `Password must be at least 8 characters.`,
    required: "Password is required.",
  },
  name: {
    minLength: 2,
    message: "Name must be at least 2 characters.",
    required: "Name is required.",
  },
} as const;

export function validateEmail(value: string): string | null {
  if (!value.trim()) return AUTH_VALIDATION.email.required;
  if (!AUTH_VALIDATION.email.pattern.test(value)) return AUTH_VALIDATION.email.message;
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return AUTH_VALIDATION.password.required;
  if (value.length < AUTH_VALIDATION.password.minLength) return AUTH_VALIDATION.password.message;
  return null;
}

export function validateName(value: string): string | null {
  if (!value.trim()) return AUTH_VALIDATION.name.required;
  if (value.trim().length < AUTH_VALIDATION.name.minLength) return AUTH_VALIDATION.name.message;
  return null;
}

export type AuthError = {
  field?: "email" | "password" | "name" | "general";
  message: string;
};
