import { Hash } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { heroDemo, phoneView } from "@/content/demo";
import { cx } from "@/lib/cx";
import { Avatar, firstName, personName } from "./ProductFrame";

/**
 * A phone, drawn in three layers as a handset has them: the machined edge (lit from the top, like the
 * devices in the owner's references), the black bezel, then the screen. The camera island, home
 * indicator and side buttons are pseudo-elements, so the device chrome costs one element per layer.
 * Brand-neutral: no logos, no recognisable product's camera layout.
 */
export function Handset({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-device="phone"
      className={cx(
        "relative w-phone rounded-device bg-(image:--gradient-device-edge) p-1 shadow-device",
        // Volume buttons on the left, the side button on the right.
        "before:absolute before:top-24 before:-left-0.5 before:h-14 before:w-1 before:rounded-l-sm before:bg-device-frame",
        "after:absolute after:top-32 after:-right-0.5 after:h-16 after:w-1 after:rounded-r-sm after:bg-device-frame",
        className,
      )}
    >
      <div
        className={cx(
          "relative aspect-device overflow-hidden rounded-lg border-4 border-device-bezel bg-surface text-ink",
          "before:absolute before:top-1.5 before:left-1/2 before:z-raised before:h-5 before:w-18 before:-translate-x-1/2 before:rounded-full before:bg-device-bezel",
          "after:absolute after:bottom-1.5 after:left-1/2 after:h-1 after:w-20 after:-translate-x-1/2 after:rounded-full after:bg-ink/30",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Daniel's phone, out on a site visit, when Priya starts the call from #spring-launch: his chats, and the
 * call arriving over them. The notification arrives as the hero's card settles (`cs-ring`); without
 * scroll-driven animations, or with reduced motion, it is simply there.
 */
export function PhoneChats() {
  const { call } = heroDemo;
  return (
    <div inert className="h-full select-none" data-app="phone">
      <p className="px-4 pt-2.5 text-nano font-semibold">{phoneView.time}</p>
      <p className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="font-display text-heading">Chats</span>
        <Avatar person={phoneView.owner} size="sm" />
      </p>
      <ul className="divide-y divide-line">
        {phoneView.chats.map((chat) => (
          <li key={chat.time} className="flex items-center gap-2.5 px-4 py-3">
            {chat.kind === "channel" ? (
              <Hash aria-hidden="true" className="size-7 shrink-0 rounded-sm bg-tint p-1.5 text-ink-muted" />
            ) : (
              <Avatar person={chat.person} size="sm" />
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2 text-micro font-semibold">
                {chat.kind === "channel" ? chat.name : personName(chat.person)}
                <span className="text-nano font-regular text-ink-subtle">{chat.time}</span>
              </span>
              <span className="block truncate text-nano text-ink-muted">{chat.preview}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-2 top-9 cs-ring rounded-md bg-night p-3 text-on-night shadow-ui-overlay">
        <p className="flex items-center gap-2.5">
          <Avatar person={call.startedBy} size="sm" />
          <span className="min-w-0">
            <span className="block text-nano text-on-night-muted">#{heroDemo.channel}</span>
            <span className="block text-micro font-semibold">{firstName(call.startedBy)} started a call</span>
          </span>
        </p>
        <p className="mt-3 grid grid-cols-2 gap-2 text-center text-micro font-semibold">
          <span className="rounded-full bg-night-overlay py-1.5">Decline</span>
          <span className="rounded-full bg-success py-1.5 text-on-accent">Join</span>
        </p>
      </div>
    </div>
  );
}
