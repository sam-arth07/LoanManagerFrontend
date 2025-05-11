"use client";

import OfflineIndicator from "@/components/OfflineIndicator";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

export default function AppClientWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <OfflineIndicator position="bottom" />
      <Toaster />
    </>
  );
}
