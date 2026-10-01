import { Check, Clock, WifiSlash } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { Avatar, firstName, personName, toneClasses } from "@/components/product/ProductFrame";
import {
  connectionRequest,
  launchCall,
  offlineQueue,
  people,
  workingHours,
  workspaces,
} from "@/content/demo";
import { home } from "@/content/home";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { site } from "@/content/site";
import { cx } from "@/lib/cx";

/*
 * Smaller product details from /faq and the feature pages, each with a glimpse of the real UI.
 * The glimpses are decorative (aria-hidden): each tile's heading and text carry the meaning.
 */
export function Bento() {
  const { bento, founder } = home;
  const { tiles } = bento;
  return (
    <section aria-labelledby="bento-title" className="py-section">
      <div className="container-page">
        <SectionHeader id="bento-title" title={bento.title} intro={bento.intro} />
        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12 lg:gap-5">
          <Tile
            className="md:col-span-6 lg:col-span-7"
            dark
            title={tiles.calls.title}
            body={tiles.calls.body}
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-md bg-night-raised p-5 md:p-6">
              <span className="flex -space-x-2">
                {launchCall.participants.map((person) => (
                  <Avatar key={person} person={person} className="ring-2 ring-night-raised" />
                ))}
              </span>
              <span>
                <span className="block text-micro text-on-night-muted">{launchCall.title}</span>
                <span className="block font-display text-title text-on-night tabular-nums">
                  {launchCall.elapsed}
                </span>
              </span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success px-3 py-1 text-micro font-semibold text-on-accent">
                Still going
              </span>
            </div>
          </Tile>

          <Tile className="md:col-span-3 lg:col-span-5" title={tiles.hours.title} body={tiles.hours.body}>
            <div className="flex items-center gap-4 rounded-md border border-line bg-surface p-4 shadow-raised">
              <Avatar person="tom" size="lg" />
              <span className="min-w-0">
                <span className="block font-semibold">{personName("tom")}</span>
                <span className="flex items-center gap-1.5 text-micro text-success">
                  <span className="size-2 rounded-full bg-success" />
                  Available until {workingHours.to}
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-micro text-ink-muted">
                  <Clock aria-hidden="true" className="size-4" />
                  {workingHours.days}, {workingHours.from}–{workingHours.to}, {workingHours.timezone}
                </span>
              </span>
            </div>
          </Tile>

          <Tile
            className="md:col-span-3 lg:col-span-4"
            title={tiles.workspaces.title}
            body={tiles.workspaces.body}
          >
            <ul className="rounded-md border border-line bg-surface p-2 shadow-raised">
              {workspaces.map((workspace) => (
                <li
                  key={workspace.name}
                  className={cx(
                    "flex items-center gap-3 rounded-sm px-2 py-2 text-small",
                    workspace.active ? "bg-tint font-semibold" : "text-ink-muted",
                  )}
                >
                  <span
                    className={cx(
                      "grid size-7 place-items-center rounded-sm text-nano font-bold",
                      toneClasses[workspace.tone],
                    )}
                  >
                    {workspace.initials}
                  </span>
                  {workspace.name}
                  {workspace.active ? (
                    <Check aria-hidden="true" className="ml-auto size-4 text-accent-ink" />
                  ) : null}
                </li>
              ))}
            </ul>
          </Tile>

          <Tile className="md:col-span-3 lg:col-span-4" title={tiles.offline.title} body={tiles.offline.body}>
            <div className="flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-warning-subtle px-2.5 py-0.5 text-nano font-semibold text-warning">
                <WifiSlash aria-hidden="true" className="size-3.5" />
                No connection
              </span>
              <p className="max-w-64 rounded-md rounded-br-sm bg-accent px-4 py-2.5 text-small text-on-accent">
                {offlineQueue.text}
              </p>
              <span className="text-micro text-ink-muted">Queued. Sends when you&apos;re back online</span>
            </div>
          </Tile>

          <Tile
            className="md:col-span-3 lg:col-span-4"
            title={tiles.connections.title}
            body={tiles.connections.body}
          >
            <div className="rounded-md border border-line bg-surface p-4 shadow-raised">
              <p className="flex items-center gap-3">
                <Avatar person={connectionRequest.person} />
                <span className="min-w-0">
                  <span className="block text-small font-semibold">
                    {firstName(connectionRequest.person)} wants to connect
                  </span>
                  <span className="block truncate text-micro text-ink-subtle">
                    {people[connectionRequest.person].role} at {workspaces[0].name}
                  </span>
                </span>
              </p>
              <p className="mt-4 grid grid-cols-2 gap-2 text-center text-micro font-semibold">
                <span className="rounded-full bg-tint py-2 text-ink">Ignore</span>
                <span className="rounded-full bg-accent py-2 text-on-accent">Accept</span>
              </p>
            </div>
          </Tile>

          <li className="grid rise-in grid-cols-1 gap-10 rounded-lg bg-accent p-6 text-on-accent md:col-span-6 md:p-8 lg:col-span-12 lg:grid-cols-12 lg:items-end lg:p-12">
            <figure className="lg:col-span-8">
              <blockquote className="font-display text-subtitle">
                <p>“{founder.quote}”</p>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-on-accent text-small font-bold text-accent-ink">
                  {site.founder.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </span>
                <span>
                  <span className="block font-semibold">{site.founder.name}</span>
                  <span className="block text-small text-on-accent">{site.founder.role}, Workchats</span>
                </span>
              </figcaption>
            </figure>
            <p className="border-t border-on-accent/30 pt-5 text-small text-on-accent lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              {founder.builtBy}
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}

function Tile({
  title,
  body,
  dark = false,
  className,
  children,
}: {
  title: string;
  body: string;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <li
      className={cx(
        "flex rise-in flex-col justify-between gap-8 rounded-lg p-6 md:p-8",
        dark ? "bg-night text-on-night" : "border border-line bg-tint",
        className,
      )}
    >
      <div aria-hidden="true" className="select-none">
        {children}
      </div>
      <div>
        <h3 className="text-heading">{title}</h3>
        <p className={cx("mt-2 text-small", dark ? "text-on-night-muted" : "text-ink-muted")}>{body}</p>
      </div>
    </li>
  );
}
