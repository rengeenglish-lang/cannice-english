import type { ReactNode } from "react";

export function PageHero({ children }: { children: ReactNode }) {
  return <header className="inner-page-hero">{children}</header>;
}
