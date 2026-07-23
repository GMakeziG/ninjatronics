import ReactMarkdown, { type Components } from "react-markdown";
import "./MarkdownContent.css";

export interface MarkdownContentProps {
  body: string;
}

const ALLOWED_URL_SCHEMES = new Set(["http:", "https:", "mailto:"]);

/**
 * Only http:, https:, mailto:, and scheme-less (relative/fragment) URLs
 * pass through — javascript:, data:, vbscript:, and anything else resolve
 * to an empty href. This mirrors react-markdown's own `defaultUrlTransform`
 * scheme-detection logic (treat "colon before any /, ?, or #" as a real
 * scheme, everything else as relative) but with a narrower allowlist —
 * the library's own default additionally allows `ircs?`/`xmpp`, which
 * isn't part of what this app needs to support.
 */
function safeUrlTransform(url: string): string {
  const colon = url.indexOf(":");
  const slash = url.indexOf("/");
  const question = url.indexOf("?");
  const hash = url.indexOf("#");

  const hasScheme =
    colon !== -1 &&
    (slash === -1 || colon < slash) &&
    (question === -1 || colon < question) &&
    (hash === -1 || colon < hash);

  if (!hasScheme) return url;

  const scheme = `${url.slice(0, colon).toLowerCase()}:`;
  return ALLOWED_URL_SCHEMES.has(scheme) ? url : "";
}

const components: Components = {
  a({ href, children, ...props }) {
    const isExternal = /^https?:/i.test(href ?? "");
    return (
      <a href={href} {...props} {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {children}
        {isExternal && (
          <>
            {" "}
            <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </>
        )}
      </a>
    );
  },
  // Image rendering is intentionally disabled until a real public-image
  // policy exists — no <img> element is ever created, so no request fires
  // and no image ever renders, regardless of what a note's body contains.
  img: () => null,
  // Keyboard-scrollable: a horizontally-overflowing code block otherwise
  // has no way to be scrolled without a mouse/touch pointer.
  pre({ children, ...props }) {
    return (
      <pre tabIndex={0} {...props}>
        {children}
      </pre>
    );
  },
};

/**
 * The one place a knowledge note's Markdown `body` string is turned into
 * React elements. Callers (KnowledgeNoteArtifact today; repository
 * documentation or other public notes later) pass a raw string in and know
 * nothing about how it's parsed or rendered.
 *
 * Deliberately restrained, per approved scope:
 * - no rehype-raw — raw HTML in source is never converted to real markup;
 *   `skipHtml` additionally hides it entirely rather than showing it as
 *   inert escaped text.
 * - no remark-gfm — standard CommonMark is sufficient for today's notes;
 *   add it only if a real note needs GFM-specific syntax (tables, task
 *   lists, strikethrough, autolinks).
 * - no syntax highlighting — code blocks are plain, readable, scrollable
 *   `<pre>` content.
 * - no image rendering.
 */
export function MarkdownContent({ body }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown skipHtml urlTransform={safeUrlTransform} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
