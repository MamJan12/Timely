// Simulated for now — replace with your actual auth logic (e.g. from Redux store or localStorage)
export type UserRole = "admin" | "lecturer" | "student" | null;

export const getUserRole = (): UserRole => {
  // Later this will read from localStorage, a token, or Redux
  // For now hardcode "admin" to test — change to "lecturer" or "student" to test the error page
  return "admin";
};