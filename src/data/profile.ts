// Homepage profile content. Every figure here must trace to the résumé
// (~/GitHub/resume/template-general/BoGao_Resume.tex) or a public artifact.

export const PROFILE = {
  name: "Bo Gao",
  role: "AI / ML Engineer",
  // Meta description for search results and link previews; not shown on the page.
  summary:
    "4+ years building production retrieval and recommendation systems at 100M+ DAU scale. Now building agentic retrieval and LLM post-training systems.",
  intro: [
    "I'm currently an MSCS student at USC. I'm interested in agentic AI, RAG, and LLMs.",
    "Previously I worked as a Machine Learning Engineer building large-scale recommender systems at Xiaohongshu (rednote) and JOYY, focused on retrieval models and strategies.",
  ],
  availability:
    "MS Computer Science at USC, May 2027. Open to full-time AI / ML engineering roles in the U.S.",
} as const;

// Projects shown on the homepage, by file name. Card label and tags come from
// each project's frontmatter.
export const HOMEPAGE_PROJECTS = ["arkb", "bogaodev"] as const;

const mergedPrs = (repo: string) =>
  `https://github.com/${repo}/pulls?q=is%3Apr+is%3Amerged+author%3Adaniellaah`;

// Cards describe the project, not individual PRs; the link lists every merged PR.
export const OPEN_SOURCE = [
  {
    name: "inspect_ai",
    owner: "UK AI Security Institute",
    description:
      "A framework for large language model evaluations, created by the UK AI Security Institute.",
    tags: ["LLM evaluation", "Computer use", "Python"],
    href: mergedPrs("UKGovernmentBEIS/inspect_ai"),
  },
  {
    name: "mlx-lm",
    owner: "Apple · ml-explore",
    description:
      "A Python package for generating text and fine-tuning large language models on Apple silicon with MLX.",
    tags: ["LLM inference", "Fine-tuning", "MLX"],
    href: mergedPrs("ml-explore/mlx-lm"),
  },
] as const;
