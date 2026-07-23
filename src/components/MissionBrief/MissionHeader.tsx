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
  const links: HeaderLink[] = [
    ...(githubUrl ? [{ label: "GitHub", url: githubUrl }] : []),
    ...(contact.linkedin ? [{ label: "LinkedIn", url: contact.linkedin }] : []),
    ...(contact.website ? [{ label: "Website", url: contact.website }] : []),
    ...contact.links,
  ];

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
