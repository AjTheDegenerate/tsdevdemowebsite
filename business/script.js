(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.querySelector("#nav");
  const toggle = document.querySelector(".nav-toggle");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    toggle?.setAttribute("aria-expanded","false");
  }));

  // Reveal only after the browser has painted the page, keeping first render cheap.
  const revealTargets = document.querySelectorAll("section, .work-card, .process-grid article, .why-list article, .price-card, .contact-row");
  if (!reduced && "IntersectionObserver" in window) {
    revealTargets.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.transition = `opacity .55s cubic-bezier(.22,1,.36,1) ${Math.min(i * 18, 180)}ms, transform .55s cubic-bezier(.22,1,.36,1) ${Math.min(i * 18, 180)}ms`;
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold:.08, rootMargin:"0px 0px -8% 0px"});
    requestAnimationFrame(() => revealTargets.forEach(el => observer.observe(el)));
  }

  // Small rAF-based magnetic interaction: one write per frame, no layout reads in the loop.
  if (!reduced && window.matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll(".magnetic").forEach(el => {
      let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
      const tick = () => {
        x += (tx - x) * .18; y += (ty - y) * .18;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
        if (Math.abs(tx-x)+Math.abs(ty-y) > .05) raf = requestAnimationFrame(tick); else raf = 0;
      };
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width/2)) * .08;
        ty = (e.clientY - (r.top + r.height/2)) * .08;
        if (!raf) raf = requestAnimationFrame(tick);
      });
      el.addEventListener("pointerleave", () => {
        tx = ty = 0;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }
})();