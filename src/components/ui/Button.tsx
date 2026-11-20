import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import styles from "./Button.module.css";

type Variant = "outline" | "outlineOnDark" | "solidOnDark";

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

/** Outlined, uppercase "pill" link from the design reference. */
export function ButtonLink({ variant = "outline", className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Link>
  );
}

interface ButtonProps extends Omit<ComponentProps<"button">, "className"> {
  variant?: Variant;
  className?: string;
}

export function Button({ variant = "outline", className, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}

interface TextLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  tone?: "ink" | "onDark";
  className?: string;
  children: ReactNode;
}

/** Underlined inline link, e.g. "Partner & investor inquiry →". */
export function TextLink({ tone = "ink", className, children, ...rest }: TextLinkProps) {
  return (
    <Link
      className={[styles.textLink, styles[tone], className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </Link>
  );
}
