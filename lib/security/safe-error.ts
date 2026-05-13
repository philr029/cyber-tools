/**
 * Map internal errors to client-safe messages. Never forward raw provider or stack
 * text to browsers in production.
 */
export function publicErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (process.env.NODE_ENV === "development" && err instanceof Error) {
    return err.message;
  }
  return fallback;
}
