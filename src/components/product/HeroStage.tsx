import {
  FilePdf,
  Hash,
  MagnifyingGlass,
  PaperPlaneRight,
  Pause,
  Phone,
  PhoneIncoming,
  Play,
  Plus,
  ThumbsUp,
  VideoCamera,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { MARK_PATH } from "@/components/layout/Logo";
import { channels, directMessages, heroDemo, phoneView, workspaces, type PersonId } from "@/content/demo";
import { cx } from "@/lib/cx";
import { Avatar, firstName, personName } from "./ProductFrame";

/*
 * The hero: the desktop app and a teammate's phone on a brand-blue stage, telling one short story on a
 * 14-second loop. Priya types in #spring-launch, posts, starts a call from the conversation, and the
 * call rings on Daniel's phone. CSS animations only (opacity and transform), so there is no layout
 * shift and no JavaScript. Without motion, the final frame is shown.
 *
 * The loop pauses off screen (a tiny inline IntersectionObserver) and with the visible pause control
 * (WCAG 2.2.2), which is a checkbox read by CSS, so it works before and without JavaScript.
 *
 * The window and phone are a picture: the role="img" wrapper carries the description, and the mock UI
 * inside is inert (nothing in it can be focused, selected or read out item by item). Its text is
 * incidental to the picture, and mid-fade frames of the loop aren't readable text to check.
 */

const pauseOffscreen = `(function(){var d=document.getElementById("hero-demo");if(!d||!("IntersectionObserver"in window))return;new IntersectionObserver(function(e){e[0].isIntersecting?d.removeAttribute("data-paused"):d.setAttribute("data-paused","")}).observe(d)})()`;

export function HeroStage({ label, pauseLabel }: { label: string; pauseLabel: string }) {
  return (
    <div id="hero-demo" data-demo="" suppressHydrationWarning className="mt-10 md:mt-14">
      <div className="relative isolate animate-stage-in overflow-hidden rounded-lg bg-accent px-3 pt-4 sm:px-6 sm:pt-6 md:px-10 md:pt-12 lg:px-16 lg:pt-14">
        {/* The speech-bubble mark from the logo, cropped large behind the product. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 126 126"
          className="pointer-events-none absolute -bottom-40 -left-24 -z-10 w-160 fill-brand"
        >
          <path d={MARK_PATH} />
        </svg>
        <div role="img" aria-label={label} className="relative mx-auto max-w-window select-none">
          <DesktopWindow />
          <PhoneScreen />
        </div>
      </div>
      <div className="mt-3 flex justify-end motion-reduce:hidden">
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-small font-semibold text-ink-muted hover:bg-tint hover:text-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
          <input id="demo-pause" type="checkbox" className="peer sr-only" />
          <Pause aria-hidden="true" className="size-4 peer-checked:hidden" />
          <Play aria-hidden="true" className="hidden size-4 peer-checked:block" />
          {pauseLabel}
        </label>
      </div>
      <script dangerouslySetInnerHTML={{ __html: pauseOffscreen }} />
    </div>
  );
}

function DesktopWindow() {
  const [workspace] = workspaces;
  return (
    <div
      inert
      className="overflow-hidden rounded-t-md border border-b-0 border-line bg-surface text-ink shadow-overlay lg:mr-24 xl:mr-0"
    >
      <div className="flex items-center gap-2.5 border-b border-line bg-tint px-3 py-2 md:px-4">
        <span className="grid size-7 place-items-center rounded-sm bg-accent text-nano font-bold text-on-accent">
          {workspace.initials}
        </span>
        <span className="text-small font-semibold">{workspace.name}</span>
        <span className="mx-auto hidden w-2/5 items-center gap-2 rounded-sm border border-line bg-surface px-3 py-1 text-micro text-ink-subtle md:flex">
          <MagnifyingGlass aria-hidden="true" className="size-4" />
          Search {workspace.name}
        </span>
        <Avatar person="amara" size="sm" className="ml-auto md:ml-0" />
      </div>
      <div className="flex md:h-132 lg:h-128 xl:h-120">
        <Sidebar />
        <Conversation />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="hidden w-56 shrink-0 border-r border-line p-3 md:block">
      <p className="px-2 text-nano font-semibold text-ink-subtle">Channels</p>
      <ul className="mt-1.5 text-small">
        {channels.map((channel) => {
          const active = channel.name === heroDemo.channel;
          return (
            <li
              key={channel.name}
              className={cx(
                "flex items-center gap-2 rounded-sm px-2 py-1.5",
                active ? "bg-accent-subtle font-semibold text-accent-ink" : "text-ink-muted",
              )}
            >
              <Hash aria-hidden="true" className="size-4 shrink-0" />
              {channel.name}
              {channel.unread > 0 ? (
                <span className="ml-auto rounded-full bg-accent px-1.5 text-nano font-semibold text-on-accent">
                  {channel.unread}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-5 px-2 text-nano font-semibold text-ink-subtle">Direct messages</p>
      <ul className="mt-1.5 text-small text-ink-muted">
        {directMessages.map((dm) => (
          <li key={dm.person} className="flex items-center gap-2 rounded-sm px-2 py-1.5">
            <Avatar
              person={dm.person}
              size="xs"
              className={dm.online ? "outline-2 outline-offset-1 outline-success" : undefined}
            />
            {personName(dm.person)}
            {dm.unread > 0 ? (
              <span className="ml-auto rounded-full bg-accent px-1.5 text-nano font-semibold text-on-accent">
                {dm.unread}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Conversation() {
  const { earlier, next, typing, call } = heroDemo;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3 md:px-5">
        <Hash aria-hidden="true" className="size-5 text-ink-muted" />
        <span className="font-semibold">{heroDemo.channel}</span>
        <span className="hidden text-micro text-ink-subtle sm:inline">{heroDemo.members} members</span>
        <span className="ml-auto flex items-center gap-3 text-ink-muted">
          <Phone aria-hidden="true" className="size-5" />
          <VideoCamera aria-hidden="true" className="size-5" />
        </span>
      </div>

      {/* Anchored to the bottom like a real conversation; the call banner drops in over the date divider. */}
      <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
        <ol className="flex flex-col gap-4 px-4 pt-9 pb-4 md:px-5 md:pb-5">
          <li className="flex items-center gap-3 text-nano font-semibold text-ink-subtle before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
            Today
          </li>
          {earlier.map((message) => (
            <li key={message.time}>
              <Message person={message.person} time={message.time} text={message.text}>
                {"file" in message ? (
                  <span className="mt-2 flex max-w-72 items-center gap-3 rounded-sm border border-line p-2.5">
                    <FilePdf
                      aria-hidden="true"
                      className="size-9 shrink-0 rounded-sm bg-avatar-rose p-2 text-avatar-rose-ink"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-micro font-semibold">{message.file.name}</span>
                      <span className="block text-nano text-ink-subtle">
                        {message.file.kind} · {message.file.size}
                      </span>
                    </span>
                  </span>
                ) : null}
                {"reactions" in message ? (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-line bg-tint px-2 py-0.5 text-nano text-ink-muted">
                    <ThumbsUp aria-hidden="true" className="size-3.5" />
                    {message.reactions}
                  </span>
                ) : null}
              </Message>
            </li>
          ))}
          {/* Typing and the posted message share one grid cell, so neither moves the layout. */}
          <li className="grid grid-cols-1">
            <p className="col-start-1 row-start-1 flex animate-demo-typing items-center gap-2 self-end text-micro text-ink-subtle motion-reduce:hidden">
              <Avatar person={typing} size="xs" />
              {firstName(typing)} is typing…
            </p>
            <Message
              person={next.person}
              time={next.time}
              text={next.text}
              className="col-start-1 row-start-1 animate-demo-message"
            />
          </li>
        </ol>

        <div className="absolute inset-x-3 top-3 flex animate-demo-call items-center gap-3 rounded-md border border-line bg-surface px-3 py-2.5 shadow-overlay md:inset-x-5 md:px-4">
          <PhoneIncoming
            aria-hidden="true"
            className="size-9 shrink-0 rounded-full bg-success p-2 text-on-accent"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-small font-semibold">{call.title}</span>
            <span className="flex items-center gap-1.5 text-nano text-ink-muted">
              <span className="size-1.5 shrink-0 animate-live rounded-full bg-error" />
              <span className="truncate">
                Started by {firstName(call.startedBy)} · {call.joined.length} in the call
              </span>
            </span>
          </span>
          <span className="hidden -space-x-1.5 sm:flex">
            {call.joined.map((person: PersonId) => (
              <Avatar key={person} person={person} size="sm" className="ring-2 ring-surface" />
            ))}
          </span>
          <span className="rounded-full bg-success px-3.5 py-1.5 text-micro font-semibold text-on-accent">
            Join
          </span>
        </div>
      </div>

      <div className="mx-3 mb-3 flex items-center gap-3 rounded-md border border-line-strong px-3 py-2.5 text-small text-ink-subtle md:mx-5 md:mb-5">
        <Plus aria-hidden="true" className="size-5 shrink-0" />
        <span className="truncate">Message #{heroDemo.channel}</span>
        <PaperPlaneRight aria-hidden="true" className="ml-auto size-5 shrink-0 text-accent-ink" />
      </div>
    </div>
  );
}

function Message({
  person,
  time,
  text,
  className,
  children,
}: {
  person: PersonId;
  time: string;
  text: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cx("flex gap-3", className)}>
      <Avatar person={person} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2">
          <span className="text-small font-semibold">{personName(person)}</span>
          <span className="text-nano text-ink-subtle">{time}</span>
        </p>
        <p className="text-small">{text}</p>
        {children}
      </div>
    </div>
  );
}

/** Daniel's phone, out on a site visit: the call from #spring-launch arrives as a notification. */
function PhoneScreen() {
  const { call } = heroDemo;
  return (
    <div
      inert
      className="absolute bottom-0 hidden w-phone translate-y-40 rounded-lg border-6 border-ink bg-ink shadow-overlay lg:-right-8 lg:block xl:-right-12"
    >
      <div className="relative h-120 overflow-hidden rounded-md bg-surface">
        <p className="px-4 pt-2.5 text-nano font-semibold">{phoneView.time}</p>
        <p className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="font-display text-heading">Chats</span>
          <Avatar person={phoneView.owner} size="sm" />
        </p>
        <ul className="divide-y divide-line">
          {phoneView.chats.map((chat) => (
            <li key={chat.time} className="flex items-center gap-2.5 px-4 py-3">
              {chat.kind === "channel" ? (
                <Hash
                  aria-hidden="true"
                  className="size-7 shrink-0 rounded-sm bg-tint p-1.5 text-ink-muted"
                />
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

        <div className="absolute inset-x-2 top-9 animate-demo-ring rounded-md bg-night p-3 text-on-night shadow-overlay">
          <p className="flex items-center gap-2.5">
            <Avatar person={call.startedBy} size="sm" />
            <span className="min-w-0">
              <span className="block text-nano text-on-night-muted">#{heroDemo.channel}</span>
              <span className="block text-micro font-semibold">
                {firstName(call.startedBy)} started a call
              </span>
            </span>
          </p>
          <p className="mt-3 grid grid-cols-2 gap-2 text-center text-micro font-semibold">
            <span className="rounded-full bg-night-raised py-1.5">Decline</span>
            <span className="rounded-full bg-success py-1.5 text-on-accent">Join</span>
          </p>
        </div>
      </div>
    </div>
  );
}
