import { metaColours } from "@/styles/meta-colours";

/** Where the visitor's choice is remembered (localStorage). Dark is the default: only a saved "light" changes it. */
export const themeStorageKey = "workchats-theme";

/**
 * Runs in <head>, before anything is painted: sets data-theme on <html> from the visitor's saved choice,
 * so the page never flashes the wrong theme (tokens.css and the theme-light variant in globals.css do the
 * rest). It also listens for the header's theme buttons (any element with data-theme-toggle): a press
 * flips the theme, saves it, updates the browser's theme-color and renames the buttons for what they
 * would do next. Buttons are matched by delegation, so the one in the phone menu, which only exists once
 * the menu is opened, works too. With JavaScript off the page stays dark and the buttons do nothing.
 *
 * Plain ES5 and self-contained, like the other <head> scripts; theme.test.ts runs this exact string.
 */
export const themeScript = `(function(){var d=document,r=d.documentElement,k=${JSON.stringify(themeStorageKey)},c=${JSON.stringify(metaColours)};function apply(t){r.setAttribute("data-theme",t);var m=d.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?c.day:c.night);var b=d.querySelectorAll("[data-theme-toggle]");for(var i=0;i<b.length;i++)b[i].setAttribute("aria-label","Switch to "+(t==="light"?"dark":"light")+" theme")}var t="dark";try{if(localStorage.getItem(k)==="light")t="light"}catch(e){}r.setAttribute("data-theme",t);d.addEventListener("DOMContentLoaded",function(){apply(r.getAttribute("data-theme")==="light"?"light":"dark")});d.addEventListener("click",function(e){var n=e.target;while(n&&n!==d){if(n.hasAttribute&&n.hasAttribute("data-theme-toggle")){var next=r.getAttribute("data-theme")==="light"?"dark":"light";apply(next);try{localStorage.setItem(k,next)}catch(x){}return}n=n.parentNode}})})()`;
