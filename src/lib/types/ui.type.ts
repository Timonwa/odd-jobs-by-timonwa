import type { ComponentType, SVGProps } from "react";

/** A lucide-style icon component — the shape every icon prop in the app accepts. Declared once; six files previously re-declared it locally. */
export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
