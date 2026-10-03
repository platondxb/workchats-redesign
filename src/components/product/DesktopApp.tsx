import {
  FilePdf,
  Hash,
  MagnifyingGlass,
  PaperPlaneRight,
  Phone,
  PhoneIncoming,
  Plus,
  ThumbsUp,
  VideoCamera,
} from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { channels, directMessages, heroDemo, workspaces, type PersonId } from "@/content/demo";
import { cx } from "@/lib/cx";
import { Avatar, firstName, personName } from "./ProductFrame";

/*
 * The Workchats desktop app at the moment the story turns: in #spring-launch, Priya has just posted
 * "Quick check-in at 10? I'll start a call here." and started the call. The view is inert and is one
 * picture to assistive technology (the hero's role="img" carries the description), so nothing inside it
 * can be focused or read out row by row.
 */
export function DesktopApp() {
  const [workspace] = workspaces;
  return (
    <div inert className="flex h-full flex-col text-ink select-none" data-app="desktop">
      <div className="flex items-center gap-2.5 border-b border-line bg-tint px-4 py-2">
        <span className="grid size-7 place-items-center rounded-sm bg-accent text-nano font-bold text-on-accent">
          {workspace.initials}
        </span>
        <span className="text-small font-semibold">{workspace.name}</span>
        <span className="mx-auto flex w-2/5 items-center gap-2 rounded-sm border border-line bg-surface px-3 py-1 text-micro text-ink-subtle">
          <MagnifyingGlass aria-hidden="true" className="size-4" />
          Search {workspace.name}
        </span>
        <Avatar person="amara" size="sm" />
      </div>
      <div className="flex min-h-0 flex-1 bg-surface">
        <Sidebar />
        <Conversation />
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <div className="w-56 shrink-0 border-r border-line bg-canvas p-3">
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
              {channel.unread > 0 ? <Count>{channel.unread}</Count> : null}
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
            {dm.unread > 0 ? <Count>{dm.unread}</Count> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Count({ children }: { children: ReactNode }) {
  return (
    <span className="ml-auto rounded-full bg-accent px-1.5 text-nano font-semibold text-on-accent">
      {children}
    </span>
  );
}

function Conversation() {
  const { earlier, next, call } = heroDemo;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        <Hash aria-hidden="true" className="size-5 text-ink-muted" />
        <span className="font-semibold">{heroDemo.channel}</span>
        <span className="text-micro text-ink-subtle">{heroDemo.members} members</span>
        <span className="ml-auto flex items-center gap-3 text-ink-muted">
          <Phone aria-hidden="true" className="size-5" />
          <VideoCamera aria-hidden="true" className="size-5" />
        </span>
      </div>

      {/* Anchored to the bottom like a real conversation; the call banner sits over the top of it. */}
      <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
        <ol className="flex flex-col gap-4 px-5 pt-20 pb-5">
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
          <li>
            <Message person={next.person} time={next.time} text={next.text} />
          </li>
        </ol>

        <div className="absolute inset-x-5 top-4 flex cs-banner items-center gap-3 rounded-md border border-line bg-surface px-4 py-2.5 shadow-ui-overlay">
          <PhoneIncoming
            aria-hidden="true"
            className="size-9 shrink-0 rounded-full bg-success p-2 text-on-accent"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-small font-semibold">{call.title}</span>
            <span className="flex items-center gap-1.5 text-nano text-ink-muted">
              <span className="size-1.5 shrink-0 rounded-full bg-error" />
              <span className="truncate">
                Started by {firstName(call.startedBy)} · {call.joined.length} in the call
              </span>
            </span>
          </span>
          <span className="flex -space-x-1.5">
            {call.joined.map((person: PersonId) => (
              <Avatar key={person} person={person} size="sm" className="ring-2 ring-surface" />
            ))}
          </span>
          <span className="rounded-full bg-success px-3.5 py-1.5 text-micro font-semibold text-on-accent">
            Join
          </span>
        </div>
      </div>

      <div className="mx-5 mb-5 flex items-center gap-3 rounded-md border border-line-strong px-3 py-2.5 text-small text-ink-subtle">
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
  children,
}: {
  person: PersonId;
  time: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
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
