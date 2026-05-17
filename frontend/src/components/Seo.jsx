import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://cme-nexus.vercel.app";

const ROUTE_META = {
  "/": {
    title: "CME Nexus | Medical Laboratory CME Platform",
    description:
      "CME Nexus helps medical laboratory professionals access CME modules, track learning progress, and verify certificates."
  },
  "/about": {
    title: "About CME Nexus | Medical Laboratory Learning",
    description:
      "Learn about CME Nexus, a continuing education platform for medical laboratory professionals and healthcare learning teams."
  },
  "/contact": {
    title: "Contact CME Nexus",
    description:
      "Contact CME Nexus for support with accounts, CME content access, certificates, and admin uploads."
  },
  "/login": {
    title: "Login | CME Nexus",
    description: "Login to CME Nexus to continue your medical laboratory CME learning."
  },
  "/register": {
    title: "Create Account | CME Nexus",
    description:
      "Create a CME Nexus account to access continuing education modules, track progress, and earn certificates."
  },
  "/library": {
    title: "CME Library | CME Nexus",
    description:
      "Search CME learning content by discipline, topic, speaker, format, and date on CME Nexus."
  },
  "/dashboard": {
    title: "Dashboard | CME Nexus",
    description: "Track CME credits, certificates, and learning progress in your CME Nexus dashboard.",
    noIndex: true
  },
  "/admin": {
    title: "Admin Upload Workspace | CME Nexus",
    description: "Manage CME Nexus content uploads, structured courses, and learning modules.",
    noIndex: true
  }
};

const getMetaForPath = (pathname) => {
  if (pathname.startsWith("/verify/")) {
    return {
      title: "Verify Certificate | CME Nexus",
      description: "Verify a CME Nexus certificate by certificate ID."
    };
  }

  if (pathname.startsWith("/content/")) {
    return {
      title: "CME Content | CME Nexus",
      description: "View protected CME Nexus learning content.",
      noIndex: true
    };
  }

  return ROUTE_META[pathname] || {
    title: "CME Nexus | Medical Laboratory CME Platform",
    description:
      "Access CME learning modules, track progress, and verify certificates for medical laboratory continuing education."
  };
};

const upsertMeta = (selector, createTag, updates) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = createTag();
    document.head.appendChild(element);
  }

  Object.entries(updates).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getMetaForPath(pathname);
    const canonicalUrl = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

    document.title = meta.title;

    upsertMeta("meta[name='description']", () => document.createElement("meta"), {
      name: "description",
      content: meta.description
    });
    upsertMeta("meta[name='robots']", () => document.createElement("meta"), {
      name: "robots",
      content: meta.noIndex ? "noindex, nofollow" : "index, follow"
    });
    upsertMeta("link[rel='canonical']", () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      return link;
    }, {
      href: canonicalUrl
    });
    upsertMeta("meta[property='og:title']", () => document.createElement("meta"), {
      property: "og:title",
      content: meta.title
    });
    upsertMeta("meta[property='og:description']", () => document.createElement("meta"), {
      property: "og:description",
      content: meta.description
    });
    upsertMeta("meta[property='og:url']", () => document.createElement("meta"), {
      property: "og:url",
      content: canonicalUrl
    });
    upsertMeta("meta[name='twitter:title']", () => document.createElement("meta"), {
      name: "twitter:title",
      content: meta.title
    });
    upsertMeta("meta[name='twitter:description']", () => document.createElement("meta"), {
      name: "twitter:description",
      content: meta.description
    });
  }, [pathname]);

  return null;
}
