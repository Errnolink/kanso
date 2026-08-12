// useToast — the toast channel (NERV alert bus lineage). The context lives
// here rather than in Toast.tsx so the hook can be imported without pulling
// in the provider's render tree, and so there is no import cycle.
import { createContext, useContext, type ReactNode } from "react";

export type ToastLevel = "info" | "success" | "warning" | "danger";

export interface ToastOptions {
  /** Uppercase mono headline. */
  title?: ReactNode;
  /** Body line under the title. */
  message?: ReactNode;
  level?: ToastLevel;
  /** Auto-dismiss in ms. `0` pins the toast until dismissed. */
  duration?: number;
}

export interface ToastRecord extends ToastOptions {
  id: string;
}

export interface ToastApi {
  /** Raise a toast. A bare string is treated as the title. Returns its id. */
  toast: (options: ToastOptions | string) => string;
  /** Dismiss one toast, or every toast when called with no id. */
  dismiss: (id?: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside a <ToastProvider>.");
  }
  return ctx;
}
