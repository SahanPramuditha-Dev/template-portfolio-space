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
  ShieldCheck,
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
  badgeFields,
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
import SessionTimeoutModal from './admin/components/SessionTimeoutModal';
import { useSessionTimeout } from './admin/hooks/useSessionTimeout';

const AdminPage = () => {
  const { user, loading } = useAuthState();
  
  const [activeTab, setActiveTab] = useState('site');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleSessionExpired = (reason) => {
    if (reason === 'inactivity') {
      setAuthError('Your admin session was closed after 30 minutes of inactivity for security.');
    } else if (reason === 'max_session') {
      setAuthError('Your session reached the 8-hour maximum lifetime. Please sign in again.');
    }
  };

  const { isWarningOpen, remainingSeconds, staySignedIn, signOutNow } = useSessionTimeout(user, handleSessionExpired);

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
        { id: CMS_DOCS.badges, label: 'Digital Badges', icon: ShieldCheck },
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
      await loginWithEmail(email, password, rememberMe);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_80%_60%_at_50%_-15%,rgba(56,189,248,0.15),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(56,189,248,0.06),transparent)] px-4 py-10 text-slate-100 sm:py-14">

        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_1fr] items-stretch">
          {/* Sign In Form Card */}
          <div className="flex flex-col justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <div className="mb-8">
              <Link
                to="/"
                className="group mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-sky-400"
              >
                <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                Back to Live Portfolio
              </Link>
              <div>
                <div className="mb-4 inline-flex rounded-2xl border border-sky-500/25 bg-sky-500/10 p-3 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                  <LayoutDashboard size={24} strokeWidth={2} />
                </div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-sky-400 font-bold">Admin Console</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Sign in to CMS</h1>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
                  Manage website copy, project case studies, and media uploads. Authenticate using your Firebase admin credentials.
                </p>
              </div>
            </div>

            <form onSubmit={login} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-[0.08em] text-slate-300">
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourportfolio.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 shadow-inner"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-[0.08em] text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 inline-flex items-center px-4 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-400/30"
                  />
                  <span>Stay logged in on this device</span>
                </label>
              </div>

              {authError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs sm:text-sm font-medium text-red-200">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={authBusy}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_4px_24px_rgba(56,189,248,0.3)] transition-all hover:bg-sky-400 hover:shadow-[0_4px_32px_rgba(56,189,248,0.4)] active:scale-[0.99] disabled:opacity-60"
              >
                <LogIn size={16} />
                {authBusy ? 'Authenticating…' : 'Sign in to Dashboard'}
              </button>
            </form>


            <div className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 text-xs leading-relaxed text-slate-300">
              <div className="mb-1.5 flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle size={14} className="shrink-0" />
                Firebase Auth Required
              </div>
              Make sure Email/Password is enabled in your Firebase Authentication Console and your email is authorized in Firestore rules.
            </div>
          </div>

          {/* Right Showcase Card */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_50%),linear-gradient(160deg,rgba(15,23,42,0.95),rgba(2,6,23,0.9))] p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <div>
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-sky-400">Realtime Content System</p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white">
                Content that stays in instant sync with your live portfolio.
              </h2>
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-400">
                Every section of your website is powered by Firestore documents and Firebase Storage. Update copy, manage projects, and publish live with zero rebuilds.
              </p>
            </div>
            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {[
                'Hero & introduction',
                'Interactive projects',
                'Services & offerings',
                'Certifications & badges',
                'Skills & experience',
                'Real-time messages inbox',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/50 px-3.5 py-2.5 text-xs font-medium text-slate-200"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-500/10 border border-sky-500/30">
                    <CheckCircle2 size={12} className="text-sky-400" />
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
    <div className="min-h-screen w-full flex bg-slate-950 bg-[radial-gradient(ellipse_80%_45%_at_50%_-15%,rgba(56,189,248,0.08),transparent)] text-slate-100 font-sans">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* FIXED SIDEBAR */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80 p-5 transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:transform-none lg:bg-slate-950/60 shrink-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6 shrink-0 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-[0_0_16px_rgba(56,189,248,0.2)]">
              <Shield size={20} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-sky-400">Admin</p>
              <h1 className="text-sm font-extrabold tracking-tight text-white">Portfolio CMS</h1>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Area inside Sidebar */}
        <nav
          className="flex-1 overflow-y-auto space-y-6 pr-1 [scrollbar-width:thin]"
          aria-label="Admin sections"
        >
          {tabGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-slate-400">
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
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium transition-all group/tab',
                        isActive
                          ? 'border border-sky-500/40 bg-sky-500/15 font-bold text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.12)]'
                          : 'border border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/60 hover:text-slate-200'
                      )}
                    >
                      <Icon size={15} strokeWidth={isActive ? 2.2 : 1.75} className={isActive ? 'text-sky-400' : 'text-slate-500 group-hover/tab:text-slate-300'} />
                      <span className="truncate flex-1">{tab.label}</span>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className="shrink-0 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 text-[10px] font-bold text-slate-950 font-mono shadow-[0_0_10px_rgba(56,189,248,0.5)] animate-pulse">
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
        <div className="mt-auto pt-4 border-t border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs font-bold font-mono">
              {user.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-mono text-slate-400 truncate">Signed in as</p>
              <p className="text-xs font-bold text-slate-200 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* INDEPENDENT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top Header Panel */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu size={18} />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Console / </span>
              <h2 className="text-base sm:text-lg font-bold text-white truncate inline">{activeSection.label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition-all hover:border-sky-500/40 hover:text-sky-300"
              aria-label="View live website"
            >
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">View live site</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-xs font-semibold text-red-300 transition-all hover:bg-red-500/20"
              aria-label="Sign out"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Main Pane */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 2xl:p-10 space-y-6">

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
          {activeSection.id === CMS_DOCS.badges && (
            <CollectionEditor
              docId={CMS_DOCS.badges}
              section={sectionConfig[CMS_DOCS.badges]}
              fields={badgeFields}
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
      <SessionTimeoutModal
        isOpen={isWarningOpen}
        remainingSeconds={remainingSeconds}
        onStaySignedIn={staySignedIn}
        onSignOut={signOutNow}
      />
      <CropModalRoot />
    </div>
  );
};

export default AdminPage;
