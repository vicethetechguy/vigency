"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Code2,
  Megaphone,
  Menu,
  Minus,
  PenTool,
  Plus,
  X,
} from "lucide-react";
import { Logo } from "./ui";
import { ZeroClubSection } from "./ZeroClubSection";

const community = "https://chat.whatsapp.com/FE1MVRwyBZf2zyQucuEkf1";
const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const navLinks = [
  ["Pathways", "pathways"],
  ["How it works", "how-it-works"],
  ["Who it's for", "who"],
  ["FAQs", "faq"],
] as const;

const pathways = [
  {
    title: "Design",
    icon: PenTool,
    description: "Design brand identities, posters and app screens that people enjoy using.",
    skills: "UI/UX design, graphic design, brand identity",
    project: "A brand identity for a small business on your campus",
  },
  {
    title: "Web development",
    icon: Code2,
    description: "Write your first lines of code and build responsive websites you can share with a link.",
    skills: "HTML and CSS, JavaScript, web applications",
    project: "Your own portfolio website",
  },
  {
    title: "Data and analytics",
    icon: BarChart3,
    description: "Clean up messy data, spot the patterns and present what they mean.",
    skills: "Spreadsheets, data visualisation, data analysis",
    project: "A dashboard built from a real public dataset",
  },
  {
    title: "Digital marketing and AI",
    icon: Megaphone,
    description: "Grow an audience, plan content and use AI tools to get more done.",
    skills: "Content creation, digital marketing, AI productivity",
    project: "A month of content for a brand you admire",
  },
];

const steps = [
  ["Learn the foundations", "Get comfortable with the tools and the core ideas. You can start from zero."],
  ["Practise on projects", "Work through exercises and small briefs that look like real work."],
  ["Build your portfolio", "Share what you make, get feedback and keep adding to it."],
];

const timetable = [
  { time: "08:00", what: "GST lecture" },
  { time: "12:00", what: "Lab practical" },
  { time: "16:00", what: "Group assignment" },
  { time: "19:30", what: "Vigency: finish your landing page design", mine: true },
];

const questions = [
  ["Do I need any experience to start?", "No. The pathways start from the basics and build your confidence with practical exercises before you move on to bigger projects."],
  ["Who is Vigency for?", "College, polytechnic and university students, graduates and postgraduates who want practical digital skills. You can join from any department."],
  ["How do I choose a pathway?", "Think about what you already enjoy. If you like visuals, try design. If you like solving problems, try web development or data. If you like talking to people, try digital marketing. You can also ask in the community."],
  ["Can I learn alongside my studies?", "Yes. Start with a routine you can keep during the semester and build from there. Ask in the community about schedules and the tools you'll need."],
  ["How do I join, and what does it cost?", "Join the Vigency community on WhatsApp and ask about current programmes, fees, schedules and entry requirements before you enrol. Programme details are shared there once they're confirmed."],
];

/** Gentle fade-in for blocks marked data-reveal. Skipped when reduced motion is on. */
function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -10% 0px" }
    );
    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add("reveal");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

export function LandingPage() {
  useScrollReveal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <main className="site" id="top">
      <header className={`site-header${menuOpen ? " is-open" : ""}`}>
        <div className="wrap header-bar">
          <a href="#top" className="header-logo" aria-label="Vigency home">
            <Logo />
          </a>
          <nav className="header-nav" aria-label="Main">
            {navLinks.map(([label, id]) => (
              <a key={id} href={`#${id}`}>{label}</a>
            ))}
          </nav>
          <a href={community} {...external} className="btn btn-outline btn-sm header-cta">
            Join on WhatsApp
          </a>
          <button
            type="button"
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div id="mobile-menu" className="mobile-menu" hidden={!menuOpen}>
          <nav className="wrap" aria-label="Mobile">
            {navLinks.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <a href={community} {...external} className="btn btn-primary btn-block" onClick={() => setMenuOpen(false)}>
              Join on WhatsApp <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </nav>
        </div>
      </header>

      <section className="wrap hero">
        <div className="hero-copy">
          <h1>Learn the digital skills your course doesn&rsquo;t cover.</h1>
          <p className="hero-lead">
            Vigency helps students and graduates learn design, web development, data and digital marketing
            by building real projects, alongside their studies.
          </p>
          <div className="hero-actions">
            <a href="#pathways" className="btn btn-primary">Explore the pathways</a>
            <a href={community} {...external} className="btn btn-outline">
              Join on WhatsApp <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <p className="hero-note">No experience needed. Open to every department.</p>
        </div>

        <div className="hero-visual">
          <div className="hero-photo">
            <Image
              src="/assets/students-campus.jpg"
              alt="Students working together on a laptop in a campus library"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
              className="cover"
            />
          </div>
          <figure className="timetable" aria-label="Example of a student's Wednesday with Vigency practice in the evening">
            <figcaption>Wednesday</figcaption>
            <ol>
              {timetable.map((row) => (
                <li key={row.time} className={row.mine ? "is-mine" : undefined}>
                  <time>{row.time}</time>
                  <span>{row.what}</span>
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </section>

      <section className="wrap statement" data-reveal>
        <h2>Most students graduate with a certificate. Fewer graduate with work to show.</h2>
        <div className="statement-body">
          <p>
            Employers and clients want to see what you can do. Vigency gives you a place to learn practical
            digital skills during school, and to leave with projects that prove it.
          </p>
          <p>Your course of study doesn&rsquo;t limit you. Whether you&rsquo;re in medicine, law, engineering or accounting, a digital skill will make you better at it.</p>
        </div>
      </section>

      <section className="section pathways" id="pathways">
        <div className="wrap">
          <div className="section-head">
            <h2>Choose a pathway</h2>
            <p>Four places to start. Pick the one closest to what you already enjoy. You can add another later.</p>
          </div>
          <ul className="pathway-list" data-reveal>
            {pathways.map((p) => (
              <li key={p.title} className="pathway">
                <span className="icon-tile" aria-hidden="true"><p.icon size={22} /></span>
                <div className="pathway-main">
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
                <dl className="pathway-meta">
                  <div>
                    <dt>You&rsquo;ll learn</dt>
                    <dd>{p.skills}</dd>
                  </div>
                  <div>
                    <dt>Example project</dt>
                    <dd>{p.project}</dd>
                  </div>
                </dl>
                <a href={community} {...external} className="pathway-link" aria-label={`Ask about ${p.title} on WhatsApp`}>
                  Ask about this pathway <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section wrap how" id="how-it-works">
        <div className="how-photo" data-reveal>
          <Image
            src="/assets/student-laptop.jpg"
            alt="A student taking notes beside a laptop"
            fill
            sizes="(max-width: 900px) 100vw, 44vw"
            className="cover"
          />
        </div>
        <div className="how-copy" data-reveal>
          <h2>How you&rsquo;ll learn</h2>
          <p className="section-lead">Less time on theory alone, more time making things. Each step builds on the last.</p>
          <ol className="steps">
            {steps.map(([title, text], i) => (
              <li key={title}>
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ZeroClubSection />

      <section className="section wrap who" id="who">
        <div className="section-head">
          <h2>Wherever you are in school</h2>
          <p>You don&rsquo;t need it all figured out. You just need somewhere to begin.</p>
        </div>
        <div className="who-grid" data-reveal>
          <article className="who-card">
            <div className="who-photo">
              <Image src="/assets/student-community.jpg" alt="Students together in a university classroom" fill sizes="(max-width: 760px) 100vw, 50vw" className="cover" />
            </div>
            <div className="who-body">
              <p className="who-for">College, polytechnic and university students</p>
              <h3>Start before you graduate</h3>
              <p>Use your years on campus to learn a skill properly, and finish your programme with projects you can show.</p>
              <a href="#pathways" className="text-link">See the pathways</a>
            </div>
          </article>
          <article className="who-card">
            <div className="who-photo">
              <Image src="/assets/graduates.jpg" alt="Graduates celebrating together" fill sizes="(max-width: 760px) 100vw, 50vw" className="cover" />
            </div>
            <div className="who-body">
              <p className="who-for">Graduates and postgraduates</p>
              <h3>Add skills to your degree</h3>
              <p>Change direction, strengthen your research or get ready for your next job with practical digital skills.</p>
              <a href="#pathways" className="text-link">See the pathways</a>
            </div>
          </article>
        </div>
      </section>

      <section className="section community">
        <div className="wrap community-inner" data-reveal>
          <div>
            <h2>You won&rsquo;t be learning alone</h2>
            <p className="section-lead">
              The Vigency community lives on WhatsApp, where you probably already are. Meet students from other
              campuses and departments, share what you&rsquo;re working on, and ask when you&rsquo;re stuck.
            </p>
            <a href={community} {...external} className="btn btn-primary">
              Join on WhatsApp <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <ul className="community-points">
            <li><strong>Students like you</strong><span>From different campuses, departments and levels.</span></li>
            <li><strong>Feedback on your work</strong><span>Post a project and hear what others think.</span></li>
            <li><strong>Answers when you&rsquo;re stuck</strong><span>Someone has usually hit the same problem before.</span></li>
          </ul>
        </div>
      </section>

      <section className="section wrap faq" id="faq">
        <div className="faq-intro">
          <h2>Questions students ask</h2>
          <p className="section-lead">
            Can&rsquo;t find yours? <a href={community} {...external} className="inline-link">Ask us on WhatsApp</a>.
          </p>
        </div>
        <div className="faq-list" data-reveal>
          {questions.map(([q, a], i) => (
            <div className="faq-item" key={q}>
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                  aria-controls={`answer-${i}`}
                >
                  <span>{q}</span>
                  {openFaq === i ? <Minus size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}
                </button>
              </h3>
              <div id={`answer-${i}`} hidden={openFaq !== i}>
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap closing" data-reveal>
        <div className="closing-card">
          <h2>Start with one skill</h2>
          <p>Join the community, tell us what interests you, and we&rsquo;ll help you choose where to begin.</p>
          <div className="closing-actions">
            <a href={community} {...external} className="btn btn-primary">
              Join on WhatsApp <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href="#pathways" className="btn btn-outline">Explore the pathways</a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <Logo />
            <p>Practical digital skills for students and graduates.</p>
          </div>
          <nav className="footer-links" aria-label="Footer">
            {navLinks.map(([label, id]) => (
              <a key={id} href={`#${id}`}>{label}</a>
            ))}
            <a href={community} {...external}>WhatsApp community</a>
          </nav>
        </div>
        <div className="wrap footer-base">
          <span>&copy; {new Date().getFullYear()} Vigency</span>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </main>
  );
}
