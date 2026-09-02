/**
 * Single source of truth for portfolio content.
 * Everything here is a placeholder — replace the values, not the shape,
 * and the landing page updates itself.
 */

export const profile = {
  name: "Rosendo Coquilla Jr",
  role: "Full-stack Software Engineer",
  available: false,
  summary:
    "I’m Sen, a Full-Stack Software Engineer and an architecture enthusiast with a strong passion for designing secure, robust, and reliable system architectures and platforms.",
  email: "rosendocoquilla@gmail.com",
  socials: {
    // Replace with your real profile URL.
    linkedin: "https://www.linkedin.com/in/rosendo-jr-coquilla/",
  },
} as const;

/** Stored as the display string — there is no mapping table to keep in step. */
export type EmploymentType = "Full-time" | "Part-time" | "Project-based";

/** One position. A promotion within the same company is a second `Role`. */
export type Role = {
  title: string;
  /**
   * Employment basis. On the role rather than the company, because it can
   * change without the employer changing — part-time to full-time is one
   * company and two roles.
   */
  type: EmploymentType;
  /** ISO `YYYY-MM`. Month precision is required — durations are derived. */
  start: string;
  /** ISO `YYYY-MM`, or `null` while this is the current role. */
  end: string | null;
  /** What you actually did — one entry per outcome. `/experience` only. */
  highlights: readonly string[];
  stack: readonly string[];
};

export type Experience = {
  /**
   * Anchor id on `/experience`, and the key the landing page links to.
   * Must be unique and URL-safe; changing one breaks any shared link.
   */
  slug: string;
  company: string;
  /** Newest first. One role is the common case; a promotion adds a second. */
  roles: readonly [Role, ...Role[]];
};

/**
 * The employment bases held at a company, newest first, without repeats.
 * One entry is the common case; two means the basis changed mid-tenure.
 */
export function companyTypes(entry: Experience) {
  return [...new Set(entry.roles.map((role) => role.type))];
}

/**
 * The whole span at a company, across every role held there.
 * Roles are newest first, so the span opens with the *last* one's start.
 */
export function companySpan(entry: Experience) {
  return {
    start: entry.roles[entry.roles.length - 1].start,
    end: entry.roles[0].end,
  };
}

export const experience: readonly Experience[] = [
  {
    slug: "aclogistics",
    company: "AC Logistics",
    roles: [
      {
        title: "Software Development Assistant Manager",
        type: "Full-time",
        start: "2026-04",
        end: null,
        highlights: [
          "Led and mentor a team of software engineers, promoting technical excellence and best practices.",
          "Designed and implemented scalable software architectures and enterprise solutions.",
          "Architected and developed internal systems from concept through deployment.",
          "Translated business requirements into technical solutions in collaboration with stakeholders and product managers.",
          "Partnered with executive management to align technology initiatives with business objectives.",
          "Drove architectural decisions, technology adoption, and long-term system strategy.",
          "Ensured software quality through technical leadership, code reviews, and system optimization.",
          "Provided production support and lead root cause analysis for critical system issues."
        ],
        stack: ["Amazon Web Services", "Spring Boot", "Java 21", "PostgreSQL", "Microsoft Power Platform"],
      },
      {
        title: "Software Development Lead",
        type: "Full-time",
        start: "2025-03",
        end: "2026-04",
        highlights: [
          "Led the technical implementation of enterprise solutions by defining system designs, development standards, and engineering best practices.",
          "Drove technical discussions and collaborated with cross-functional stakeholders to ensure software solutions aligned with business objectives.",
          "Mentored developers through code reviews, pair programming, and technical coaching, fostering a culture of continuous improvement.",
          "Contributed to technology evaluation and architectural decision-making to support long-term platform evolution.",
          "Collaborated with QA, DevOps, and product teams to deliver high-quality releases using Agile methodologies and CI/CD practices.",
        ],
        stack: ["Amazon Web Services", "Spring Boot", "Java 17", "PostgreSQL", "Microsoft Power Platform"],
      },
    ],
  },
  {
    slug: "a-movement",
    company: "A-Movement Corporation",
    roles: [
      {
        title: "Junior Software Architect",
        type: "Full-time",
        start: "2023-12",
        end: "2025-03",
        highlights: [
          "Enhanced the performance of a previously underperforming system, resulting in improved efficiency and stability.",
          "Designed technical solutions to meet evolving business requirements, ensuring scalability and reliability.",
          "Assisted in evaluating and selecting appropriate technologies for system architecture to ensure long-term viability.",
          "Documented system architecture and design decisions to support ongoing development and maintenance.",
          "Developed proof-of-concept solutions to validate architectural ideas before full-scale implementation.",
          "Utilized architectural design patterns to address recurring problems, enhancing the flexibility and resilience of the software.",
          "Worked closely with DevOps teams to ensure seamless deployment and scalability of applications.",
          "Assisted in establishing architectural standards and guidelines for development teams to ensure consistency across projects.",
          "Collaborated with product owners to translate business requirements into technical specifications.",
        ],
        stack: ["Amazon Web Services", "Spring Boot", "Java 8", "Java 17", "PostgreSQL", "Microsoft Power Platform"],
      },
    ],
  },
  {
    slug: "entrego",
    company: "Entrego Fulfillment Solutions Inc.",
    roles: [
      {
        title: "Senior Software Engineer",
        type: "Full-time",
        start: "2022-05",
        end: "2023-11",
        highlights: [
          "Developed and maintained high-quality software applications, adhering to best practices and coding standards.",
          "Participated in the full software development lifecycle, from requirements gathering to deployment and postproduction support.",
          "Participated in architectural review sessions, providing feedback to align projects with best practices and industry standards.",
          "Collaborated with cross-functional teams to align software architecture with business objectives.",
          "Identified bottlenecks in system performance and implemented architectural improvements to address them.",
          "Led initiatives to refactor legacy code, improving maintainability and reducing technical debt.",
          "Mentored and coached software engineers, fostering skill development and promoting best practices in software architecture.",
        ],
        stack: ["Amazon Web Services", "Spring Boot", "Java 8", "PostgreSQL", "Microsoft Power Platform"],
      },
      {
        title: "Software Engineer",
        type: "Full-time",
        start: "2021-05",
        end: "2022-05",
        highlights: [
          "Implemented RESTful APIs and integrated them with front-end systems to support seamless user experiences.",
          "Optimized application performance by identifying and resolving bottlenecks in code and queries.",
          "Wrote unit, integration, and end-to-end tests to ensure code quality and maintainability.",
          "Debugged and resolved critical software defects, enhancing system reliability and reducing downtime.",
          "Refactored legacy code to improve readability, maintainability, and reduce technical debt.",
          "Mentored junior developers, conducting code reviews, and providing guidance to improve coding skills.",
          "Wrote comprehensive technical documentation, including code comments and user guides for future maintenance.",
          "Developed and maintained microservices to ensure system modularity and scalability.",
        ],
        stack: ["Amazon Web Services", "Spring Boot", "Java 8", "PostgreSQL", "Microsoft Power Platform"],
      },
    ],
  },
] as const;

/** The groupings on `/tech-stack`, in the order they are rendered. */
export type TechCategory =
  | "Frontend"
  | "Backend"
  | "Cloud"
  | "AI"
  | "Security and IAM"
  | "Tools";

export type Tech = {
  /**
   * Must match a key in `TECH_ICONS` (`@/components/tech-badge`) to get a logo.
   * An unmatched name renders text-only, which is a supported outcome — Simple
   * Icons has no Amazon or Microsoft marks and is not going to get them.
   */
  name: string;
  /**
   * Shown in the landing page's short list. Keep this to the handful you would
   * actually lead with — the whole point of that list is that it is not this
   * one.
   */
  featured?: boolean;
};

export type TechGroup = {
  category: TechCategory;
  items: readonly Tech[];
};

/**
 * Everything worth listing, grouped. Drives `/tech-stack`.
 *
 * Seeded from what `experience` and `projects` actually name. **The AI and
 * "Security and IAM" groups have nothing behind them in that data** — they are
 * placeholders so the page renders, and are yours to replace or delete.
 * Kubernetes is in the same position. A group with no items is skipped rather
 * than rendered empty, so deleting is safe.
 */
export const techStacks: readonly TechGroup[] = [
  {
    category: "Frontend",
    items: [
      { name: "React", featured: true },
      { name: "Next.js", featured: true },
      { name: "TypeScript", featured: true },
      { name: "JavaScript" },
      { name: "Tailwind CSS" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "Java", featured: true },
      { name: "Spring Boot", featured: true },
      { name: "PostgreSQL", featured: true },
      { name: "MariaDB" },
      { name: "PHP" },
      { name: "Laravel" },
      { name: "Node.js" },
      { name: "Python" },
    ],
  },
  {
    category: "Cloud",
    items: [
      { name: "Amazon Web Services", featured: true },
      { name: "Docker", featured: true },
    ],
  },
  {
    category: "AI",
    items: [
      { name: "Anthropic" }, 
      { name: "OpenAI" }
    ],
  },
  {
    category: "Security and IAM",
    items: [
      { name: "Spring Security" },
      { name: "Keycloak" },
      { name: "JSON Web Tokens" },
    ],
  },
  {
    category: "Tools",
    items: [
      { name: "Microsoft Power Platform" },
      { name: "Git", featured: true },
      { name: "GitHub" },
      { name: "GitHub Actions" },
      { name: "GitLab", featured: true },
      { name: "IntelliJ IDEA" },
      { name: "PyCharm" },
      { name: "Postman", featured: true },
      { name: "Jira", featured: true },
      { name: "Apidog" },
    ],
  },
] as const;

/**
 * The landing page's short list.
 *
 * Derived from `techStacks` rather than written out separately, so it cannot
 * drift: a name here that does not exist there is not expressible. Mark an item
 * `featured: true` to add it; order follows the group order above.
 */
export const featuredTech: readonly string[] = techStacks
  .flatMap((group) => group.items)
  .filter((tech) => tech.featured)
  .map((tech) => tech.name);

export type Project = {
  name: string;
  description: string;
  year: string;
  tags: readonly string[];
  href: string;
};

export const projects: readonly Project[] = [
  {
    name: "Placeholder Project",
    description:
      "One sentence on the problem it solves. Save the architecture story for the case study.",
    year: "2025",
    tags: ["Next.js", "TypeScript", "Tailwind"],
    href: "#",
  },
  {
    name: "Second Project",
    description:
      "Something you shipped that you can speak to in depth for twenty minutes.",
    year: "2024",
    tags: ["React", "Node.js"],
    href: "#",
  },
  {
    name: "Third Project",
    description:
      "Side projects count — they show what you build when nobody assigns it.",
    year: "2024",
    tags: ["Python", "PostgreSQL"],
    href: "#",
  },
  {
    name: "Fourth Project",
    description:
      "Keep the grid to work you would actually want to be asked about.",
    year: "2023",
    tags: ["Go", "Docker"],
    href: "#",
  },
] as const;
