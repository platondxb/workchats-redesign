import { ArrowBendDownRight, Checks, Hash, Play, PushPin, ThumbsUp } from "@phosphor-icons/react/ssr";
import { designChannel } from "@/content/demo";
import { Avatar, firstName, personName, ProductFrame } from "./ProductFrame";

/** Messaging: a channel with a pinned message, reactions, a thread, a read receipt and a voice note. */
export function ChannelCrop({ label }: { label: string }) {
  const [first, second] = designChannel.messages;
  const { voiceNote } = designChannel;
  return (
    <ProductFrame label={label}>
      <p className="flex items-center gap-2 border-b border-line px-5 py-3">
        <Hash aria-hidden="true" className="size-5 text-ink-muted" />
        <span className="font-semibold">{designChannel.name}</span>
        <span className="text-micro text-ink-subtle">{designChannel.members} members</span>
      </p>
      <p className="flex items-center gap-2 border-b border-line bg-warning-subtle px-5 py-2.5 text-micro text-ink-muted">
        <PushPin aria-hidden="true" className="size-4 shrink-0 text-warning" />
        <span>
          Pinned by {firstName(designChannel.pinned.by)}:{" "}
          <span className="font-semibold text-ink">{designChannel.pinned.text}</span>
        </span>
      </p>
      <ol className="flex flex-col gap-5 p-5">
        <li className="flex gap-3">
          <Avatar person={first.person} />
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-2">
              <span className="text-small font-semibold">{personName(first.person)}</span>
              <span className="text-nano text-ink-subtle">{first.time}</span>
            </p>
            <p className="text-small">{first.text}</p>
            <p className="mt-2 flex flex-wrap items-center gap-3 text-nano">
              <span className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent-subtle px-2 py-0.5 font-semibold text-accent-ink">
                <ThumbsUp aria-hidden="true" className="size-3.5" />
                {first.reactions}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-accent-ink">
                <ArrowBendDownRight aria-hidden="true" className="size-3.5" />
                {first.thread} replies
              </span>
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <Avatar person={second.person} />
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-2">
              <span className="text-small font-semibold">{personName(second.person)}</span>
              <span className="text-nano text-ink-subtle">{second.time}</span>
            </p>
            <p className="text-small">{second.text}</p>
            <p className="mt-1.5 flex items-center gap-1 text-nano text-ink-subtle">
              <Checks aria-hidden="true" className="size-4 text-accent-ink" />
              Seen by {second.seenBy}
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <Avatar person={voiceNote.person} />
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-2">
              <span className="text-small font-semibold">{personName(voiceNote.person)}</span>
              <span className="text-nano text-ink-subtle">{voiceNote.time}</span>
            </p>
            <p className="mt-1 inline-flex items-center gap-3 rounded-full bg-tint py-1.5 pr-4 pl-1.5">
              <Play
                aria-hidden="true"
                weight="fill"
                className="size-7 rounded-full bg-accent p-2 text-on-accent"
              />
              <Waveform />
              <span className="text-nano text-ink-muted tabular-nums">{voiceNote.length}</span>
            </p>
          </div>
        </li>
      </ol>
    </ProductFrame>
  );
}

/** A voice-note waveform drawn as one path, so it costs two DOM nodes rather than one per bar. */
function Waveform() {
  const bars = [6, 10, 14, 9, 16, 12, 7, 13, 18, 11, 8, 14, 10, 6, 12, 9, 15, 7, 11, 5];
  const d = bars.map((height, index) => `M${index * 5 + 2} ${12 - height / 2}v${height}`).join("");
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 24"
      className="h-5 w-24 stroke-accent"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d={d} />
    </svg>
  );
}
