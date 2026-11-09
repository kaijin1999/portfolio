import { Fragment, useEffect, useRef, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  motion, useMotionValue, useReducedMotion, useScroll, useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { about, artstation, email, projects, reels, services, type Project } from "./content";
import "./style.css";

const asset = (path: string) => `./assets/${path}`;
const number = (index: number) => String(index + 1).padStart(2, "0");
const ease = [0.25, 0.1, 0.25, 1] as const;
const contact = `mailto:${email}`;

function FadeIn({
  children, className, delay = 0, duration = 0.7, x = 0, y = 30,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ delay: reduce ? 0 : delay, duration: reduce ? 0 : duration, ease }}
    >
      {children}
    </motion.div>
  );
}

function ContactButton({ href = "#contact", children = "Contact Me" }: {
  href?: string;
  children?: ReactNode;
}) {
  return (
    <a className="contact-button" href={href}>
      {children} <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}

function Magnet() {
  const frame = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = frame.current;
    const bounds = element?.parentElement;
    if (!element || !bounds || reduce || !matchMedia("(pointer: fine)").matches) return;

    const reset = () => {
      element.style.transitionDuration = "0.6s";
      element.style.transitionTimingFunction = "ease-in-out";
      element.style.transform = "";
    };

    const move = (event: PointerEvent) => {
      const box = bounds.getBoundingClientRect();
      if (box.bottom < 0 || box.top > innerHeight) return;
      const x = event.clientX - (box.left + box.width / 2);
      const y = event.clientY - (box.top + box.height / 2);
      if (Math.abs(x) > box.width / 2 + 150 || Math.abs(y) > box.height / 2 + 150) {
        reset();
        return;
      }
      element.style.transitionDuration = "0.3s";
      element.style.transitionTimingFunction = "ease-out";
      element.style.transform = `translate3d(${x / 3}px, ${y / 3}px, 0)`;
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      reset();
    };
  }, [reduce]);

  return (
    <div className="magnet" ref={frame}>
      <img src={asset("landing/kaijin.webp")} alt="Kaijin, a stylized 3D character by Jack"
        width={940} height={840} fetchPriority="high" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero relative isolate flex flex-col justify-between" id="top" aria-labelledby="hero-title">
      <div className="relative">
        <FadeIn y={-20} className="relative z-20">
          <nav className="hero-nav page-gutter flex items-center justify-between" aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#price">Price</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
          </nav>
        </FadeIn>
        <FadeIn delay={0.15} y={40} className="hero-title-wrap overflow-hidden">
          <h1 id="hero-title" className="hero-heading whitespace-nowrap text-center font-black uppercase">Hi, i’m Jack</h1>
        </FadeIn>
      </div>
      <div className="hero-halo" aria-hidden="true" />
      <div className="hero-portrait">
        <FadeIn delay={0.6} y={30}><Magnet /></FadeIn>
      </div>
      <div className="hero-bottom page-gutter relative z-10 flex items-end justify-between gap-3 pb-7 sm:pb-8 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <p className="hero-description max-w-[150px] font-light uppercase sm:max-w-[220px] md:max-w-[260px]">
            A 3D creator driven by crafting striking and unforgettable projects
          </p>
        </FadeIn>
        <a href="#reel" className="hero-scroll" aria-label="Scroll to selected works"><ArrowDown size={17} /></a>
        <FadeIn delay={0.5} y={20}><ContactButton /></FadeIn>
      </div>
    </section>
  );
}

function MarqueeSection() {
  const section = useRef<HTMLElement>(null);
  const offset = useMotionValue(0);
  const reverse = useTransform(offset, (x) => -x);
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = section.current;
    if (!element || reduce) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      offset.set((innerHeight - element.getBoundingClientRect().top) * 0.3 - 200);
    };
    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      cancelAnimationFrame(frame);
    };
  }, [offset, reduce]);

  return (
    <section ref={section} id="reel" className="reel pt-24 pb-10 sm:pt-32 md:pt-40" aria-labelledby="reel-title">
      <div className="reel-label page-gutter">
        <h2 id="reel-title" className="micro">Selected work</h2>
        <span className="micro">01–21 / 3D archive</span>
      </div>
      {reels.map((row, index) => (
        <div className="reel-window" key={index}>
          <motion.div className="reel-track" style={{ x: reduce ? 0 : index === 0 ? offset : reverse }}>
            {(reduce ? [0] : [0, 1, 2]).map((copy) => (
              <div className="reel-set" key={copy} aria-hidden={copy === 0 ? undefined : true}>
                {row.map(([file, description]) => (
                  <img key={file} src={asset(`thumbs/${file}.jpg`)} alt={copy === 0 ? description : ""}
                    loading="lazy" decoding="async" width={420} height={270} />
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      ))}
    </section>
  );
}

function AnimatedCharacter({ character, index, total, progress }: {
  character: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [index / total, (index + 1) / total], [0.2, 1]);
  return <motion.span style={{ opacity }}>{character}</motion.span>;
}

function AnimatedText({ text }: { text: string }) {
  const paragraph = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: paragraph, offset: ["start 0.8", "end 0.2"] });
  const total = Array.from(text.replaceAll(" ", "")).length;
  let index = 0;
  return (
    <p className="about-copy" ref={paragraph}>
      {reduce ? text : (
        <>
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">
            {text.split(" ").map((word, wordIndex) => (
              <Fragment key={wordIndex}>
                {wordIndex > 0 && " "}
                <span className="inline-block whitespace-nowrap">
                  {Array.from(word, (character, charIndex) => (
                    <AnimatedCharacter key={charIndex} character={character} index={index++}
                      total={total} progress={scrollYProgress} />
                  ))}
                </span>
              </Fragment>
            ))}
          </span>
        </>
      )}
    </p>
  );
}

const ornaments = [
  { file: "moon", position: "ornament-moon", x: -80, delay: 0.1 },
  { file: "object", position: "ornament-object", x: -80, delay: 0.25 },
  { file: "lego", position: "ornament-lego", x: 80, delay: 0.15 },
  { file: "group", position: "ornament-group", x: 80, delay: 0.3 },
];

function AboutSection() {
  return (
    <section id="about" className="about relative isolate grid min-h-screen place-items-center px-5 py-24"
      aria-labelledby="about-title">
      {ornaments.map(({ file, position, x, delay }) => (
        <div key={file} className={`ornament ${position}`} aria-hidden="true">
          <FadeIn x={x} y={0} delay={delay} duration={0.9}>
            <img src={asset(`landing/${file}.png`)} alt="" loading="lazy" decoding="async" />
          </FadeIn>
        </div>
      ))}
      <div className="about-inner relative z-10 flex flex-col items-center text-center">
        <FadeIn y={40}>
          <h2 id="about-title" className="hero-heading section-heading">About me</h2>
        </FadeIn>
        <AnimatedText text={about} />
        <ContactButton />
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="services rounded-section px-5 pt-20 pb-28 sm:px-8 sm:pt-24 sm:pb-36 md:px-10 md:pt-32 md:pb-44"
      aria-labelledby="services-title">
      <FadeIn y={40}>
        <h2 id="services-title" className="section-heading text-center">Services</h2>
      </FadeIn>
      <ol className="mx-auto mt-12 max-w-5xl sm:mt-16 md:mt-24">
        {services.map(([title, description], index) => (
          <li className="service-item" key={title}>
            <FadeIn className="service-grid" delay={index * 0.1} y={20}>
              <span className="service-number" aria-hidden="true">{number(index)}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </FadeIn>
          </li>
        ))}
      </ol>
      <div id="price" className="price mx-auto max-w-5xl">
        <div>
          <h3 className="micro">Pricing</h3>
          <p>Request a quote based on your project scope and deliverables.</p>
        </div>
        <a href={`${contact}?subject=3D%20project%20quote`} className="ghost-button">
          Get a quote <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function ProjectCard({ project, index, progress }: {
  project: Project;
  index: number;
  progress: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const targetScale = 1 - (projects.length - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / projects.length, 1], [1, targetScale]);
  const params = new URLSearchParams({ group: project.group });
  if (project.work !== undefined) params.set("work", String(project.work));
  return (
    <motion.article className="project-card" style={{
      scale: reduce ? 1 : scale, top: `calc(var(--stack-top) + ${index * 28}px)`,
    }}>
      <div className="project-meta">
        <span className="project-number" aria-hidden="true">{number(index)}</span>
        <div>
          <p className="micro">{project.category}</p>
          <h3>{project.title}</h3>
        </div>
        <a className="ghost-button" href={`./museum.html?${params}#collection`}
          aria-label={`Live project: ${project.title} in the gallery`}>
          Live Project <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="project-images">
        {project.images.map(([file, description]) => (
          <img key={file} src={asset(file)} alt={description} loading="lazy" decoding="async" />
        ))}
      </div>
    </motion.article>
  );
}

function ProjectsSection() {
  const stack = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stack, offset: ["start 0.2", "end 0.6"] });
  return (
    <section id="projects" className="projects rounded-section relative z-10 -mt-10 px-4 pt-20 pb-20 sm:-mt-12 sm:px-8 md:-mt-14 md:px-10 md:pt-28"
      aria-labelledby="projects-title">
      <FadeIn y={40}>
        <h2 id="projects-title" className="hero-heading section-heading text-center">Project</h2>
      </FadeIn>
      <div className="project-stack mx-auto mt-12 max-w-[1320px] sm:mt-16" ref={stack}>
        {projects.map((project, index) => (
          <ProjectCard key={project.title} project={project} index={index} progress={scrollYProgress} />
        ))}
      </div>
      <div id="collection" className="mt-12 flex justify-center">
        <a className="ghost-button" href="./museum.html">Explore the 3D gallery <ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <footer id="contact" className="footer page-gutter">
      <div className="footer-inner">
        <div>
          <p className="micro">Jakkarin Sonchai / Thailand</p>
          <h2 className="hero-heading">Let’s talk.</h2>
          <a className="footer-email" href={contact}>{email} <ArrowDownRight size={18} aria-hidden="true" /></a>
        </div>
        <ContactButton href={contact} />
      </div>
      <div className="footer-links">
        <a href={artstation}>ArtStation <ArrowUpRight size={14} aria-hidden="true" /></a>
        <a href={asset("CV.pdf")}>CV (PDF) <ArrowUpRight size={14} aria-hidden="true" /></a>
        <a href="#top" className="ml-auto">Back to top ↑</a>
      </div>
    </footer>
  );
}

function App() {
  useEffect(() => {
    const section = document.getElementById(window.location.hash.slice(1));
    section?.scrollIntoView({ behavior: "instant" });
  }, []);

  return (
    <>
      <a href="#projects" className="skip-link">Skip to projects</a>
      <main className="overflow-x-clip bg-ink text-mist">
        <HeroSection />
        <MarqueeSection />
        <AboutSection />
        <ServicesSection />
        <ProjectsSection />
      </main>
      <ContactSection />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
