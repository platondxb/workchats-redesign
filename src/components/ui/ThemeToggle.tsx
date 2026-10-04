import { Moon, Sun } from "@phosphor-icons/react/ssr";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

/**
 * The button that switches between the dark and the light theme. It is a plain server-rendered button:
 * the <head> script in lib/theme.ts finds it by `data-theme-toggle`, so it adds no JavaScript of its own.
 *
 * It shows the theme a press leads to (the sun on the dark page, the moon on the light one), and its
 * name says the same, so a screen reader hears "Switch to light theme". Both icons are in the HTML and
 * CSS shows one (the theme-light variant), so the right one is there before the first paint. The script
 * keeps the name current (hence suppressHydrationWarning on the button, as for any element it fills).
 *
 * `icon` is the header's square button. `menu` is the phone menu's full-width row, which says it in
 * words as well; that row is only mounted once the menu is opened, so it has no name of its own until
 * the script has run, and takes it from its visible text.
 */
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "menu" }) {
  if (variant === "menu") {
    return (
      <LiquidButton tone="glass" data-theme-toggle suppressHydrationWarning>
        <Sun aria-hidden="true" className="size-5 theme-light:hidden" />
        <Moon aria-hidden="true" className="hidden size-5 theme-light:block" />
        <span className="theme-light:hidden">Light theme</span>
        <span className="hidden theme-light:inline">Dark theme</span>
      </LiquidButton>
    );
  }
  return (
    <LiquidButton
      tone="glass"
      size="icon"
      data-theme-toggle
      aria-label="Switch to light theme"
      suppressHydrationWarning
    >
      <Sun aria-hidden="true" className="size-5 theme-light:hidden" />
      <Moon aria-hidden="true" className="hidden size-5 theme-light:block" />
    </LiquidButton>
  );
}
