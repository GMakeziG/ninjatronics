import { Link } from "react-router-dom";
import "./NotFound.css";

export interface NotFoundProps {
  /** Optional context-specific message, e.g. for a semantically-invalid
   * id under an otherwise-valid route (a bad repository slug) rather than
   * a fully unmatched path. Defaults to a generic message. */
  message?: string;
}

/**
 * Shared by the router's own catch-all (App.tsx) and any page that needs
 * to render the same "not found" treatment for a semantically-invalid id
 * within an otherwise-valid route (Routing Specification.md's distinction
 * between a router-level 404 and a page checking its own param against
 * real data) — e.g. RepositoryArtifact.tsx for an unknown repository slug.
 */
export function NotFound({ message = "Page not found." }: NotFoundProps) {
  return (
    <main className="not-found">
      <p className="not-found__message">{message}</p>
      <div className="not-found__links">
        <Link to="/">Return to the Gate</Link>
        <Link to="/brief">Mission Brief</Link>
      </div>
    </main>
  );
}
