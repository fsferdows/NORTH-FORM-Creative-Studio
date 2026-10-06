import React, { useEffect, useState, type FormEvent } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function App() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Smooth scroll setup with Lenis 1.0.42
    const lenis = new Lenis({
      duration: 1.15,
      wheelMultiplier: 0.9,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    // Header scrolled state and scroll progress bar
    const updateScrollUI = () => {
      const header = document.querySelector(".site-header");
      const progress = document.querySelector<HTMLElement>(".scroll-progress");
      const scrollY = window.scrollY;
      if (header) {
        header.classList.toggle("is-scrolled", scrollY > 24);
      }
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      }
    };
    window.addEventListener("scroll", updateScrollUI, { passive: true });
    updateScrollUI();

    // Montréal Studio Clock
    const updateClock = () => {
      try {
        const t = new Intl.DateTimeFormat("en-CA", {
          timeZone: "America/Montreal",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZoneName: "short",
        }).format(new Date());
        const clock = document.getElementById("clock");
        if (clock) clock.textContent = t;
      } catch (err) {
        // Fallback
        const d = new Date();
        const clock = document.getElementById("clock");
        if (clock) clock.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")} EST`;
      }
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 60000);

    // Preloader exit timeline (duration 0.9, power4.inOut)
    const preloader = document.querySelector<HTMLElement>(".preloader");
    if (preloader) {
      preloader.style.display = "flex";
      document.body.classList.add("is-loading");
    }

    const preloaderTl = gsap.timeline();
    preloaderTl
      .to(".preloader span", { y: -20, opacity: 0, duration: 0.55, ease: "power3.in" })
      .to(
        ".preloader",
        {
          yPercent: -100,
          duration: 0.9,
          ease: "power4.inOut",
          onComplete: () => {
            document.body.classList.remove("is-loading");
            if (preloader) preloader.style.display = "none";
          },
        },
        "-=0.1"
      )
      .from(".site-header", { y: -30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.35")
      .from(".hero-topcopy .line-mask span", { yPercent: 110, duration: 1, ease: "power4.out" }, "-=0.6")
      .from(".hero-link", { y: 15, opacity: 0, duration: 0.7 }, "-=0.45")
      .from(".hero-word .line-mask span, .hero-word > span", { yPercent: 110, duration: 1.15, ease: "power4.out" }, "-=0.9");

    // Hero GSAP animations
    gsap.to(".hero-media img, .hero-media video", { scale: 1, duration: 1.8, ease: "power3.out" });
    gsap.to(".hero-media", {
      yPercent: 20,
      scale: 0.96,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero-word", {
      yPercent: 35,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Studio Intro GSAP animations
    gsap.utils.toArray<HTMLElement>(".intro-title .line-mask span").forEach((line, i) => {
      gsap.from(line, {
        yPercent: 110,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: { trigger: line, start: "top 88%" },
        delay: i * 0.06,
      });
    });

    gsap.from(".intro-portrait", {
      clipPath: "inset(100% 0 0 0)",
      duration: 1.25,
      ease: "power4.out",
      scrollTrigger: { trigger: ".intro-portrait", start: "top 82%" },
    });
    gsap.to(".intro-portrait img", {
      yPercent: -9,
      ease: "none",
      scrollTrigger: { trigger: ".intro-portrait", start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.from(".keywords, .intro-copy, .stats-mini", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.8,
      scrollTrigger: { trigger: ".intro-lower", start: "top 78%" },
    });

    // Stats counter animation
    function animateCounter(el: HTMLElement) {
      const target = parseFloat(el.dataset.count || "0");
      const suffix = el.dataset.suffix || "";
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power3.out",
        onUpdate: () => {
          const val = Number.isInteger(target) ? Math.round(obj.v) : obj.v.toFixed(1);
          el.textContent = val + suffix;
        },
      });
    }
    document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => animateCounter(el),
      });
    });

    // Continuous Ticker
    gsap.to(".ticker-track", { xPercent: -50, ease: "none", duration: 22, repeat: -1 });

    // Project cards
    document.querySelectorAll<HTMLElement>(".project").forEach((project) => {
      const media = project.querySelector(".project-media");
      const img = media?.querySelector("img, video");
      const title = project.querySelector("h3 span");
      const copyP = project.querySelector(".project-copy p");
      const side = project.querySelector(".project-side");

      if (media) {
        gsap.fromTo(
          media,
          { scale: 0.84 },
          { scale: 1.04, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: true } }
        );
      }
      if (img) {
        gsap.fromTo(
          img,
          { yPercent: -6, scale: 1.08 },
          { yPercent: 6, scale: 1, ease: "none", scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: true } }
        );
      }
      if (title) {
        gsap.from(title, {
          yPercent: 110,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: { trigger: project, start: "top 70%" },
        });
      }
      if (copyP) {
        gsap.from(copyP, {
          y: 20,
          opacity: 0,
          duration: 0.7,
          delay: 0.15,
          scrollTrigger: { trigger: project, start: "top 68%" },
        });
      }
      if (side) {
        gsap.from(side, {
          x: 40,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: { trigger: project, start: "top 65%" },
        });
      }
    });

    // MatchMedia for min-width: 901px
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      gsap.utils.toArray<HTMLElement>(".project").forEach((project, i) => {
        const media = project.querySelector(".project-media");
        if (media) {
          gsap.to(media, {
            rotation: i % 2 ? 1.8 : -1.8,
            yPercent: -5,
            ease: "none",
            scrollTrigger: { trigger: project, start: "top bottom", end: "bottom top", scrub: 1 },
          });
        }
      });
      gsap.utils.toArray<HTMLElement>(".plan").forEach((card, i) => {
        gsap.fromTo(
          card,
          { rotate: i === 0 ? -3 : i === 2 ? 3 : 0 },
          { rotate: 0, ease: "none", scrollTrigger: { trigger: ".engagement", start: "top bottom", end: "center center", scrub: 1 } }
        );
      });
      gsap.to(".quote-photo", {
        xPercent: 35,
        rotation: 8,
        ease: "none",
        scrollTrigger: { trigger: ".testimonial", start: "top bottom", end: "bottom top", scrub: 1 },
      });
      gsap.utils.toArray<HTMLElement>(".archive-row").forEach((row, i) => {
        gsap.from(row, {
          x: i % 2 ? -70 : 70,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: row, start: "top 88%" },
        });
      });
      gsap.to(".cinematic-card", {
        rotation: 18,
        xPercent: 120,
        ease: "none",
        scrollTrigger: { trigger: ".cinematic", start: "top top", end: "bottom bottom", scrub: 1 },
      });
      gsap.to(".cinematic h2", {
        scale: 0.82,
        letterSpacing: "-.09em",
        ease: "none",
        scrollTrigger: { trigger: ".cinematic", start: "top top", end: "bottom bottom", scrub: 1 },
      });
    });

    // Capabilities pinned text reveal
    const capWords = gsap.utils.toArray<HTMLElement>(".cap-statement span");
    const capTL = gsap.timeline({
      scrollTrigger: { trigger: ".cap-intro", start: "top top", end: "+=150%", pin: true, scrub: true },
    });
    capWords.forEach((w, i) => capTL.to(w, { color: "#fff", duration: 1 }, i));
    capTL.to(".cap-statement", { y: -40, duration: 1 }, 0);
    gsap.to(".cap-photo", {
      y: 100,
      ease: "none",
      scrollTrigger: { trigger: ".cap-intro", start: "top bottom", end: "bottom top", scrub: true },
    });

    gsap.utils.toArray<HTMLElement>(".cap-row").forEach((row) => {
      gsap.from(row.children, {
        y: 50,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 82%" },
      });
      const img = row.querySelector(".image");
      if (img) {
        gsap.from(img, {
          clipPath: "inset(0 100% 0 0)",
          duration: 1,
          ease: "power4.out",
          scrollTrigger: { trigger: row, start: "top 80%" },
        });
      }
    });

    // Cap row mousemove tilt
    const capRows = document.querySelectorAll<HTMLElement>(".cap-row");
    const handleCapMouseMove = (e: MouseEvent) => {
      const row = (e.currentTarget as HTMLElement);
      const img = row.querySelector<HTMLElement>(".image");
      if (!img) return;
      const r = row.getBoundingClientRect();
      gsap.to(img, {
        x: (e.clientX - r.left - r.width / 2) * 0.12,
        y: (e.clientY - r.top - r.height / 2) * 0.12,
        duration: 0.45,
        ease: "power3.out",
      });
    };
    const handleCapMouseLeave = (e: MouseEvent) => {
      const row = (e.currentTarget as HTMLElement);
      const img = row.querySelector<HTMLElement>(".image");
      if (img) gsap.to(img, { x: 0, y: 0, duration: 0.5 });
    };
    capRows.forEach((row) => {
      row.addEventListener("mousemove", handleCapMouseMove);
      row.addEventListener("mouseleave", handleCapMouseLeave);
    });

    // Engagement, Testimonial, Cinematic, Big stats, Journal, Footer
    gsap.from(".section-title", {
      yPercent: 100,
      opacity: 0,
      duration: 1,
      scrollTrigger: { trigger: ".engagement", start: "top 75%" },
    });
    gsap.from(".plan", {
      y: 90,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".plans", start: "top 78%" },
    });
    gsap.from(".quote-photo", {
      clipPath: "inset(50% 50% 50% 50%)",
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: { trigger: ".testimonial", start: "top 70%" },
    });
    gsap.from(".quote", {
      y: 70,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: ".testimonial", start: "top 68%" },
    });
    gsap.from(".archive-row", {
      y: 30,
      opacity: 0,
      stagger: 0.08,
      duration: 0.7,
      scrollTrigger: { trigger: ".archive-list", start: "top 80%" },
    });

    gsap.fromTo(
      ".cinematic-bg img",
      { scale: 1.12 },
      { scale: 1, ease: "none", scrollTrigger: { trigger: ".cinematic", start: "top top", end: "bottom top", scrub: true } }
    );
    gsap.fromTo(
      ".cinematic h2",
      { xPercent: -18 },
      { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".cinematic", start: "top bottom", end: "center center", scrub: true } }
    );
    gsap.from(".cinematic-card", {
      y: 260,
      opacity: 0,
      rotate: 4,
      ease: "none",
      scrollTrigger: { trigger: ".cinematic", start: "top 70%", end: "center center", scrub: true },
    });
    gsap.from(".cinematic-cta", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: { trigger: ".cinematic", start: "center 55%" },
    });

    gsap.utils.toArray<HTMLElement>(".stat").forEach((stat, i) => {
      gsap.from(stat, {
        y: 45,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.05,
        scrollTrigger: { trigger: stat, start: "top 85%" },
      });
    });

    gsap.utils.toArray<HTMLElement>(".journal-item").forEach((item, i) => {
      gsap.from(item, {
        y: i % 2 ? -70 : 70,
        opacity: 0,
        duration: 1,
        scrollTrigger: { trigger: item, start: "top 85%" },
      });
      const img = item.querySelector("img");
      if (img) {
        gsap.to(img, {
          yPercent: i % 2 ? 7 : -7,
          ease: "none",
          scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    });

    gsap.from(".footer-main > *", {
      y: 50,
      opacity: 0,
      stagger: 0.15,
      duration: 1,
      scrollTrigger: { trigger: ".footer", start: "top 75%" },
    });
    gsap.from(".footer-word", {
      yPercent: 80,
      duration: 1.2,
      ease: "power4.out",
      scrollTrigger: { trigger: ".footer", start: "top 40%" },
    });
    gsap.to(".footer-word", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true },
    });

    // Custom Cursor with Lerp Logic (cx += (mx-cx)*.14)
    const cursor = document.querySelector<HTMLElement>(".cursor-label");
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0;
    const handleCursorMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", handleCursorMove);

    const cursorTicker = () => {
      cx += (mx - cx) * 0.14;
      cy += (my - cy) * 0.14;
      if (cursor) gsap.set(cursor, { x: cx, y: cy });
    };
    gsap.ticker.add(cursorTicker);

    const hoverMedias = document.querySelectorAll<HTMLElement>(".hover-media");
    hoverMedias.forEach((el) => {
      el.addEventListener("mouseenter", () => cursor && gsap.to(cursor, { opacity: 1, scale: 1, duration: 0.25 }));
      el.addEventListener("mouseleave", () => cursor && gsap.to(cursor, { opacity: 0, scale: 0.7, duration: 0.25 }));
      el.addEventListener("mousemove", () => {
        const target = el.querySelector("img, video");
        if (target) gsap.to(target, { scale: 1.025, duration: 0.4, overwrite: true });
      });
      el.addEventListener("mouseleave", () => {
        const target = el.querySelector("img, video");
        if (target) gsap.to(target, { scale: 1, duration: 0.4, overwrite: true });
      });
    });

    // Archive Preview Cursor Follow & Thumbnail Hover
    const preview = document.querySelector<HTMLElement>(".archive-preview");
    const previewImg = preview?.querySelector<HTMLImageElement>("img");
    const handlePreviewMove = (e: MouseEvent) => {
      if (preview) {
        gsap.to(preview, { x: e.clientX + 180, y: e.clientY, duration: 0.45, ease: "power3.out" });
      }
    };
    window.addEventListener("mousemove", handlePreviewMove);

    const archiveRows = document.querySelectorAll<HTMLElement>(".archive-row");
    archiveRows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        if (previewImg && row.dataset.preview) {
          previewImg.src = row.dataset.preview;
        }
        if (preview) gsap.to(preview, { opacity: 1, scale: 1, duration: 0.3 });
        archiveRows.forEach((r) => {
          if (r !== row) r.style.opacity = "0.35";
        });
      });
      row.addEventListener("mouseleave", () => {
        if (preview) gsap.to(preview, { opacity: 0, scale: 0.85, duration: 0.25 });
        archiveRows.forEach((r) => {
          r.style.opacity = "1";
        });
      });
    });

    // Accordion FAQ interaction
    const faqItems = document.querySelectorAll<HTMLElement>(".faq-item");
    faqItems.forEach((item) => {
      const q = item.querySelector<HTMLButtonElement>(".faq-q");
      const a = item.querySelector<HTMLElement>(".faq-a");
      if (q && a) {
        q.addEventListener("click", () => {
          faqItems.forEach((other) => {
            if (other !== item) {
              other.classList.remove("open");
              const otherA = other.querySelector<HTMLElement>(".faq-a");
              if (otherA) gsap.to(otherA, { height: 0, duration: 0.45, ease: "power2.inOut" });
            }
          });
          const open = item.classList.toggle("open");
          gsap.to(a, { height: open ? a.scrollHeight : 0, duration: 0.5, ease: "power2.inOut" });
        });
      }
    });

    // Video Autoplay & IntersectionObserver presets
    const videos = document.querySelectorAll<HTMLVideoElement>("video[data-aura-video-preset]");
    videos.forEach((video) => {
      video.muted = true;
      video.playsInline = true;
      const preset = video.dataset.auraVideoPreset || "loop-in-view";
      if (!("IntersectionObserver" in window)) {
        video.play().catch(() => {});
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (preset === "play-once" && (video as any).__auraVideoPlayed) {
                return;
              }
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        },
        { threshold: 0.35 }
      );
      if (preset === "play-once") {
        video.addEventListener("ended", () => {
          (video as any).__auraVideoPlayed = true;
        }, { once: true });
      }
      observer.observe(video);
    });

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("scroll", updateScrollUI);
      window.removeEventListener("mousemove", handleCursorMove);
      window.removeEventListener("mousemove", handlePreviewMove);
      clearInterval(clockInterval);
      gsap.ticker.remove(lenisTicker);
      gsap.ticker.remove(cursorTicker);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      mm.revert();
    };
  }, []);

  return (
    <>
<div className="scroll-progress" aria-hidden="true"></div>
    <div className="noise"></div>
    <div className="preloader"><span>NORTH/FORM</span></div>

    <header className="site-header" style={{ transition: "background-color 0.35s, backdrop-filter 0.35s, -webkit-backdrop-filter 0.35s, border-color 0.35s, box-shadow 0.35s, height 0.35s" }}>
      <a href="#top" className="logo">
        <b>NORTH</b>
        <i>/</i>
        <b>FORM</b>
      </a>
      <nav className="nav">
        <a href="#work">Work</a>
        <a href="#studio">Studio</a>
        <a href="#capabilities">Capabilities</a>
        <a href="#contact">Contact</a>
      </nav>
      <a href="#contact" className="header-cta">Start a project ↗</a>
    </header>

    <main id="top">
      <section className="hero section">
        <div className="hero-media">
          <video src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/generated-videos/8bd0314a-9525-4a13-996e-2c37cbd9e514/1784436357607-9c22882e-f726-4971-b85d-f7b5276000ff.mp4" poster="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d1d195f0-17d7-4654-a1fc-c9e3192705c4_1600w.webp" data-aura-generated-video="true" data-aura-video-preset="play-once" muted playsInline preload="metadata" aria-label="Editorial portrait" className="h-full w-full object-cover"></video>
        </div>
        <div className="hero-topcopy">
          <div className="line-mask">
            <span>
              Independent creative studio shaping campaigns, identities, and
              digital experiences for ambitious brands.
            </span>
          </div>
          <a className="hero-link" href="#work">View selected work</a>
        </div>
        <div className="hero-markers">
          <span>Montréal, CA</span>
          <span>45.5019° N</span>
          <span className="cross"></span>
        </div>
        <div className="hero-word display line-mask">
          <span>
            NORTH
            <span className="slash">/</span>
            FORM
          </span>
        </div>
        <div className="hero-spacer"></div>
      </section>

      <section className="intro paper diagonal-top" id="studio">
        <div className="container grid12">
          <div className="intro-meta eyebrow">
            <span>01 / Studio</span>
            <span>© 2026</span>
          </div>
          <h1 className="intro-title display">
            <div className="line-mask"><span>We build visual systems</span></div>
            <div className="line-mask"><span>where identity, motion,</span></div>
            <div className="line-mask"><span>image and digital become</span></div>
            <div className="line-mask"><span>one language.</span></div>
          </h1>
        </div>
        <div className="container grid12 intro-lower">
          <div className="intro-portrait">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1cad46d6-7825-49c7-aa11-2764c150eb8c_800w.webp" alt="Creative portrait" />
          </div>
          <div className="keywords">
            Direction
            <br />
            Identity
            <br />
            Motion
            <br />
            Digital
          </div>
          <div className="intro-copy">
            <p>
              We partner with ambitious teams to turn strategic thinking into
              memorable visual systems.
            </p>
            <p>
              From the first idea to the final interaction, every detail is
              built to communicate with precision.
            </p>
          </div>
          <div className="stats-mini">
            <div>
              <strong data-count="84">0</strong>
              <span>Projects delivered</span>
            </div>
            <div>
              <strong data-count="11">0</strong>
              <span>Countries reached</span>
            </div>
            <div>
              <strong data-count="72">0</strong>
              <span>Returning clients %</span>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker paper">
        <div className="ticker-track">
          <span>Kanto</span>
          <span>Axiom</span>
          <span>Lumen</span>
          <span>Vestra</span>
          <span>Monocle</span>
          <span>Terrain</span>
          <span>Noma</span>
          <span>Circa</span>
          <span>Kanto</span>
          <span>Axiom</span>
          <span>Lumen</span>
          <span>Vestra</span>
          <span>Monocle</span>
          <span>Terrain</span>
          <span>Noma</span>
          <span>Circa</span>
        </div>
      </div>

      <section className="projects paper" id="work">
        <div className="container">
          <div className="projects-head">
            <h2 className="display">Selected Work</h2>
            <div className="eyebrow">2024—2026</div>
          </div>

          <article className="project">
            <div className="project-copy">
              <h3 className="display line-mask"><span>Silent Geometry</span></h3>
              <p>
                Brand film
                <br />
                2026
              </p>
            </div>
            <div className="project-media hover-media">
              <video src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/generated-videos/8bd0314a-9525-4a13-996e-2c37cbd9e514/1784436916049-996a1369-4925-4293-9614-7cc8a1164acb.mp4" poster="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ee8e4ce6-9691-46fc-9cbf-8f995d7e8488_1600w.webp" data-aura-generated-video="true" data-aura-video-preset="loop-in-view" muted playsInline preload="metadata" loop aria-label="Silent Geometry" className="h-full w-full object-cover"></video>
            </div>
            <div className="project-side">
              01 / 04
              <div className="project-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/bf85803f-e1fc-418c-94f7-c4f99a4eddc4_800w.webp" alt="Portrait thumbnail" />
              </div>
            </div>
          </article>

          <article className="project">
            <div className="project-copy">
              <h3 className="display line-mask"><span>Outer State</span></h3>
              <p>
                Fashion campaign
                <br />
                2025
              </p>
            </div>
            <div className="project-media hover-media">
              <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&amp;fit=crop&amp;w=2000&amp;q=90" alt="Outer State" />
            </div>
            <div className="project-side">
              02 / 04
              <div className="project-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/48af377b-c03c-4ecb-939f-47dfa5a175a1_800w.webp" alt="Portrait thumbnail" />
              </div>
            </div>
          </article>

          <article className="project">
            <div className="project-copy">
              <h3 className="display line-mask"><span>Still Moving</span></h3>
              <p>
                Digital experience
                <br />
                2025
              </p>
            </div>
            <div className="project-media hover-media">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/e2449689-711a-4092-9414-985b099e2099_1600w.webp" alt="Still Moving" />
            </div>
            <div className="project-side">
              03 / 04
              <div className="project-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/1cad46d6-7825-49c7-aa11-2764c150eb8c_800w.webp" alt="Portrait thumbnail" />
              </div>
            </div>
          </article>

          <article className="project">
            <div className="project-copy">
              <h3 className="display line-mask"><span>Future Matter</span></h3>
              <p>
                Art direction
                <br />
                2024
              </p>
            </div>
            <div className="project-media hover-media">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/3fff90e0-12ec-478c-9afa-a8550e9b52e3_1600w.webp" alt="Future Matter" />
            </div>
            <div className="project-side">
              04 / 04
              <div className="project-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d59e2c33-a3b5-4390-a20c-c2154a1a0f6c_800w.webp" alt="Portrait thumbnail" />
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="capabilities dark diagonal-top" id="capabilities">
        <div className="container">
          <div className="eyebrow">02 / Capabilities</div>
          <div className="cap-intro">
            <div className="cap-statement display">
              <span>Strategy becomes structure.</span>
              <span>Structure becomes image.</span>
              <span>Image becomes experience.</span>
            </div>
            <div className="cap-photo">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/e6366a9f-2edd-47bf-90c2-c450208e3cfb_800w.webp" alt="Studio portrait" />
            </div>
          </div>

          <div className="cap-row">
            <div className="num">01</div>
            <div className="image">
              <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&amp;fit=crop&amp;w=900&amp;q=85" alt="Art direction" />
            </div>
            <h3 className="display">Art Direction</h3>
            <p>
              Visual concepts, campaign worlds, casting direction, styling
              systems, and image frameworks.
            </p>
          </div>
          <div className="cap-row">
            <div className="num">02</div>
            <div className="image">
              <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/variants/520a171e-7d8c-49b9-af99-096a7a699892/320w.png" alt="Identity systems" />
            </div>
            <h3 className="display">Identity Systems</h3>
            <p>
              Brand language, typography, art systems, guidelines, and scalable
              creative direction.
            </p>
          </div>
          <div className="cap-row">
            <div className="num">03</div>
            <div className="image">
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&amp;fit=crop&amp;w=900&amp;q=85" alt="Digital experiences" />
            </div>
            <h3 className="display">Digital Experiences</h3>
            <p>
              Interactive websites, motion systems, prototypes, and expressive
              digital launches.
            </p>
          </div>
        </div>
      </section>

      <section className="engagement paper diagonal-top">
        <div className="container">
          <div className="eyebrow">03 / Engagement</div>
          <h2 className="section-title display">Ways to Work Together</h2>
          <div className="plans">
            <div className="plan">
              <small>01 / Sprint</small>
              <h3>Direction Sprint</h3>
              <div className="price">$2,400</div>
              <ul>
                <li>Visual direction</li>
                <li>Moodboard system</li>
                <li>Two core concepts</li>
                <li>Final presentation</li>
              </ul>
              <a href="#contact">
                <span>Begin project</span>
                <span>↗</span>
              </a>
            </div>
            <div className="plan">
              <small>02 / Identity</small>
              <h3>Identity System</h3>
              <div className="price">$7,800</div>
              <ul>
                <li>Brand strategy</li>
                <li>Identity design</li>
                <li>Typography and color</li>
                <li>Brand guidelines</li>
                <li>Launch assets</li>
              </ul>
              <a href="#contact">
                <span>Begin project</span>
                <span>↗</span>
              </a>
            </div>
            <div className="plan dark-card">
              <small>03 / Full</small>
              <h3>Full Experience</h3>
              <div className="price">From $14,500</div>
              <ul>
                <li>Creative direction</li>
                <li>Brand system</li>
                <li>Campaign assets</li>
                <li>Motion language</li>
                <li>Website design</li>
              </ul>
              <a href="#contact">
                <span>Begin project</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial paper">
        <div className="container grid12 quote-grid">
          <div className="quote-photo">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/95a6559d-388d-45c7-9ed3-b3d3fe4efa9a_800w.webp" alt="Client portrait" />
          </div>
          <blockquote className="quote display">
            “NORTH/FORM gave us more than a visual identity. They gave the
            entire team a clearer way to think, communicate and launch.”
          </blockquote>
          <div className="quote-author">
            <strong>Mara Ellison</strong>
            <br />
            Founder, Field Assembly
          </div>
          <div className="quote-metrics">
            <div className="metric">
              <strong data-count="84">0</strong>
              <span>Launches</span>
            </div>
            <div className="metric">
              <strong data-count="96">0</strong>
              <span>Client retention %</span>
            </div>
            <div className="metric">
              <strong data-count="14">0</strong>
              <span>International awards</span>
            </div>
          </div>
        </div>
      </section>

      <section className="archive paper">
        <div className="container">
          <h2 className="display">Archive / Selected Collaborations</h2>
          <div className="archive-list">
            <div className="archive-row" data-preview="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&amp;fit=crop&amp;w=900&amp;q=85">
              <span>2026</span>
              <span>Axiom</span>
              <span>Campaign Direction</span>
              <div className="archive-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/cdb06f1d-ba81-4122-995e-6f03d6cfbea8_320w.webp" alt="Axiom" />
              </div>
            </div>
            <div className="archive-row" data-preview="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&amp;fit=crop&amp;w=900&amp;q=85">
              <span>2026</span>
              <span>Noma</span>
              <span>Digital Launch</span>
              <div className="archive-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/68393d27-4c21-415a-aafc-cf5a31b57682_320w.webp" alt="Noma" />
              </div>
            </div>
            <div className="archive-row" data-preview="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&amp;fit=crop&amp;w=900&amp;q=85">
              <span>2025</span>
              <span>Terrain</span>
              <span>Identity System</span>
              <div className="archive-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a41d3a65-8d6a-4d01-9658-ed45cbcdcce6_320w.webp" alt="Terrain" />
              </div>
            </div>
            <div className="archive-row" data-preview="https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&amp;fit=crop&amp;w=900&amp;q=85">
              <span>2025</span>
              <span>Mono</span>
              <span>Brand Film</span>
              <div className="archive-thumb">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/variants/0a4aa3d6-d721-49ae-8f1d-fae6a49994ee/320w.png" alt="Mono" />
              </div>
            </div>
            <div className="archive-row" data-preview="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&amp;fit=crop&amp;w=900&amp;q=85">
              <span>2024</span>
              <span>Circa</span>
              <span>Editorial Platform</span>
              <div className="archive-thumb">
                <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&amp;fit=crop&amp;w=400&amp;q=75" alt="Circa" />
              </div>
            </div>
            <div className="archive-row" data-preview="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&amp;fit=crop&amp;w=900&amp;q=85">
              <span>2024</span>
              <span>Vestra</span>
              <span>Art Direction</span>
              <div className="archive-thumb">
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&amp;fit=crop&amp;w=400&amp;q=75" alt="Vestra" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cinematic section">
        <div className="cinematic-bg">
          <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/variants/df48517c-b34b-4aa2-b653-96984538305d/3840w.jpg" alt="Architecture" />
        </div>
        <div className="cinematic-inner">
          <h2 className="display">We shape what comes next.</h2>
          <div className="cinematic-card">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/d1d195f0-17d7-4654-a1fc-c9e3192705c4_800w.webp" alt="Editorial portrait" />
          </div>
          <a href="#contact" className="cinematic-cta">Start a project ↗</a>
        </div>
      </section>

      <section className="big-stats paper diagonal-top">
        <div className="container stats-grid">
          <div className="stat">
            <strong data-count="2.4" data-suffix="M">0</strong>
            <p>Total audience reach across campaigns and digital launches</p>
          </div>
          <div className="stat">
            <strong data-count="118" data-suffix="K">0</strong>
            <p>Creative assets delivered across identity, motion and web</p>
          </div>
          <div className="stat">
            <strong data-count="93" data-suffix="+">0</strong>
            <p>Brand launches shaped from strategy to final experience</p>
          </div>
          <div className="stat">
            <strong data-count="21">0</strong>
            <p>Countries reached through international collaborations</p>
          </div>
        </div>
      </section>

      <section className="journal paper">
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 60 }}>04 / Journal</div>
          <div className="journal-grid">
            <article className="journal-item">
              <div className="journal-img">
                <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&amp;fit=crop&amp;w=1000&amp;q=85" alt="Journal portrait" />
              </div>
              <div className="journal-meta">
                <span>01 / Casting Notes</span>
                <span>2026</span>
              </div>
            </article>
            <article className="journal-item">
              <div className="journal-img">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/611c8074-3c56-4810-a604-812a2791a1f9_800w.webp" alt="Journal fashion" />
              </div>
              <div className="journal-meta">
                <span>02 / Material Study</span>
                <span>2026</span>
              </div>
            </article>
            <article className="journal-item">
              <div className="journal-img">
                <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/cd2c33e1-4bcd-452f-ad23-223a9029f74b_800w.webp" alt="Journal studio" />
              </div>
              <div className="journal-meta">
                <span>03 / Process</span>
                <span>2025</span>
              </div>
            </article>
            <article className="journal-item">
              <div className="journal-img">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&amp;fit=crop&amp;w=1000&amp;q=85" alt="Journal campaign" />
              </div>
              <div className="journal-meta">
                <span>04 / Campaign Still</span>
                <span>2025</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="faq paper diagonal-top">
        <div className="container">
          <h2 className="display">Common Questions</h2>
          <div className="faq-item">
            <button className="faq-q">
              <span>What types of projects do you take on?</span>
              <span className="faq-plus cross"></span>
            </button>
            <div className="faq-a">
              <p>
                We focus on identity systems, campaign direction, motion design
                and expressive digital experiences. Most engagements combine at
                least two of these disciplines.
              </p>
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-q">
              <span>Do you work with international clients?</span>
              <span className="faq-plus cross"></span>
            </button>
            <div className="faq-a">
              <p>
                Yes. Our process is built for remote collaboration, with clear
                milestones, live reviews and a structured communication rhythm.
              </p>
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-q">
              <span>Can you handle both identity and web design?</span>
              <span className="faq-plus cross"></span>
            </button>
            <div className="faq-a">
              <p>
                Yes. Many of our strongest projects begin with identity and
                extend into a complete digital system, motion language and
                launch campaign.
              </p>
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-q">
              <span>What is the typical project timeline?</span>
              <span className="faq-plus cross"></span>
            </button>
            <div className="faq-a">
              <p>
                Focused direction sprints usually take two to three weeks. Full
                identity and digital projects generally run from eight to
                sixteen weeks.
              </p>
            </div>
          </div>
          <div className="faq-item">
            <button className="faq-q">
              <span>How does the process begin?</span>
              <span className="faq-plus cross"></span>
            </button>
            <div className="faq-a">
              <p>
                Every project begins with a short conversation about your goals,
                audience, timing and ambition. From there, we shape the right
                scope and working model.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer dark" id="contact">
        <div className="container footer-main">
          <div>
            <div className="eyebrow">05 / Contact</div>
            <h2 className="display">Have a project in mind?</h2>
            <a className="footer-email" href="mailto:studio@northform.design">
              studio@northform.design
            </a>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="form-row">
              <div className="field">
                <label>Name</label>
                <input required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" required />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Company</label>
                <input />
              </div>
              <div className="field">
                <label>Project type</label>
                <select>
                  <option>Identity</option>
                  <option>Campaign</option>
                  <option>Digital</option>
                  <option>Full experience</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Message</label>
              <textarea required></textarea>
            </div>
            <button className="form-submit" type="submit">
              {formSubmitted ? "Message received ✓" : "Send inquiry ↗"}
            </button>
          </form>
        </div>
        <div className="container footer-meta">
          <div className="socials">
            <a href="#">Instagram</a>
            <a href="#">Behance</a>
            <a href="#">LinkedIn</a>
            <a href="#">Are.na</a>
          </div>
          <div>
            Montréal /
            <span id="clock">18:42 EST</span>
          </div>
        </div>
        <div className="footer-word display">
          NORTH
          <span className="slash">/</span>
          FORM
        </div>
      </footer>
    </main>

    <div className="cursor-label">
      View
      <br />
      Case ↗
    </div>
    <div className="archive-preview"><img src="" alt="Archive preview" /></div>

    
    
    
 

    
    
  




    </>
  );
}
