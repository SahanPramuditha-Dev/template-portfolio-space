import React, { useState, useEffect } from 'react';
import { GitCommit, GitPullRequest, GitBranch, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

const GithubActivity = ({ username = 'SahanPramuditha-Dev' }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    fetch(`https://api.github.com/users/${username}/events/public`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch activity');
        return res.json();
      })
      .then((data) => {
        // Filter events and limit to recent 8 entries
        const formatted = (data || [])
          .filter(e => ['PushEvent', 'PullRequestEvent', 'CreateEvent', 'IssuesEvent'].includes(e.type))
          .slice(0, 8);
        setEvents(formatted);
        setError(false);
      })
      .catch((err) => {
        console.error('Failed to fetch GitHub commits:', err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  const renderEventIcon = (type) => {
    switch (type) {
      case 'PushEvent':
        return <GitCommit size={15} className="text-accent" />;
      case 'PullRequestEvent':
        return <GitPullRequest size={15} className="text-purple-400" />;
      case 'CreateEvent':
        return <GitBranch size={15} className="text-emerald-400" />;
      case 'IssuesEvent':
        return <AlertCircle size={15} className="text-rose-400" />;
      default:
        return <GitCommit size={15} className="text-text-muted" />;
    }
  };

  const getEventDescription = (event) => {
    const repoName = event.repo.name.split('/').pop();
    switch (event.type) {
      case 'PushEvent':
        const commitMsg = event.payload.commits?.[0]?.message || 'Pushed commits';
        return (
          <>
            Pushed to <span className="font-bold text-accent">{repoName}</span>: "{commitMsg.length > 55 ? commitMsg.slice(0, 52) + '...' : commitMsg}"
          </>
        );
      case 'PullRequestEvent':
        const prAction = event.payload.action;
        const prTitle = event.payload.pull_request?.title || 'Pull request';
        return (
          <>
            {prAction} PR in <span className="font-bold text-accent">{repoName}</span>: "{prTitle}"
          </>
        );
      case 'CreateEvent':
        const refType = event.payload.ref_type;
        return (
          <>
            Created new {refType} in <span className="font-bold text-accent">{repoName}</span>
          </>
        );
      case 'IssuesEvent':
        const issueAction = event.payload.action;
        const issueTitle = event.payload.issue?.title || 'Issue';
        return (
          <>
            {issueAction} issue in <span className="font-bold text-accent">{repoName}</span>: "{issueTitle}"
          </>
        );
      default:
        return `Updated repository ${repoName}`;
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-secondary/10 p-5 font-mono animate-pulse flex flex-col gap-3 min-h-[220px] justify-center items-center">
        <RefreshCw className="animate-spin text-accent" size={20} />
        <span className="text-[9px] uppercase tracking-widest text-text-muted">Syncing mission log...</span>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-secondary/15 p-5 font-mono text-center flex flex-col justify-center items-center min-h-[220px]">
        <span className="text-text-muted text-[10px] uppercase tracking-widest mb-2 font-bold">No active mission feed</span>
        <p className="text-[10px] text-text-muted max-w-[200px] leading-relaxed">Activity offline. Check back once Sahan completes next orbital deploy.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-secondary/20 p-5 font-mono flex flex-col gap-4 backdrop-blur-sm">
      <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="tracking-[0.14em] uppercase text-text font-bold text-[10px]">
            Live Mission Feed
          </span>
        </div>
        <a 
          href={`https://github.com/${username}`} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[9px] text-accent hover:underline flex items-center gap-0.5 uppercase tracking-wider"
        >
          Profile <ExternalLink size={10} />
        </a>
      </div>

      <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
        {events.map((event) => (
          <div key={event.id} className="flex gap-2.5 items-start text-[10px] sm:text-[11px] leading-relaxed">
            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-secondary/40 border border-white/5">
              {renderEventIcon(event.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-muted truncate-2-lines">
                {getEventDescription(event)}
              </p>
              <span className="text-[8px] text-text-muted/60 mt-0.5 block font-bold">
                {new Date(event.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GithubActivity;
