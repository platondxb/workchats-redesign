import { DownloadSimple } from "@phosphor-icons/react/ssr";
import { Laptop, Phone, TourToggle } from "@/components/product/HeroDevices";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { home } from "@/content/home";
import { genericDownloadLabel, platforms, type PlatformId } from "@/content/site";
import { tourScript } from "@/lib/tour";

/**
 * Which download label shows: the one for the visitor's platform once the <head> script has set data-os
 * on <html> (lib/platform.ts), or the neutral one. Every label is in the HTML and CSS picks one before
 * the first paint, so the button never changes width on screen.
 */
const osLabelClasses: Record<PlatformId, string> = {
  macos: "hidden os-macos:inline",
  windows: "hidden os-windows:inline",
  linux: "hidden os-linux:inline",
  ios: "hidden os-ios:inline",
  android: "hidden os-android:inline",
  web: "hidden os-web:inline",
};
const neutralLabelClasses =
  "os-macos:hidden os-windows:hidden os-linux:hidden os-ios:hidden os-android:hidden os-web:hidden";

/**
 * The first screen: what Workchats is and what trying it costs, the two actions, then the product. The
 * headline is set in two tones (the owner's direction): the first line says what it is, the second what it
 * costs to try. The free plan sits again beside the action, with the price of the next step.
 *
 * Then the product, as it really looks: the desktop app on a laptop and the mobile app on a phone, in the
 * visitor's theme, its five parts taking turns on both screens (HeroDevices.tsx, lib/tour.ts). The laptop's
 * lid opens as the page scrolls (ContainerScroll). On phones, the phone itself is the device.
 */
export function Hero() {
  const { hero } = home;
  return (
    <section aria-labelledby="hero-title" className="overflow-x-clip pt-10 pb-20 md:pt-16">
      <div className="container-page">
        <ContainerScroll
          id="hero-tour"
          className="tour"
          label={hero.productLabel}
          overlay={<TourToggle className="absolute bottom-14 left-0 z-raised" />}
          titleComponent={
            <>
              <h1 id="hero-title" className="font-display text-display">
                <span className="block text-on-night">{hero.title[0]}</span>{" "}
                <span className="block text-on-night-subtle">{hero.title[1]}</span>
              </h1>
              <p className="mx-auto mt-6 max-w-lead text-lead text-on-night-muted">{hero.lead}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <LiquidButton href={hero.primary.href} size="lg" data-cta="hero" className="max-sm:w-full">
                  {hero.primary.label}
                </LiquidButton>
                <LiquidButton
                  href={hero.download.href}
                  tone="glass"
                  size="lg"
                  data-download="auto"
                  data-location="hero"
                  className="max-sm:w-full"
                >
                  <DownloadSimple aria-hidden="true" className="size-5" />
                  <span className={neutralLabelClasses}>{genericDownloadLabel}</span>
                  {platforms.map((platform) => (
                    <span key={platform.id} className={osLabelClasses[platform.id]}>
                      {platform.cta}
                    </span>
                  ))}
                </LiquidButton>
              </div>
              <p className="mt-4 text-small text-on-night-subtle">{hero.caption}</p>
            </>
          }
        >
          <Laptop />
          <Phone className="mx-auto w-68 cs-card md:hidden lg:absolute lg:right-4 lg:-bottom-12 lg:z-raised lg:block lg:w-56 lg:cs-aside xl:right-8 xl:w-64" />
        </ContainerScroll>
        <script dangerouslySetInnerHTML={{ __html: tourScript }} />
      </div>
    </section>
  );
}
