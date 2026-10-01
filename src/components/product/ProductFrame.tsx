import type { ReactNode } from "react";
import { people, type AvatarTone, type PersonId } from "@/content/demo";
import { cx } from "@/lib/cx";

/**
 * A view of the Workchats app, rebuilt in HTML with the demo team. It is exposed to assistive
 * technology as one image with a description, so screen readers don't read every row of the mock UI.
 */
export function ProductFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cx(
        "overflow-hidden rounded-md border border-line bg-surface text-ink shadow-raised select-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

const avatarSizes = {
  xs: "size-5 text-nano",
  sm: "size-7 text-nano",
  md: "size-9 text-micro",
  lg: "size-12 text-small",
} as const;

export const toneClasses = {
  blue: "bg-avatar-blue text-avatar-blue-ink",
  green: "bg-avatar-green text-avatar-green-ink",
  amber: "bg-avatar-amber text-avatar-amber-ink",
  rose: "bg-avatar-rose text-avatar-rose-ink",
  violet: "bg-avatar-violet text-avatar-violet-ink",
} satisfies Record<AvatarTone, string>;

/** Initials instead of photos: the demo team is fictional, and stock faces say nothing about the product. */
export function Avatar({
  person,
  size = "md",
  className,
}: {
  person: PersonId;
  size?: keyof typeof avatarSizes;
  className?: string;
}) {
  const { initials, tone } = people[person];
  return (
    <span
      className={cx(
        "inline-grid shrink-0 place-items-center rounded-full font-semibold",
        toneClasses[tone],
        avatarSizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function personName(person: PersonId): string {
  return people[person].name;
}

export function firstName(person: PersonId): string {
  return people[person].name.split(" ")[0] ?? people[person].name;
}
