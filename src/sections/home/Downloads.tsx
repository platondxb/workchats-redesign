import { Info } from "@phosphor-icons/react/ssr";
import { platformIcons } from "@/components/ui/icons";
import { home } from "@/content/home";
import { platforms } from "@/content/site";

/*
 * Where Workchats runs. Every platform is a real, pressable button rather than a picture of one: it
 * takes pointer, touch and keyboard focus, and it shows hover, focus and press states.
 *
 * In this MVP the buttons are deliberately inert. There is no downloads route in the app yet, and the
 * brief is that pressing one must not navigate, reveal or swap anything. When /download moves in, each
 * button becomes the link to that platform's build.
 */

export function Downloads() {
  const { downloads } = home;
  return (
    <section aria-label={downloads.label} className="container-page">
      <div className="border-y border-line py-8">
        <p className="text-small font-semibold text-ink-muted">{downloads.title}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform.id];
            return (
              <li key={platform.id}>
                <button
                  type="button"
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-4 pl-3.5 text-small font-semibold text-ink transition hover:border-line-strong active:scale-98"
                >
                  <Icon aria-hidden="true" className="size-4.5 shrink-0 text-ink-muted" />
                  {platform.label}
                </button>
              </li>
            );
          })}
        </ul>
        {/* Static by design: pressing a platform changes nothing on this MVP. */}
        <p className="mt-4 flex items-start gap-2 text-small text-ink-muted">
          <Info aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-accent-ink" />
          {downloads.hint}
        </p>
      </div>
    </section>
  );
}
