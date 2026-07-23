import type { MissionBriefContact, MissionBriefProfile } from "../../lib/mission-brief.js";

export interface MissionHeaderProps {
  profile: MissionBriefProfile;
  contact: MissionBriefContact;
  githubUrl?: string;
}

interface HeaderLink {
  label: string;
  url: string;
}

export function MissionHeader({ profile, contact, githubUrl }: MissionHeaderProps) {
  const candidateLinks: HeaderLink[] = [
    ...(githubUrl ? [{ label: "GitHub", url: githubUrl }] : []),
    ...(contact.linkedin ? [{ label: "LinkedIn", url: contact.linkedin }] : []),
    ...(contact.website ? [{ label: "Website", url: contact.website }] : []),
    ...contact.links,
  ];

  // `githubUrl` (derived from a district's GitHub dataSource) and
  // profile.json's own `links` array can legitimately point at the same
  // URL (they do today) — dedupe by URL rather than assuming which source
  // "wins," so each distinct destination renders exactly once, under
  // whichever label reached it first.
  const seenUrls = new Set<string>();
  const links = candidateLinks.filter((link) => {
    if (seenUrls.has(link.url)) return false;
    seenUrls.add(link.url);
    return true;
  });

  return (
    <header className="mission-header">
      <p className="mission-header__eyebrow">Mission Brief</p>
      {profile.name && <h1 className="mission-header__name">{profile.name}</h1>}
      {profile.title && <p className="mission-header__title">{profile.title}</p>}
      {profile.tagline && <p className="mission-header__tagline">{profile.tagline}</p>}

      {(contact.location || contact.email) && (
        <p className="mission-header__meta">
          {contact.location}
          {contact.location && contact.email && " · "}
          {contact.email && <a href={`mailto:${contact.email}`}>{contact.email}</a>}
        </p>
      )}

      {links.length > 0 && (
        <ul className="mission-header__links">
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
