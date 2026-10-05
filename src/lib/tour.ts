import { home } from "@/content/home";

/** How long each part of the app stays on the devices, in milliseconds. */
const stepMs = 3000;

/**
 * Plays the hero's product tour (components/product/HeroDevices.tsx, styles/tour.css): the app's five parts
 * take turns on both devices, in the order of its own sidebar, and loop.
 *
 * - A timer is the clock: every three seconds the next part comes up (data-current), and the one after it
 *   is put in place invisibly (data-preload) so its images load in time. After the last part, the first
 *   comes round again, for as long as the page is open.
 * - It plays only while the devices are on screen, and picks up where it was when they come back.
 * - There is no pause button and nothing else that holds it, not even a mouse resting on it (the owner's
 *   decision, 5 October 2026): the tour is a picture of the app, not something to operate. WCAG 2.2.2
 *   (pause, stop, hide) is therefore met only by what the visitor's device can do: with reduced motion it
 *   does nothing and the chats screen stays, and with Save-Data it does nothing either, so no screen is
 *   fetched that the visitor did not ask to see.
 *
 * Plain ES5 and self-contained, like the page's other inline scripts; tour.test.ts runs this exact string.
 */
export const tourScript = `(function(){var root=document.getElementById("hero-tour");if(!root)return;var stops=${JSON.stringify(home.hero.tour.stops)},c=navigator.connection;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||(c&&c.saveData))return;var i=0,timer=0,ready=false,visible=true;function show(k){i=k;root.setAttribute("data-current",stops[i]);root.setAttribute("data-preload",stops[(i+1)%stops.length])}function run(){clearTimeout(timer);if(!ready||!visible)return;if(!root.hasAttribute("data-current"))show(i);timer=setTimeout(function(){show((i+1)%stops.length);run()},${stepMs})}if("IntersectionObserver"in window){new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;run()},{threshold:0.1}).observe(root.querySelector('[role="img"]')||root)}function start(){setTimeout(function(){ready=true;run()},1200)}if(document.readyState==="complete")start();else window.addEventListener("load",start)})()`;
