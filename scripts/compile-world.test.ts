// Regression tests for the World Compiler's knowledge-note publishing
// boundary — fail-closed validation, publish-gating, slug/reference
// integrity, and the "no private path/content leak" guarantees documented
// in docs/design/Hall of Knowledge — Publishing Boundary & Privacy
// Checklist.md.
//
// Uses Node's built-in test runner (node:test) rather than adding a new
// test framework — this project has no existing test tooling, and Node 24
// (this repo's pinned version, see .nvmrc) plus the already-installed
// `tsx` dev dependency run these directly with zero new dependencies:
//
//   npx tsx --test scripts/compile-world.test.ts
//
// Each test builds its own tiny, self-contained fixture content directory
// (via mkdtempSync) rather than sharing a fixtures/ tree, so what's being
// tested is visible directly in the test, not split across files.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { compile, REPO_ROOT } from "./compile-world.js";

const SCHEMAS_DIR = join(REPO_ROOT, "schemas");

function writeFixture(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "ninjatronics-compiler-test-"));
  for (const [relPath, content] of Object.entries(files)) {
    const absPath = join(dir, relPath);
    mkdirSync(dirname(absPath), { recursive: true });
    writeFileSync(absPath, JSON.stringify(content, null, 2), "utf8");
  }
  return dir;
}

function compileFixture(files: Record<string, unknown>) {
  const contentDir = writeFixture(files);
  try {
    return compile({ contentDir, schemasDir: SCHEMAS_DIR, outFile: join(tmpdir(), "unused-world.json"), check: true });
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
}

const testDistrict = {
  id: "test-district",
  type: "district",
  name: "Test District",
  slug: "test-district",
  status: "open",
};

const testSkill = { id: "test-skill", type: "skill", name: "Test Skill" };

const testRepository = {
  id: "test-repo",
  type: "repository",
  githubRepository: "test-owner/test-repo",
  treeName: "test-repo",
  districtId: "test-district",
};

function baseNote(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "test-note",
    slug: "test-note",
    title: "Test Note",
    summary: "A test note.",
    category: "career",
    body: "Body text.",
    published: true,
    updatedAt: "2026-07-22",
    districtId: "test-district",
    ...overrides,
  };
}

describe("World Compiler — knowledge note publishing boundary", () => {
  test("a published: true note is compiled into world.notes", () => {
    const { errors, world } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote(),
    });
    assert.equal(errors.length, 0);
    assert.equal((world!.notes as unknown[]).length, 1);
  });

  test("a published: false note is excluded, without failing the build", () => {
    const { errors, world } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ published: false }),
    });
    assert.equal(errors.length, 0);
    assert.equal((world!.notes as unknown[]).length, 0);
  });

  test("a note missing `published` entirely fails schema validation (fail closed)", () => {
    const note = baseNote();
    delete note.published;
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": note,
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
  });

  test("a malformed unpublished draft still fails the build — published only controls inclusion, not validation tolerance", () => {
    // Missing `summary` (required) AND published: false — this must still
    // fail, per the approved fail-closed behavior: every file must be
    // structurally valid regardless of publish state.
    const note = baseNote({ published: false });
    delete note.summary;
    const { errors, world } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": note,
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
    assert.equal(world, undefined);
  });

  test("duplicate note slugs fail the build", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note-a.json": baseNote({ id: "note-a", slug: "same-slug" }),
      "knowledge/note-b.json": baseNote({ id: "note-b", slug: "same-slug" }),
    });
    assert.ok(errors.some((error) => error.kind === "duplicate-slug"));
  });

  test("an unresolved relatedSkillIds reference fails the build", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ relatedSkillIds: ["does-not-exist"] }),
    });
    assert.ok(
      errors.some((error) => error.kind === "unresolved-reference" && error.message.includes("relatedSkillIds")),
    );
  });

  test("an unresolved relatedRepositoryIds reference fails the build", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ relatedRepositoryIds: ["does-not-exist"] }),
    });
    assert.ok(
      errors.some(
        (error) => error.kind === "unresolved-reference" && error.message.includes("relatedRepositoryIds"),
      ),
    );
  });

  test("an unresolved relatedNoteIds reference fails the build", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ relatedNoteIds: ["does-not-exist"] }),
    });
    assert.ok(
      errors.some((error) => error.kind === "unresolved-reference" && error.message.includes("relatedNoteIds")),
    );
  });

  test("real relatedSkillIds/relatedRepositoryIds resolve cleanly", () => {
    const { errors, world } = compileFixture({
      "districts/test-district.json": testDistrict,
      "skills/test-skill.json": testSkill,
      "repositories/test-repo.json": testRepository,
      "knowledge/note.json": baseNote({ relatedSkillIds: ["test-skill"], relatedRepositoryIds: ["test-repo"] }),
    });
    assert.equal(errors.length, 0);
    assert.equal((world!.notes as unknown[]).length, 1);
  });

  test("an unpublished note's id/title/body never appear anywhere in the compiled world", () => {
    // The knowledge read model (src/lib/knowledge.ts) only ever reads from
    // this same compiled object — if a value isn't here, it's structurally
    // unreachable through listPublishedNotes/getKnowledgeNote/etc., not
    // merely "not returned by one function."
    const { errors, world } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/published.json": baseNote({ id: "published-note", slug: "published-note" }),
      "knowledge/draft.json": baseNote({
        id: "secret-draft-note",
        slug: "secret-draft-note",
        title: "TOP SECRET DRAFT TITLE",
        body: "TOP SECRET DRAFT BODY",
        published: false,
      }),
    });
    assert.equal(errors.length, 0);
    const serialized = JSON.stringify(world);
    assert.ok(!serialized.includes("secret-draft-note"));
    assert.ok(!serialized.includes("TOP SECRET DRAFT"));
  });

  test("entityCount reflects only compiled (published) entities, not excluded drafts", () => {
    const { errors, world } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/published.json": baseNote({ id: "published-note", slug: "published-note" }),
      "knowledge/draft.json": baseNote({ id: "draft-note", slug: "draft-note", published: false }),
    });
    assert.equal(errors.length, 0);
    const meta = world!.meta as { entityCount: number };
    // 1 district + 1 published note; the draft must not be counted.
    assert.equal(meta.entityCount, 2);
  });

  test("a POSIX absolute path in `source` is rejected", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ source: "/home/user/vault/note.md" }),
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
  });

  test("a home-relative (~) path in `source` is rejected", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ source: "~/vault/note.md" }),
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
  });

  test("a Windows absolute path in `source` is rejected", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ source: "C:\\Users\\gerso\\vault\\note.md" }),
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
  });

  test("a plain, non-path provenance string in `source` is allowed", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ source: "adapted from personal lab notes" }),
    });
    assert.equal(errors.length, 0);
  });

  test("a note with no districtId fails schema validation (now required)", () => {
    const note = baseNote();
    delete note.districtId;
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": note,
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
  });

  test("duplicate tags are rejected", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ tags: ["linux", "linux"] }),
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
  });

  test("an empty-string tag is rejected", () => {
    const { errors } = compileFixture({
      "districts/test-district.json": testDistrict,
      "knowledge/note.json": baseNote({ tags: ["linux", ""] }),
    });
    assert.ok(errors.some((error) => error.kind === "schema"));
  });
});
