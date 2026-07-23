import { Link, useParams } from "react-router-dom";
import "../components/HallOfKnowledge/HallOfKnowledge.css";
import { getDistrict, getDistrictPath, getSkill } from "../lib/world.js";
import { getKnowledgeNote, getRelatedNotes, getKnowledgeNoteArtifactPath, categoryLabel } from "../lib/knowledge.js";
import { getRepositoryTree, getRepositoryArtifactPath } from "../lib/git-forest.js";
import { formatMonthYear } from "../lib/format-date.js";
import { MarkdownContent } from "../components/Markdown/MarkdownContent.js";
import { NotFound } from "./NotFound.js";

export function KnowledgeNoteArtifact() {
  const { noteSlug } = useParams<{ noteSlug: string }>();
  const note = noteSlug ? getKnowledgeNote(noteSlug) : undefined;

  if (!note) {
    return <NotFound message={`No note named "${noteSlug}" was found in the Hall of Knowledge.`} />;
  }

  const district = note.districtId ? getDistrict(note.districtId) : undefined;
  const skills = (note.relatedSkillIds ?? [])
    .map((skillId) => getSkill(skillId))
    .filter((skill): skill is NonNullable<typeof skill> => skill !== undefined);
  const repositories = (note.relatedRepositoryIds ?? [])
    .map((repositoryId) => getRepositoryTree(repositoryId))
    .filter((tree): tree is NonNullable<typeof tree> => tree !== undefined);
  const relatedNotes = getRelatedNotes(note.id);
  const hasRelated = skills.length > 0 || repositories.length > 0;

  return (
    <main className="knowledge-note">
      {district && (
        <Link to={getDistrictPath(district)} className="knowledge-note__back-link">
          <span aria-hidden="true">←</span> Back to {district.name}
        </Link>
      )}

      <header className="knowledge-note__identity">
        <p className="knowledge-note__eyebrow">Knowledge Note</p>
        <h1 className="knowledge-note__title">{note.title}</h1>
        <p className="knowledge-note__summary">{note.summary}</p>

        <dl className="knowledge-note__meta">
          <div className="knowledge-note__meta-item">
            <dt>Category</dt>
            <dd>{categoryLabel(note.category)}</dd>
          </div>
          <div className="knowledge-note__meta-item">
            <dt>Updated</dt>
            <dd>{formatMonthYear(note.updatedAt)}</dd>
          </div>
        </dl>

        {note.tags && note.tags.length > 0 && (
          <ul className="knowledge-note__tags">
            {note.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </header>

      <section className="knowledge-note__body">
        <MarkdownContent body={note.body} />
      </section>

      {hasRelated && (
        <section className="knowledge-note__section" aria-labelledby="knowledge-note-related-heading">
          <h2 id="knowledge-note-related-heading" className="knowledge-note__section-heading">
            Related
          </h2>

          {skills.length > 0 && (
            <ul className="certification-card__skills">
              {skills.map((skill) => (
                <li key={skill.id}>{skill.name}</li>
              ))}
            </ul>
          )}

          {repositories.length > 0 && (
            <ul className="knowledge-note__repos">
              {repositories.map((tree) => (
                <li key={tree.id}>
                  <Link to={getRepositoryArtifactPath(tree)}>{tree.treeName}</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {relatedNotes.length > 0 && (
        <nav className="knowledge-note__related-notes" aria-label="Related notes">
          {relatedNotes.map((related) => {
            const path = getKnowledgeNoteArtifactPath(related);
            return (
              path && (
                <Link key={related.id} to={path} className="knowledge-note__related-link">
                  {related.title}
                </Link>
              )
            );
          })}
        </nav>
      )}
    </main>
  );
}
