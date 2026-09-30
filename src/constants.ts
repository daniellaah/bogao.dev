import IconMail from "@/assets/icons/IconMail.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedIn from "@/assets/icons/IconLinkedIn.svg";

interface Social {
  label: string;
  linkTitle: string;
  icon: typeof IconMail;
  href: (url: string, title: string) => string;
}

// Where readers of an engineering post actually share it. "Copy link" is
// rendered separately because it needs a script, not a URL.
export const SHARE_LINKS: Social[] = [
  {
    label: "LinkedIn",
    linkTitle: "Share this post on LinkedIn",
    icon: IconLinkedIn,
    href: url =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    label: "X",
    linkTitle: "Share this post on X",
    icon: IconBrandX,
    href: (url, title) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    label: "Email",
    linkTitle: "Share this post via email",
    icon: IconMail,
    href: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
] as const;
