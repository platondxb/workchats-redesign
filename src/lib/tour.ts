import { home } from "@/content/home";

/**
 * Plays the hero's product tour (components/product/HeroDevices.tsx, styles/tour.css): the app's five parts
 * take turns on both devices, in the order of its own sidebar, and loop.
 *
 * - The pause button's ring is the clock: when its animation ends, the next part comes up (data-current),
 *   and the one after it is put in place invisibly (data-preload) so its images load in time.
 * - It plays only while the devices are on screen, and holds while a mouse rests on them. The pause button
 *   stops and resumes it (WCAG 2.2.2) and names what a press does next.
 * - Not with reduced motion: there it does nothing, the chats screen stays, and tour.css hides the button.
 *   With Save-Data it waits for the play button, so no screen is fetched until the visitor asks.
 *
 * Plain ES5 and self-contained, like the page's other inline scripts; tour.test.ts runs this exact string.
 */
export const tourScript = `(function(){var root=document.getElementById("hero-tour");if(!root)return;var toggle=root.querySelector("[data-tour-toggle]"),stops=${JSON.stringify(home.hero.tour.stops)},labels=${JSON.stringify({ pause: home.hero.tour.pause, play: home.hero.tour.play })},c=navigator.connection;if(!toggle||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;var i=0,ready=false,visible=true,stopped=!!(c&&c.saveData);function show(k){i=k;root.setAttribute("data-current",stops[i]);root.setAttribute("data-preload",stops[(i+1)%stops.length])}function tick(){root.setAttribute("data-tick",root.getAttribute("data-tick")==="a"?"b":"a")}function play(on){if(on){root.setAttribute("data-playing","");show(i);tick()}else root.removeAttribute("data-playing");toggle.setAttribute("aria-label",on?labels.pause:labels.play)}function resume(){if(ready&&visible&&!stopped&&!root.hasAttribute("data-playing"))play(true)}root.addEventListener("animationend",function(e){var t=e.target;if(!root.hasAttribute("data-playing")||!t.classList||!t.classList.contains("tour-ring"))return;show((i+1)%stops.length);tick()});toggle.addEventListener("click",function(){if(root.hasAttribute("data-playing")){stopped=true;play(false)}else{stopped=false;play(true)}});var hover=root.querySelector("[data-tour-hold]");if(hover){hover.addEventListener("pointerenter",function(e){if(e.pointerType==="mouse")root.setAttribute("data-paused","")});hover.addEventListener("pointerleave",function(){root.removeAttribute("data-paused")})}if("IntersectionObserver"in window){new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(visible)resume();else if(root.hasAttribute("data-playing"))play(false)},{threshold:0.1}).observe(root.querySelector('[role="img"]')||root)}function start(){setTimeout(function(){ready=true;resume()},1200)}if(document.readyState==="complete")start();else window.addEventListener("load",start)})()`;
