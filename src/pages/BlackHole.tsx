"use client";

import * as React from "react";

const BlackHole: React.FC = () => {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url("https://static.vecteezy.com/system/resources/previews/023/883/544/non_2x/abstract-background-illustration-abstract-blue-background-illustration-simple-blue-background-for-wallpaper-display-landing-page-banner-or-layout-design-graphic-for-display-free-vector.jpg")',
      }}
    >
      <div className="absolute inset-0 bg-white/70 dark:bg-black/60" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/70 to-transparent" />
    </div>
  );
};

export default BlackHole;