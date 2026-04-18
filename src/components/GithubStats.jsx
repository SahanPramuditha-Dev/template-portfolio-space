import React, { useEffect, useState } from 'react';
import { Github, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const GithubStats = ({ username }) => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const token = import.meta.env.VITE_GITHUB_TOKEN || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const u = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!u.ok) throw new Error(`User ${u.status}`);
        const userJson = await u.json();

        const r = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, { headers });
        if (!r.ok) throw new Error(`Repos ${r.status}`);
        const reposJson = await r.json();

        if (!cancelled) {
          setUser(userJson);
          setRepos(reposJson);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load GitHub data right now.');
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 animate-pulse min-h-[340px]" />
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 animate-pulse min-h-[340px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 text-text-muted text-sm min-h-[340px] flex items-center">
          {error}
        </div>
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 min-h-[340px] flex items-center">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border border-accent text-accent rounded font-mono hover:bg-accent/10 transition-colors inline-block"
          >
            View on GitHub
          </a>
        </div>
      </div>
    );
  }

  const recentRepos = repos.slice(0, 6);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] items-stretch">
      <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 h-full min-h-[340px] flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar_url}
              alt={user.name || user.login}
              loading="lazy"
              decoding="async"
              className="w-16 h-16 rounded-2xl border border-secondary/50 object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Github className="text-accent shrink-0" size={20} />
                <a
                  href={user.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-text font-semibold hover:text-accent transition-colors truncate"
                >
                  {user.name || user.login}
                </a>
              </div>
              <p className="text-text-muted text-xs font-mono truncate">{user.login}</p>
            </div>
          </div>

          <p className="text-text-muted text-sm leading-relaxed max-w-md">
            {user.bio || 'GitHub profile details and latest work snapshots.'}
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/40">
              <div className="text-accent font-display text-xl font-bold">{user.followers}</div>
              <div className="text-text-muted text-[11px] uppercase tracking-wide">Followers</div>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/40">
              <div className="text-accent font-display text-xl font-bold">{user.public_repos}</div>
              <div className="text-text-muted text-[11px] uppercase tracking-wide">Repos</div>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg border border-secondary/40">
              <div className="text-accent font-display text-xl font-bold">{user.following}</div>
              <div className="text-text-muted text-[11px] uppercase tracking-wide">Following</div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-secondary/40 grid gap-2 text-sm text-text-muted">
          {user.location && (
            <div className="flex items-center justify-between gap-4">
              <span>Location</span>
              <span className="text-text text-right truncate">{user.location}</span>
            </div>
          )}
          {user.company && (
            <div className="flex items-center justify-between gap-4">
              <span>Company</span>
              <span className="text-text text-right truncate">{user.company}</span>
            </div>
          )}
          {user.blog && (
            <div className="flex items-center justify-between gap-4">
              <span>Website</span>
              <a
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noreferrer"
                className="text-accent text-right truncate hover:underline"
              >
                {user.blog}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 h-full min-h-[340px] flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-accent" size={18} />
          <span className="text-text font-semibold">Recently Updated Repos</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 flex-1 content-start">
          {recentRepos.map((repo) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="block p-4 rounded-lg border border-secondary/40 bg-secondary/30 hover:border-accent/50 hover:bg-secondary/50 transition-colors min-h-[92px]"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-start gap-3">
                <span className="text-text font-mono text-sm leading-snug truncate">{repo.name}</span>
                <span className="flex items-center gap-1 text-text-muted text-xs shrink-0">
                  <Star size={14} className="text-accent" />
                  {repo.stargazers_count}
                </span>
              </div>
              <div className="text-text-muted text-xs mt-2 line-clamp-2">
                {repo.language || 'Unknown'} • Updated {new Date(repo.updated_at).toLocaleDateString()}
              </div>
            </motion.a>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-secondary/40">
          <a
            href={`https://github.com/${username}?tab=repositories`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:text-text transition-colors text-sm font-mono"
          >
            View all repositories
          </a>
        </div>
      </div>
    </div>
  );
};

export default GithubStats;
