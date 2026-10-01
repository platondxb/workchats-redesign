import { FilePdf, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { ReactNode } from "react";
import { people, searchExample } from "@/content/demo";
import { Avatar, firstName, personName, ProductFrame } from "./ProductFrame";

/** Files and search: one query, three filters, and the file, the message it came with, and a person. */
export function SearchCrop({ label }: { label: string }) {
  const { file, message, person } = searchExample;
  return (
    <ProductFrame label={label}>
      <p className="flex items-center gap-3 border-b border-line px-5 py-4">
        <MagnifyingGlass aria-hidden="true" className="size-5 shrink-0 text-accent-ink" />
        <span className="text-body">{searchExample.query}</span>
        <span className="ml-auto shrink-0 text-nano text-ink-subtle">3 results</span>
      </p>
      <p className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
        {searchExample.filters.map((filter) => (
          <span
            key={filter}
            className="rounded-full border border-line bg-tint px-2.5 py-1 text-nano font-semibold text-ink-muted"
          >
            {filter}
          </span>
        ))}
      </p>
      <div className="divide-y divide-line">
        <ResultGroup title="Files">
          <FilePdf
            aria-hidden="true"
            className="size-10 shrink-0 rounded-sm bg-avatar-rose p-2 text-avatar-rose-ink"
          />
          <span className="min-w-0">
            <span className="block truncate text-small font-semibold">{file.name}</span>
            <span className="block text-nano text-ink-subtle">
              {firstName(file.sharedBy)} in #{file.channel} · {file.pages} pages · {file.size}
            </span>
          </span>
        </ResultGroup>
        <ResultGroup title="Messages">
          <Avatar person={message.person} />
          <span className="min-w-0">
            <span className="block text-nano text-ink-subtle">
              {personName(message.person)} in #{message.channel}
            </span>
            <span className="block text-small">
              {message.before}
              <mark className="rounded-sm bg-avatar-amber px-0.5 text-ink">{message.match}</mark>
              {message.after}
            </span>
          </span>
        </ResultGroup>
        <ResultGroup title="People">
          <Avatar person={person} />
          <span className="min-w-0">
            <span className="block text-small font-semibold">{personName(person)}</span>
            <span className="block text-nano text-ink-subtle">{people[person].role}</span>
          </span>
        </ResultGroup>
      </div>
    </ProductFrame>
  );
}

function ResultGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-5 py-4">
      <p className="text-nano font-semibold text-ink-subtle">{title}</p>
      <div className="mt-2 flex items-center gap-3">{children}</div>
    </div>
  );
}
