import { ArrowUpRight, ChatsCircle, FolderOpen, VideoCamera } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import type { JSX } from "react";
import { CallCrop } from "@/components/product/CallCrop";
import { ChannelCrop } from "@/components/product/ChannelCrop";
import { SearchCrop } from "@/components/product/SearchCrop";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SiteLink } from "@/components/ui/SiteLink";
import { TextLink } from "@/components/ui/TextLink";
import { menuIcons } from "@/components/ui/icons";
import { home, type FeatureTab } from "@/content/home";
import { comingSoon } from "@/content/navigation";
import { cx } from "@/lib/cx";

const tabIcons: Record<FeatureTab["id"], Icon> = {
  messaging: ChatsCircle,
  meetings: VideoCamera,
  files: FolderOpen,
};

const crops: Record<FeatureTab["id"], (props: { label: string }) => JSX.Element> = {
  messaging: ChannelCrop,
  meetings: CallCrop,
  files: SearchCrop,
};

/*
 * Phones: the three features are stacked, so nothing is hidden behind a control.
 * Tablet and desktop: a switcher of native radio buttons. CSS shows the panel for the checked radio
 * (the feature-* variants in globals.css), so it works before and without JavaScript, and arrow keys
 * move between options as in any radio group. The three panels share one grid cell, so the area keeps
 * the height of the tallest and nothing below jumps when you switch; the hidden ones are
 * visibility: hidden, which also takes them out of the tab order and the accessibility tree.
 */
const panelClasses = {
  messaging:
    "md:feature-meetings:invisible md:feature-meetings:opacity-0 md:feature-files:invisible md:feature-files:opacity-0",
  meetings: "md:invisible md:opacity-0 md:feature-meetings:visible md:feature-meetings:opacity-100",
  files: "md:invisible md:opacity-0 md:feature-files:visible md:feature-files:opacity-100",
} satisfies Record<FeatureTab["id"], string>;

export function Features() {
  const { features, roadmap } = home;
  return (
    <section id="features" aria-labelledby="features-title" className="features py-section">
      <div className="container-page">
        <SectionHeader
          id="features-title"
          title={features.title}
          intro={features.intro}
          action={features.all}
        />

        <fieldset
          aria-label={features.legend}
          className="mt-10 hidden rounded-full border border-line bg-surface p-1 shadow-raised md:inline-flex"
        >
          {features.tabs.map((tab, index) => {
            const TabIcon = tabIcons[tab.id];
            return (
              <label
                key={tab.id}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-small font-semibold text-ink-muted transition-colors hover:text-ink has-checked:bg-ink has-checked:text-on-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
              >
                <input
                  type="radio"
                  name="feature"
                  id={`feature-${tab.id}`}
                  value={tab.id}
                  defaultChecked={index === 0}
                  className="sr-only"
                />
                <TabIcon aria-hidden="true" className="size-5" />
                {tab.tab}
              </label>
            );
          })}
        </fieldset>

        <div className="mt-8 grid grid-cols-1 gap-6 md:mt-6">
          {features.tabs.map((tab) => {
            const Crop = crops[tab.id];
            return (
              <div
                key={tab.id}
                className={cx(
                  "grid grid-cols-1 content-start gap-8 rounded-lg border border-line bg-surface p-5 switch-in md:col-start-1 md:row-start-1 md:p-8 lg:grid-cols-12 lg:content-stretch lg:gap-12 lg:p-10",
                  panelClasses[tab.id],
                )}
              >
                {/* Top-aligned with the product window (the stage's padding), so the text starts at the same
                    height on every tab instead of moving with the picture's height. */}
                <div className="lg:col-span-5 lg:self-start lg:pt-8">
                  <h3 className="font-display text-subtitle text-ink">{tab.title}</h3>
                  <p className="mt-4 text-body text-ink-muted">{tab.body}</p>
                  <ul className="mt-6 space-y-3">
                    {tab.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-small text-ink before:mt-2 before:size-2 before:shrink-0 before:rounded-full before:bg-accent"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                  <TextLink href={tab.link.href} className="mt-6">
                    {tab.link.label}
                  </TextLink>
                </div>
                <div className="grid content-center rounded-md bg-accent-subtle p-3 sm:p-6 lg:col-span-7 lg:p-8">
                  <Crop label={tab.productLabel} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 lg:mt-20">
          <h3 className="text-heading text-ink">{roadmap.title}</h3>
          <p className="mt-1 text-body text-ink-muted">{roadmap.intro}</p>
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {comingSoon.items.map((item) => {
              const ItemIcon = item.icon ? menuIcons[item.icon] : ArrowUpRight;
              return (
                <li key={item.href}>
                  <SiteLink
                    href={item.href}
                    className="flex h-full lift flex-col rounded-md border border-dashed border-line-strong p-6 hover:border-solid"
                  >
                    <span className="flex items-center justify-between">
                      <ItemIcon aria-hidden="true" className="size-7 text-accent-ink" />
                      <span className="rounded-full bg-tint px-2.5 py-0.5 text-nano font-semibold text-ink-muted">
                        Coming soon
                      </span>
                    </span>
                    <span className="mt-6 font-semibold text-ink">{item.label}</span>
                    <span className="mt-1 text-small text-ink-muted">{item.description}</span>
                  </SiteLink>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
