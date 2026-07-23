import "../components/HallOfKnowledge/HallOfKnowledge.css";
import { getDistrict, getGuardianForDistrict } from "../lib/world.js";
import { getKnowledgeCategories, getNotesByCategory, listPublishedNotes } from "../lib/knowledge.js";
import { HallOfKnowledgeHeader } from "../components/HallOfKnowledge/HallOfKnowledgeHeader.js";
import { KnowledgeTree } from "../components/HallOfKnowledge/KnowledgeTree.js";

const DISTRICT_ID = "hall-of-knowledge";

export function HallOfKnowledge() {
  const district = getDistrict(DISTRICT_ID);

  // Defensive only — content always defines hall-of-knowledge, and the
  // route itself is a literal "/valley/hall-of-knowledge" registration
  // (see App.tsx), not a generic `:districtId` param.
  if (!district) return null;

  const guardian = getGuardianForDistrict(district.id);
  const noteCount = listPublishedNotes().length;
  const categories = getKnowledgeCategories().map((group) => ({
    ...group,
    notes: getNotesByCategory(group.category),
  }));

  return (
    <main className="hall-of-knowledge">
      <HallOfKnowledgeHeader
        district={district}
        guardian={guardian}
        noteCount={noteCount}
        categoryCount={categories.length}
      />

      <KnowledgeTree categories={categories} />

      {/*
        "Recent or Featured Notes" (per the milestone spec) is intentionally
        omitted: it's only meant to appear "if a real order/featured rule
        exists." Today no note sets `order`, and every sample note shares
        the same `updatedAt` (authored the same day) — sorting by either
        would be arbitrary, not a real signal. Add this section once real
        order values or genuinely varied update dates exist.
      */}
    </main>
  );
}
