import { Clock, FileAudio, PhoneIncoming, WifiSlash } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { Avatar, firstName, personName, toneClasses } from "@/components/product/ProductFrame";
import {
  callSummary,
  heroDemo,
  launchCall,
  offlineQueue,
  outsideRequest,
  workingHours,
} from "@/content/demo";
import { home } from "@/content/home";
import { cx } from "@/lib/cx";

type MomentId = (typeof home.day.moments)[number]["id"];

/*
 * The details that make Workchats calm, told as one working day at the demo team's studio. The times are
 * a real sequence, so they carry the order; each moment is the product as it would show it. The pictures
 * are decorative (aria-hidden): each moment's heading and line carry the meaning. The line on the left
 * fills as the day scrolls past (day-progress); without scroll timelines it is simply full.
 */
export function WorkingDay() {
  const { day } = home;
  return (
    <section id="day" aria-labelledby="day-title" className="py-section">
      <div className="container-page">
        <h2 id="day-title" className="max-w-180 font-display text-title">
          {day.title}
        </h2>
        <p className="mt-4 max-w-text text-lead text-on-night-muted">{day.intro}</p>

        <ol className="relative mt-12 border-l border-night-line before:absolute before:inset-y-0 before:-left-px before:w-px before:day-progress before:bg-accent-on-night md:mt-16">
          {day.moments.map((moment) => (
            <li
              key={moment.id}
              className="grid grid-cols-1 gap-6 pb-12 pl-6 last:pb-0 md:pl-10 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-16"
            >
              <div className="lg:col-span-5">
                <p className="font-display text-subtitle text-on-night tabular-nums">
                  <time>{moment.time}</time>
                </p>
                <h3 className="mt-3 text-heading">{moment.title}</h3>
                <p className="mt-2 max-w-text text-body text-on-night-muted">{moment.body}</p>
              </div>
              <div aria-hidden="true" className="select-none lg:col-span-6 lg:col-start-7">
                {moments[moment.id]}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx("max-w-112 min-w-0 rounded-md bg-surface p-4 text-ink shadow-raised md:p-5", className)}
    >
      {children}
    </div>
  );
}

const moments: Record<MomentId, ReactNode> = {
  offline: (
    <Panel className="flex flex-col items-end gap-2">
      <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-warning-subtle px-2.5 py-0.5 text-nano font-semibold text-warning">
        <WifiSlash className="size-3.5" />
        No connection
      </span>
      <span className="max-w-72 rounded-md rounded-br-sm bg-accent px-4 py-2.5 text-small text-on-accent">
        {offlineQueue.text}
      </span>
      <span className="text-micro text-ink-subtle">Queued. Sends when you&apos;re back online</span>
    </Panel>
  ),
  hours: (
    <Panel className="flex items-center gap-4">
      <Avatar person="tom" size="lg" />
      <span className="min-w-0">
        <span className="block font-semibold">{personName("tom")}</span>
        <span className="flex items-center gap-1.5 text-micro text-success">
          <span className="size-2 rounded-full bg-success" />
          Available from {workingHours.from}
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-micro text-ink-muted">
          <Clock className="size-4" />
          {workingHours.days}, {workingHours.from}–{workingHours.to}, {workingHours.timezone}
        </span>
      </span>
    </Panel>
  ),
  call: (
    <Panel className="flex items-center gap-3">
      <PhoneIncoming className="size-10 shrink-0 rounded-full bg-success p-2.5 text-on-accent" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-small font-semibold">{launchCall.title}</span>
        <span className="block truncate text-micro text-ink-muted">
          Started by {firstName(heroDemo.call.startedBy)} in #{heroDemo.channel}
        </span>
      </span>
      <span className="hidden -space-x-1.5 sm:flex">
        {launchCall.participants.map((person) => (
          <Avatar key={person} person={person} size="sm" className="ring-2 ring-surface" />
        ))}
      </span>
      <span className="rounded-full bg-success px-3.5 py-1.5 text-micro font-semibold text-on-accent">
        Join
      </span>
    </Panel>
  ),
  summary: (
    <Panel>
      <span className="flex items-center gap-3">
        <FileAudio className="size-9 shrink-0 rounded-sm bg-avatar-violet p-2 text-avatar-violet-ink" />
        <span className="min-w-0">
          <span className="block truncate text-small font-semibold">{callSummary.title}</span>
          <span className="block text-micro text-ink-subtle">Recording · {callSummary.length}</span>
        </span>
      </span>
      <span className="mt-4 block rounded-sm bg-tint p-3 text-micro">
        <span className="block font-semibold">Decision</span>
        <span className="block text-ink-muted">{callSummary.decision}</span>
        <span className="mt-2 block font-semibold">Action items</span>
        {callSummary.actions.map((action) => (
          <span key={action.text} className="mt-1 flex items-center gap-2 text-ink-muted">
            <Avatar person={action.person} size="xs" />
            {action.text}
          </span>
        ))}
      </span>
    </Panel>
  ),
  connect: (
    <Panel>
      <span className="flex items-center gap-3">
        <span
          className={cx(
            "inline-grid size-9 shrink-0 place-items-center rounded-full text-micro font-semibold",
            toneClasses[outsideRequest.tone],
          )}
        >
          {outsideRequest.initials}
        </span>
        <span className="min-w-0">
          <span className="block text-small font-semibold">{outsideRequest.name} wants to connect</span>
          <span className="block truncate text-micro text-ink-subtle">{outsideRequest.company}</span>
        </span>
      </span>
      <span className="mt-4 grid grid-cols-2 gap-2 text-center text-micro font-semibold">
        <span className="rounded-full bg-tint py-2">Ignore</span>
        <span className="rounded-full bg-accent py-2 text-on-accent">Accept</span>
      </span>
    </Panel>
  ),
};
