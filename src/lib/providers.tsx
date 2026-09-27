"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { ThemeProvider } from "./theme-provider";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
