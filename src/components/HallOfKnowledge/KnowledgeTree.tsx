import { Link } from "react-router-dom";
import { getKnowledgeNoteArtifactPath, categoryLabel } from "../../lib/knowledge.js";
import type { Note } from "../../lib/world.js";

export interface KnowledgeCategoryGroup {
  category: Note["category"];
  count: number;
  notes: Note[];
}

export interface KnowledgeTreeProps {
  categories: KnowledgeCategoryGroup[];
}

/**
 * Categories are real groups derived from published notes only (see
 * getKnowledgeCategories in src/lib/knowledge.ts) — a category with zero
 * published notes never appears here, so there are no empty "fake folders"
 * on the page.
 */
export function KnowledgeTree({ categories }: KnowledgeTreeProps) {
  if (categories.length === 0) {
    return (
      <section className="knowledge-tree" aria-labelledby="knowledge-tree-heading">
        <h2 id="knowledge-tree-heading" className="knowledge-tree__heading">
          Knowledge Tree
        </h2>
        <p className="knowledge-tree__empty">No notes published yet.</p>
      </section>
    );
  }

  return (
    <section className="knowledge-tree" aria-labelledby="knowledge-tree-heading">
      <h2 id="knowledge-tree-heading" className="knowledge-tree__heading">
        Knowledge Tree
      </h2>

      <div className="knowledge-tree__categories">
        {categories.map((group) => (
          <div key={group.category} className="knowledge-tree__category">
            <p className="knowledge-tree__category-name">
              {categoryLabel(group.category)}{" "}
              <span className="knowledge-tree__category-count">{group.count}</span>
            </p>
            <ul className="knowledge-tree__notes">
              {group.notes.map((note) => {
                const path = getKnowledgeNoteArtifactPath(note);
                return (
                  <li key={note.id} className="knowledge-tree__note">
                    <h3 className="knowledge-tree__note-title">
                      {path ? <Link to={path}>{note.title}</Link> : note.title}
                    </h3>
                    <p className="knowledge-tree__note-summary">{note.summary}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
