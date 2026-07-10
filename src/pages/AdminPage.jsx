import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  LogIn,
  LogOut,
  Shield,
  LayoutDashboard,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle,
  LineChart,
  Mail,
  Settings2,
  Image as ImageIcon,
  Folder,
  Briefcase,
  Award,
  Wrench,
  Sparkles,
  BookOpen,
  Quote,
  Github,
  Link as LinkIcon,
  Eye,
  EyeOff,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import {
  CMS_DOCS,
  loginWithEmail,
  logout,
  useAuthState,
} from '../lib/cms';
import { getAuthErrorMessage } from './admin/utils/adminConstants';
import {
  sectionConfig,
  projectFields,
  certificateFields,
  skillFields,
  experienceFields,
  blogFields,
  testimonialFields,
  serviceFields,
  openSourceFields,
  resourceFields,
  faqFields,
  maintenancePlanFields,
} from './admin/utils/adminConfigs';

import MessagesInbox from '../components/MessagesInbox';
import MediaLibrary from '../components/MediaLibrary';
import CropModalRoot from './admin/components/CropModalRoot';
import AnalyticsDashboard from './admin/components/AnalyticsDashboard';
import SiteEditor from './admin/components/SiteEditor';
import CollectionEditor from './admin/components/CollectionEditor';

const AdminPage = () => {
  const { user, loading } = useAuthState();
  
  const [activeTab, setActiveTab] = useState('site');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Live query listener to update unread badge on message reception
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, CMS_DOCS.messages));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter(doc => !doc.data().read).length;
      setUnreadCount(unread);
    });
    return () => unsubscribe();
  }, [user]);

  const tabGroups = [
    {
      label: '⚡ Telemetry & Inbox',
      items: [
        { id: 'analytics', label: 'Analytics Feed', icon: LineChart },
        { id: CMS_DOCS.messages, label: 'Inbox Messages', icon: Mail, badge: unreadCount },
      ],
    },
    {
      label: '⚙️ Global Configuration',
      items: [
        { id: 'site', label: 'Website Content', icon: Settings2 },
        { id: 'media', label: 'Media Library', icon: ImageIcon },
      ],
    },
    {
      label: '📁 Content Collections',
      items: [
        { id: CMS_DOCS.projects, label: 'Projects List', icon: Folder },
        { id: CMS_DOCS.services, label: 'Services Config', icon: Briefcase },
        { id: CMS_DOCS.certifications, label: 'Certificates', icon: Award },
        { id: CMS_DOCS.skills, label: 'Skills Layout', icon: Wrench },
        { id: CMS_DOCS.experience, label: 'Work Experience', icon: Sparkles },
        { id: CMS_DOCS.blog, label: 'Blog Posts', icon: BookOpen },
        { id: CMS_DOCS.testimonials, label: 'Testimonials', icon: Quote },
        { id: CMS_DOCS.openSource, label: 'Open Source', icon: Github },
        { id: CMS_DOCS.resources, label: 'Resources Archive', icon: LinkIcon },
        { id: CMS_DOCS.faqs, label: 'FAQs Config', icon: HelpCircle },
        { id: CMS_DOCS.maintenancePlans, label: 'Maintenance Plans', icon: Activity },
      ],
    },
  ];
  const tabs = tabGroups.flatMap((g) => g.items);

  const login = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError('');
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgb(var(--color-accent-rgb)/0.08),transparent)] px-4 py-20 text-text">
        <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-secondary/30 p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="mx-auto mb-5 inline-flex rounded-2xl border border-accent/25 bg-accent/10 p-4 text-accent shadow-[0_0_32px_rgb(var(--color-accent-rgb)/0.15)]">
            <Shield size={36} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-text-muted">Checking your admin session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgb(var(--color-accent-rgb)/0.1),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgb(var(--color-accent-rgb)/0.05),transparent)] px-4 py-10 text-text sm:py-14">
        <div className="w-full max-w-6xl grid gap-8 xl:grid-cols-[1fr_1.02fr] xl:items-stretch">
          <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-secondary/30 p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md sm:p-10">
            <div className="mb-8">
              <Link
                to="/"
                className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-accent"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                Back to Homepage
              </Link>
              <div>
                <div className="mb-5 inline-flex rounded-2xl border border-accent/25 bg-accent/10 p-3.5 text-accent">
                  <LayoutDashboard size={26} strokeWidth={1.75} />
                </div>
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-accent">Portfolio CMS</p>
                <h1 className="font-display mt-3 text-3xl font-bold tracking-tight text-text sm:text-4xl">Sign in</h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-text-muted">
                  Edit site copy, projects, and media-backed content. Use your Firebase admin account below.
                </p>
              </div>
            </div>

            <form onSubmit={login} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-primary/50 px-4 py-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted/50 focus:border-accent focus:ring-1 focus:ring-accent/30"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-primary/50 px-4 py-3 pr-12 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-text-muted transition-colors hover:text-accent"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {authError && (
                <div className="rounded-xl border border-red-400/35 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={authBusy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3.5 text-sm font-semibold text-primary shadow-[0_8px_32px_rgb(var(--color-accent-rgb)/0.28)] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                <LogIn size={18} />
                {authBusy ? 'Signing in…' : 'Sign in to dashboard'}
              </button>
            </form>

            <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-xs leading-relaxed text-text-muted">
              <div className="mb-2 flex items-center gap-2 font-medium text-amber-200/95">
                <AlertTriangle size={15} className="shrink-0" />
                Before first login
              </div>
              Enable Email/Password in Firebase Authentication and add your email to the <code className="rounded bg-primary/50 px-1.5 py-0.5 font-mono text-[0.7rem] text-accent">admins</code>{' '}
              collection expected by Firestore rules.
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgb(var(--color-accent-rgb)/0.14),transparent_40%),linear-gradient(145deg,rgba(15,23,42,0.92),rgba(30,41,59,0.88))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-10">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.22em] text-accent">What you can manage</p>
              <h2 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight text-text sm:text-[2rem]">
                Content that stays in sync with your live site.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-muted">
                Firestore documents power the public pages; Storage holds uploads. Change copy or add a project here and publish with Save.
              </p>
            </div>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                'Site copy & hero',
                'Projects & case studies',
                'Skills, blog & testimonials',
                'Certificates & resources',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-text"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
                    <CheckCircle2 size={14} className="text-accent" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const activeSection = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen w-full flex bg-primary bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgb(var(--color-accent-rgb)/0.07),transparent)] text-text">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR (Zero Scroll Layout Shift) */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-primary/95 backdrop-blur-2xl border-r border-white/10 p-6 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:transform-none lg:bg-secondary/20 lg:backdrop-blur-md shrink-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-accent/25 bg-accent/10 p-2.5 text-accent">
              <Shield size={18} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">Console</p>
              <h1 className="text-sm font-bold tracking-tight text-text">CMS Dashboard</h1>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Area inside Sidebar */}
        <nav
          className="flex-1 overflow-y-auto space-y-5 pr-1 [scrollbar-width:thin]"
          aria-label="Admin sections"
        >
          {tabGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-[9px] font-mono uppercase tracking-[0.18em] text-text-muted/65">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={clsx(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors group/tab',
                        isActive
                          ? 'border border-accent/35 bg-accent/15 font-semibold text-accent shadow-[0_0_0_1px_rgb(var(--color-accent-rgb)/0.08)]'
                          : 'border border-transparent text-text-muted hover:border-white/10 hover:bg-primary/45 hover:text-text'
                      )}
                    >
                      <Icon size={15} strokeWidth={1.75} className={isActive ? 'text-accent' : 'opacity-70'} />
                      <span className="truncate flex-1">{tab.label}</span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="shrink-0 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-[9px] font-bold text-primary font-mono shadow-[0_0_8px_rgba(var(--color-accent-rgb),0.4)] animate-pulse">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pinned user profile footer inside Sidebar */}
        <div className="mt-auto pt-4 border-t border-white/5 shrink-0">
          <p className="text-[10px] truncate text-text-muted leading-tight">Signed in as:</p>
          <p className="text-xs font-bold text-text truncate mt-1">{user.email}</p>
        </div>
      </aside>

      {/* INDEPENDENT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Header Panel */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-secondary/35 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-white/5 transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-text truncate">{activeSection.label}</h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-primary/30 px-3 sm:px-4 py-2 text-xs font-semibold text-text transition-colors hover:border-accent/35 hover:bg-primary/55"
              aria-label="View site"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 sm:px-4 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20"
              aria-label="Sign out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Work Workspace Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {activeSection.id === 'site' && <SiteEditor />}
          {activeSection.id === 'media' && <MediaLibrary />}
          {activeSection.id === CMS_DOCS.messages && <MessagesInbox />}
          {activeSection.id === 'analytics' && <AnalyticsDashboard />}
          {activeSection.id === CMS_DOCS.projects && (
            <CollectionEditor
              docId={CMS_DOCS.projects}
              section={sectionConfig[CMS_DOCS.projects]}
              fields={projectFields}
            />
          )}
          {activeSection.id === CMS_DOCS.certifications && (
            <CollectionEditor
              docId={CMS_DOCS.certifications}
              section={sectionConfig[CMS_DOCS.certifications]}
              fields={certificateFields}
            />
          )}
          {activeSection.id === CMS_DOCS.skills && (
            <CollectionEditor
              docId={CMS_DOCS.skills}
              section={sectionConfig[CMS_DOCS.skills]}
              fields={skillFields}
            />
          )}
          {activeSection.id === CMS_DOCS.experience && (
            <CollectionEditor
              docId={CMS_DOCS.experience}
              section={sectionConfig[CMS_DOCS.experience]}
              fields={experienceFields}
            />
          )}
          {activeSection.id === CMS_DOCS.blog && (
            <CollectionEditor docId={CMS_DOCS.blog} section={sectionConfig[CMS_DOCS.blog]} fields={blogFields} />
          )}
          {activeSection.id === CMS_DOCS.testimonials && (
            <CollectionEditor
              docId={CMS_DOCS.testimonials}
              section={sectionConfig[CMS_DOCS.testimonials]}
              fields={testimonialFields}
            />
          )}
          {activeSection.id === CMS_DOCS.services && (
            <CollectionEditor
              docId={CMS_DOCS.services}
              section={sectionConfig[CMS_DOCS.services]}
              fields={serviceFields}
            />
          )}
          {activeSection.id === CMS_DOCS.openSource && (
            <CollectionEditor
              docId={CMS_DOCS.openSource}
              section={sectionConfig[CMS_DOCS.openSource]}
              fields={openSourceFields}
            />
          )}
          {activeSection.id === CMS_DOCS.resources && (
            <CollectionEditor
              docId={CMS_DOCS.resources}
              section={sectionConfig[CMS_DOCS.resources]}
              fields={resourceFields}
            />
          )}
          {activeSection.id === CMS_DOCS.faqs && (
            <CollectionEditor
              docId={CMS_DOCS.faqs}
              section={sectionConfig[CMS_DOCS.faqs]}
              fields={faqFields}
            />
          )}
          {activeSection.id === CMS_DOCS.maintenancePlans && (
            <CollectionEditor
              docId={CMS_DOCS.maintenancePlans}
              section={sectionConfig[CMS_DOCS.maintenancePlans]}
              fields={maintenancePlanFields}
            />
          )}
        </main>
      </div>
      <CropModalRoot />
    </div>
  );
};

export default AdminPage;
