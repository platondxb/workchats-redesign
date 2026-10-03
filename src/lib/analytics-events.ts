/**
 * The page's analytics events, sent through the consent-gated GA4 setup (components/consent).
 *
 * One small inline script listens on the document, so the events cost no JavaScript bundle and no
 * per-button handlers. It sends only when `window.gtag` exists, and gtag is only loaded after the visitor
 * accepts analytics (ConsentManager): before consent, and with analytics switched off, nothing is sent and
 * nothing is queued.
 *
 * | Event                     | When                                         | Parameters                 |
 * | ------------------------- | -------------------------------------------- | -------------------------- |
 * | cta_click                 | A press on any element with data-cta         | location, label            |
 * | download_click            | A press on any element with data-download    | platform, location         |
 * |                           | ("auto" reports the detected platform)        |                            |
 * | pricing_period_change     | The billing period switch changes            | period                     |
 * | pricing_currency_change   | A currency switch changes                    | currency, location         |
 * | calculator_change         | The team-size slider is released             | team_size                  |
 * | faq_open                  | A question in the FAQ opens                  | question                   |
 */
export const analyticsEvents = {
  ctaClick: "cta_click",
  downloadClick: "download_click",
  periodChange: "pricing_period_change",
  currencyChange: "pricing_currency_change",
  calculatorChange: "calculator_change",
  faqOpen: "faq_open",
} as const;

const e = analyticsEvents;

export const analyticsEventsScript = `(function(){var w=window,d=document;function send(n,p){if(typeof w.gtag==="function")w.gtag("event",n,p)}function txt(el){return(el.getAttribute("aria-label")||el.textContent||"").replace(/\\s+/g," ").trim()}d.addEventListener("click",function(ev){var t=ev.target;if(!t||!t.closest)return;var c=t.closest("[data-cta]");if(c)send("${e.ctaClick}",{location:c.getAttribute("data-cta"),label:txt(c)});var dl=t.closest("[data-download]");if(dl){var p=dl.getAttribute("data-download");if(p==="auto")p=d.documentElement.getAttribute("data-os")||"unknown";send("${e.downloadClick}",{platform:p,location:dl.getAttribute("data-location")||"downloads"})}},true);d.addEventListener("change",function(ev){var t=ev.target;if(!t)return;if(t.type==="radio"){if(t.name==="billing")send("${e.periodChange}",{period:t.value});else if(t.name==="currency")send("${e.currencyChange}",{currency:t.value,location:"pricing"});else if(t.name==="cost-currency")send("${e.currencyChange}",{currency:t.value,location:"calculator"})}else if(t.id==="team-size")send("${e.calculatorChange}",{team_size:Number(t.value)})});d.addEventListener("toggle",function(ev){var t=ev.target;if(t&&t.open&&t.getAttribute&&t.getAttribute("data-faq"))send("${e.faqOpen}",{question:t.getAttribute("data-faq")})},true)})()`;
