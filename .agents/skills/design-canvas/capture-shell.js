// Run in the browser on any signed-in /resident page of the dev server
// (http://localhost:5173). Returns the app shell exactly as rendered: the
// desktop sidebar, the banner header and the <main> wrapper, using the app's
// real Tailwind classes. Pair it with the compiled CSS from
// http://localhost:5173/app/app.css?direct so the classes resolve.
//
// Placeholders in the returned template:
//   __LOGO__     url of the uploaded app/components/text-logo.svg
//   __BANNER__   url of the uploaded public/banner.jpg
//   __CONTENT__  the page content being designed (the only part to change)
(() => {
  const aside = [...document.querySelectorAll("aside")].find(
    (a) => getComputedStyle(a).display !== "none",
  );
  const header = document.querySelector("header");
  const main = document.querySelector("main");
  const wrap = header.parentElement;
  const root = aside.parentElement;

  const clean = (el) => {
    const c = el.cloneNode(true);
    c.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", "#"));
    c.querySelectorAll("*").forEach((n) => {
      n.removeAttribute("data-discover");
      n.removeAttribute("aria-controls");
      if (n.id && n.id.startsWith("radix-")) n.removeAttribute("id");
    });
    c.querySelectorAll('img[src*="text-logo"]').forEach((i) =>
      i.setAttribute("src", "__LOGO__"),
    );
    c.querySelectorAll("picture").forEach((p) => {
      const img = document.createElement("img");
      img.setAttribute("src", "__BANNER__");
      img.setAttribute("alt", "");
      img.setAttribute("class", `${p.className} w-full h-full object-cover`);
      p.replaceWith(img);
    });
    return c.outerHTML;
  };

  return (
    `<div class="${root.className}">` +
    clean(aside) +
    `<div class="${wrap.className}">` +
    clean(header) +
    `<main class="${main.className}">__CONTENT__</main>` +
    `</div></div>`
  );
})();
