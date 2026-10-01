import {
  Microphone,
  MicrophoneSlash,
  MonitorArrowUp,
  PhoneDisconnect,
  VideoCamera,
} from "@phosphor-icons/react/ssr";
import { launchCall } from "@/content/demo";
import { cx } from "@/lib/cx";
import { Avatar, firstName } from "./ProductFrame";

/** Meetings: the call started from #spring-launch, with Tom sharing and annotating his screen. */
export function CallCrop({ label }: { label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="overflow-hidden rounded-md bg-night text-on-night shadow-raised select-none"
    >
      <p className="flex items-center gap-3 px-4 py-3">
        <span className="size-2 shrink-0 rounded-full bg-error" />
        <span className="truncate text-small font-semibold">{launchCall.title}</span>
        <span className="hidden text-micro text-on-night-muted sm:inline">#{launchCall.channel}</span>
        <span className="ml-auto text-micro text-on-night-muted tabular-nums">{launchCall.elapsed}</span>
      </p>

      <div className="px-3">
        {/* The shared screen: a wireframe of the homepage mockups, with a live annotation on it. */}
        <div className="relative grid aspect-2/1 grid-rows-4 gap-2 rounded-sm bg-surface p-4 text-ink md:p-6">
          <span className="w-2/3 rounded-full bg-tint" />
          <span className="row-span-2 rounded-sm bg-accent-subtle" />
          <span className="w-1/2 rounded-sm bg-tint" />
          <span className="absolute top-1/4 right-1/5 h-1/3 w-1/4 rounded-full border-2 border-warning" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-night px-2.5 py-1 text-nano font-semibold text-on-night">
            <MonitorArrowUp aria-hidden="true" className="size-3.5" />
            {firstName(launchCall.sharing)} is sharing “{launchCall.shared}”
          </span>
        </div>
      </div>

      <ul className="grid grid-cols-4 gap-2 p-3">
        {launchCall.participants.map((person) => {
          const speaking = person === launchCall.speaking;
          return (
            <li
              key={person}
              className={cx(
                "relative grid aspect-video place-items-center rounded-sm bg-night-raised",
                speaking && "outline-2 outline-accent",
              )}
            >
              <Avatar person={person} size="md" />
              <span className="absolute bottom-1 left-1.5 text-nano text-on-night-muted">
                {firstName(person)}
              </span>
              {launchCall.muted.includes(person) ? (
                <MicrophoneSlash
                  aria-hidden="true"
                  className="absolute top-1.5 right-1.5 size-3.5 text-on-night-muted"
                />
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="flex items-center justify-center gap-2 border-t border-night-line px-4 py-3">
        {[Microphone, VideoCamera, MonitorArrowUp].map((Icon, index) => (
          <Icon
            key={index}
            aria-hidden="true"
            className={cx(
              "size-10 rounded-full p-2.5",
              index === 2 ? "bg-accent text-on-accent" : "bg-night-raised text-on-night",
            )}
          />
        ))}
        <span className="ml-2 inline-flex h-10 items-center gap-2 rounded-full bg-error px-4 text-small font-semibold text-on-accent">
          <PhoneDisconnect aria-hidden="true" className="size-5" />
          Leave
        </span>
      </p>
    </div>
  );
}
