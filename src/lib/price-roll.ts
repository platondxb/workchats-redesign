/*
 * The rolling digits behind a price that changes (price-roll in globals.css). An inline script, like
 * platform.ts and theme.ts: it is not part of the bundle, so it adds no client component and no first-load
 * JavaScript, and it is written in ES5 so every browser runs it. The pricing cards use it (Pricing.tsx marks
 * each price data-roll); the calculator's totals do not roll, by choice, and neither does anything else
 * unless it is marked.
 *
 * Any element marked data-roll holds a figure: its [data-currency] children are the same price in every
 * currency, and CSS shows the chosen one. When the shown text changes, because the currency or the billing
 * period was switched (a radio's change), the script hides the real figure and lays over it a copy built from
 * one element per character that changed (its old and new characters are the cell's ::before and ::after)
 * and plain text for each run of characters that did not. The copy is built when the price changes and
 * removed when the roll ends, so it costs nothing at rest and about twenty elements for a second while the
 * cards roll. It is aria-hidden: the real figure underneath is what assistive technology reads, and the
 * section's live region announces it.
 *
 * - A switch flipped again before a roll has finished replaces it, rolling on from the last figure it was
 *   heading for.
 * - The figure only rolls while it is on screen, and not at all with reduced motion: it simply changes.
 * - Nothing is skipped for any other reason. An earlier version held a roll back when the page was near its
 *   element budget, and so rolled some figures and not others wherever the page had more elements than the
 *   production build (the dev server adds some).
 *
 * With the script off the price simply rises in (price-in), so nothing depends on it.
 */
export const priceRollScript = `(function(){var calm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;if(calm)return;var NB=String.fromCharCode(160),list=[],queued=0;function figure(h){var l=h.querySelectorAll("[data-currency]"),i;for(i=0;i<l.length;i++)if(l[i].offsetParent!==null)return l[i];return null}function read(h){var a=figure(h);return a?a.textContent:""}function num(t){return parseFloat(t.replace(/[^0-9.]/g,""))}function sym(t){return t.replace(/[0-9.,\\s\\u00a0]/g,"")}function lead(t){return t.match(/^\\D*/)[0]}function stop(s){if(!s.ov)return;clearTimeout(s.timer);if(s.ov.parentNode)s.ov.parentNode.removeChild(s.ov);s.ov=null;s.host.classList.remove("price-rolling")}function roll(s,from,to){var h=s.host,a=figure(h),b,ov,same,A,B,n,k=0,pending=0,run="",i,f,t,cell;if(!a)return;b=h.getBoundingClientRect();if(b.bottom<=0||b.top>=innerHeight)return;ov=document.createElement("span");same=lead(from)===lead(to);A=same?from.slice(lead(from).length):from;B=same?to.slice(lead(to).length):to;n=Math.max(A.length,B.length);ov.className="price-roll";ov.setAttribute("aria-hidden","true");ov.style.setProperty("--dir",sym(from)===sym(to)&&num(to)<num(from)?-1:1);ov.style.left=a.offsetLeft+"px";if(same)run=lead(from).replace(/ /g,NB);function still(){if(!run)return;ov.appendChild(document.createTextNode(run));run=""}for(i=0;i<n;i++){f=(same?A.charAt(i-(n-A.length)):A.charAt(i)).replace(" ",NB);t=(same?B.charAt(i-(n-B.length)):B.charAt(i)).replace(" ",NB);if(f===t){run+=t;continue}still();cell=document.createElement("span");cell.className="price-roll-cell";cell.style.setProperty("--i",k++);if(f)cell.setAttribute("data-old",f);if(t)cell.setAttribute("data-new",t);pending+=2;ov.appendChild(cell)}still();function end(){if(s.ov===ov)stop(s)}ov.addEventListener("animationend",function(){if(--pending<=0)end()});s.ov=ov;s.timer=setTimeout(end,2400);h.classList.add("price-rolling");h.appendChild(ov)}function refresh(){var i,s,now,from;queued=0;for(i=0;i<list.length;i++){s=list[i];now=read(s.host);if(now===s.shown)continue;stop(s);from=s.shown;s.shown=now;roll(s,from,now)}}function request(e){var t=e.target;if(t&&t.type==="radio"&&!queued)queued=requestAnimationFrame(refresh)}function init(){var hosts=document.querySelectorAll("[data-roll]"),i;for(i=0;i<hosts.length;i++)list.push({host:hosts[i],shown:read(hosts[i]),ov:null,timer:0});document.addEventListener("change",request)}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init()})()`;
