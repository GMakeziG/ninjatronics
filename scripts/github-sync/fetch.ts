import type { GitHubRepo } from "./types.js";

export class GitHubApiError extends Error {}

export interface FetchOptions {
  /** Public GitHub username to fetch repositories for. Never an org — see registry note in sync-github.ts. */
  username: string;
  token?: string;
  includeForks: boolean;
  includeArchived: boolean;
}

const PER_PAGE = 100;

/**
 * Fetches every repository for a single GitHub user via GET /users/{username}/repos.
 * This endpoint only ever returns that user's PUBLIC repositories, regardless of
 * whether a token is supplied — a token here can only raise the rate limit, it can
 * never cause a private repo to leak into the world.
 */
export async function fetchPublicRepos(options: FetchOptions): Promise<GitHubRepo[]> {
  const all: GitHubRepo[] = [];

  for (let page = 1; ; page++) {
    const url = `https://api.github.com/users/${encodeURIComponent(options.username)}/repos?per_page=${PER_PAGE}&page=${page}&type=owner`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ninjatronics-github-sync",
    };
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 500);
      const hint = res.status === 403 ? " (set GITHUB_TOKEN to raise the rate limit)" : "";
      throw new GitHubApiError(`GitHub API request to ${url} failed: ${res.status} ${res.statusText}${hint}\n${body}`);
    }

    const batch = (await res.json()) as GitHubRepo[];
    all.push(...batch);
    if (batch.length < PER_PAGE) break;
  }

  return all
    .filter((repo) => (options.includeForks || !repo.fork) && (options.includeArchived || !repo.archived))
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}
