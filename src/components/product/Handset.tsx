import { Hash } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { heroDemo, phoneView } from "@/content/demo";
import { cx } from "@/lib/cx";
import { Avatar, firstName, personName } from "./ProductFrame";

/**
 * A phone: a vector render (public/devices/phone.svg, drawn by scripts/render-devices.mjs) of a titanium
 * band, a polished chamfer, the glass and its camera island, with the live screen behind the glass. The
 * frame's screen area is transparent, so the app is as sharp as the page's text and the glass reflection
 * lies over it. Brand-neutral: no logo, no other company's interface.
 */
export function Handset({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-device="phone" className={cx("relative device-phone w-phone drop-shadow-device", className)}>
      <div className="phone-screen overflow-hidden bg-surface text-ink">{children}</div>
      {/* eslint-disable-next-line @next/next/no-img-element -- a static SVG frame: next/image would add client JS */}
      <img
        src="/devices/phone.svg"
        alt=""
        width={438}
        height={900}
        className="pointer-events-none absolute inset-0 size-full select-none"
      />
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
      {/* The status bar: level with the camera island, clear of the screen's rounded corner. */}
      <p className="flex h-10 items-center px-6 text-nano font-semibold">{phoneView.time}</p>
      <p className="flex items-center justify-between px-4 pt-2 pb-2">
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
                <span className="truncate">
                  {chat.kind === "channel" ? chat.name : personName(chat.person)}
                </span>
                <span className="shrink-0 text-nano font-regular text-ink-subtle">{chat.time}</span>
              </span>
              <span className="block truncate text-nano text-ink-muted">{chat.preview}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="absolute inset-x-2.5 top-10 cs-ring rounded-md bg-night p-3 text-on-night shadow-ui-overlay">
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
