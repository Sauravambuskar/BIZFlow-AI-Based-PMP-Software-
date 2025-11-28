"use client";

import * as React from "react";
import { HoleBackground } from "@/components/HoleBackground";

const BlackHole: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full">
      <HoleBackground className="absolute inset-0" />
      {/* Optional overlay strip to match the screenshot’s bottom glow */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  );
};

export default BlackHole;