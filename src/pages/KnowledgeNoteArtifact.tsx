import { Link, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import "../components/HallOfKnowledge/HallOfKnowledge.css";
import { getDistrict, getDistrictPath, getSkill } from "../lib/world.js";
import { getKnowledgeNote, getRelatedNotes, getKnowledgeNoteArtifactPath, categoryLabel } from "../lib/knowledge.js";
import { getRepositoryTree, getRepositoryArtifactPath } from "../lib/git-forest.js";
import { formatMonthYear } from "../lib/format-date.js";
import { NotFound } from "./NotFound.js";

/**
 * Deliberately minimal — recognizes only the two conventions every sample
 * note actually uses (a "## " line as a heading, a 4-space-indented line
 * as a one-line code sample), not general Markdown. This is not the
 * Markdown renderer decision for the project; per this milestone's scope,
 * no Markdown-parsing dependency was added, so inline emphasis
 * (`**bold**`, `` `code` ``) intentionally still renders as literal
 * characters — a disclosed limitation, not a silent gap.
 */
function renderNoteBody(body: string): ReactNode[] {
  return body.split(/\n\n+/).map((block, index) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h3 key={index} className="knowledge-note__body-heading">
          {trimmed.slice(3)}
        </h3>
      );
    }
    if (/^ {4}\S/.test(block)) {
      return (
        <pre key={index} className="knowledge-note__body-code">
          {trimmed}
        </pre>
      );
    }
    return (
      <p key={index} className="knowledge-note__body-paragraph">
        {trimmed}
      </p>
    );
  });
}

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

      <section className="knowledge-note__body">{renderNoteBody(note.body)}</section>

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
