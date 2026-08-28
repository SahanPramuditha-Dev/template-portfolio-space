import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Settings2, Save, Sparkles, Mail, User, Compass, LayoutGrid, Globe, Link as LinkIcon } from 'lucide-react';
import { useCmsDoc, CMS_DOCS, saveCmsDoc, uploadCmsAsset } from '../../../lib/cms';
import AdminStatus from './AdminStatus';
import SectionBanner from './SectionBanner';
import SiteSection from './SiteSection';
import FieldEditor from './fields/FieldEditor';
import RepeatableTextEditor from './fields/RepeatableTextEditor';
import HeroWordsEditor from './fields/HeroWordsEditor';
import RepeatableObjectEditor from './fields/RepeatableObjectEditor';
import { requestImageCrop } from './CropModalRoot';
import { initialSiteContent, isLikelyAssetUrl, getCmsErrorMessage } from '../utils/adminConstants';


const parseArrayValue = (value, fallback = []) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return fallback;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return raw
        .split('\n')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }
  return fallback;
};

const normalizeSiteDraft = (source = initialSiteContent) => ({
  layoutJson: source.layoutJson ?? initialSiteContent.layoutJson,

  heroTitle: source.heroTitle ?? initialSiteContent.heroTitle,
  heroSubtitle: source.heroSubtitle ?? initialSiteContent.heroSubtitle,
  heroIntro: source.heroIntro ?? initialSiteContent.heroIntro,
  heroWordsJson: parseArrayValue(source.heroWordsJson ?? initialSiteContent.heroWordsJson, JSON.parse(initialSiteContent.heroWordsJson)),
  currentLearningJson: parseArrayValue(source.currentLearningJson ?? initialSiteContent.currentLearningJson, JSON.parse(initialSiteContent.currentLearningJson)),
  devEnvironmentJson: parseArrayValue(source.devEnvironmentJson ?? initialSiteContent.devEnvironmentJson, JSON.parse(initialSiteContent.devEnvironmentJson)),
  careerGoalsJson: parseArrayValue(source.careerGoalsJson ?? initialSiteContent.careerGoalsJson, JSON.parse(initialSiteContent.careerGoalsJson)),
  hobbiesJson: parseArrayValue(source.hobbiesJson ?? initialSiteContent.hobbiesJson, JSON.parse(initialSiteContent.hobbiesJson)),
  educationJson: parseArrayValue(source.educationJson ?? initialSiteContent.educationJson, JSON.parse(initialSiteContent.educationJson)),
  availability: source.availability ?? initialSiteContent.availability,
  openToWork: source.openToWork !== undefined ? Boolean(source.openToWork) : initialSiteContent.openToWork,
  contactEmail: source.contactEmail ?? initialSiteContent.contactEmail,
  preferredContact: source.preferredContact ?? initialSiteContent.preferredContact,
  responseSla: source.responseSla ?? initialSiteContent.responseSla,
  baseLocation: source.baseLocation ?? initialSiteContent.baseLocation,
  currentFocus: source.currentFocus ?? initialSiteContent.currentFocus,
  bookingUrl: source.bookingUrl ?? initialSiteContent.bookingUrl,
  cvVersion: source.cvVersion ?? initialSiteContent.cvVersion,
  cvUpdatedAt: source.cvUpdatedAt ?? initialSiteContent.cvUpdatedAt,
  resumeUrl: source.resumeUrl ?? initialSiteContent.resumeUrl,
  githubUsername: source.githubUsername ?? initialSiteContent.githubUsername,
  profilePhotoUrl: source.profilePhotoUrl ?? initialSiteContent.profilePhotoUrl,
  avatarPhotoUrl: source.avatarPhotoUrl ?? initialSiteContent.avatarPhotoUrl,
  heroArtworkUrl: source.heroArtworkUrl ?? initialSiteContent.heroArtworkUrl,
  aboutParagraphs: source.aboutParagraphs ?? initialSiteContent.aboutParagraphs,
  aboutStatsJson: parseArrayValue(source.aboutStatsJson ?? initialSiteContent.aboutStatsJson, JSON.parse(initialSiteContent.aboutStatsJson)),
  engineeringApproachJson: parseArrayValue(source.engineeringApproachJson ?? initialSiteContent.engineeringApproachJson, JSON.parse(initialSiteContent.engineeringApproachJson)),
  footerTagline: source.footerTagline ?? initialSiteContent.footerTagline,
  footerEmail: source.footerEmail ?? initialSiteContent.footerEmail,
  socialLinksJson: parseArrayValue(source.socialLinksJson ?? initialSiteContent.socialLinksJson, JSON.parse(initialSiteContent.socialLinksJson)),
  seoTitle: source.seoTitle ?? initialSiteContent.seoTitle,
  seoDescription: source.seoDescription ?? initialSiteContent.seoDescription,
  seoImage: source.seoImage ?? initialSiteContent.seoImage,
  geminiApiKey: source.geminiApiKey ?? initialSiteContent.geminiApiKey,
  headerLinksJson: parseArrayValue(source.headerLinksJson ?? initialSiteContent.headerLinksJson, JSON.parse(initialSiteContent.headerLinksJson || '[]')),
  footerLinksJson: parseArrayValue(source.footerLinksJson ?? initialSiteContent.footerLinksJson, JSON.parse(initialSiteContent.footerLinksJson || '[]')),
});

const stringListConfig = {
  heroWordsJson: { label: 'Hero Words', helper: 'Short phrases shown in the hero typewriter.', placeholder: 'Enter a phrase', variant: 'hero' },
  currentLearningJson: { label: 'Current Learning', helper: 'What you are learning right now.', placeholder: 'Enter a topic' },
  devEnvironmentJson: { label: 'Dev Environment', helper: 'Tools and apps you actually use.', placeholder: 'Enter a tool' },
  careerGoalsJson: { label: 'Career Goals', helper: 'A few goals or directions for your profile.', placeholder: 'Enter a goal' },
  hobbiesJson: { label: 'Hobbies', helper: 'Personal interests shown in About.', placeholder: 'Enter a hobby' },
};

const objectEditorConfigs = {
  educationJson: {
    label: 'Education',
    helper: 'Add one education entry per card.',
    createItem: () => ({ institution: '', program: '', period: '', note: '' }),
    fields: [
      { key: 'institution', label: 'Institution', type: 'text' },
      { key: 'program', label: 'Program', type: 'text' },
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'note', label: 'Note', type: 'textarea' },
    ],
  },
  aboutStatsJson: {
    label: 'About Stats',
    helper: 'Numbers and labels for the stat cards on About.',
    createItem: () => ({ label: '', value: '', suffix: '' }),
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'value', label: 'Value', type: 'number' },
      { key: 'suffix', label: 'Suffix', type: 'text' },
    ],
  },
  engineeringApproachJson: {
    label: 'Engineering Approach',
    helper: 'Cards that describe how you build.',
    createItem: () => ({ title: '', description: '' }),
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  socialLinksJson: {
    label: 'Social Links',
    helper: 'Links shown in the hero and footer.',
    createItem: () => ({ label: '', href: '' }),
    fields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'href', label: 'URL', type: 'text' },
    ],
  },
  headerLinksJson: {
    label: 'Header Navigation Links',
    helper: 'Links displayed in the top navbar.',
    createItem: () => ({ label: '', href: '' }),
    fields: [
      { key: 'label', label: 'Link Text', type: 'text' },
      { key: 'href', label: 'URL / Path', type: 'text' },
    ],
  },
  footerLinksJson: {
    label: 'Footer Navigation Links',
    helper: 'Links displayed in the footer.',
    createItem: () => ({ label: '', href: '' }),
    fields: [
      { key: 'label', label: 'Link Text', type: 'text' },
      { key: 'href', label: 'URL / Path', type: 'text' },
    ],
  },
};

const SITE_CONTENT_TABS = [
  { id: 'hero', label: 'Hero & Intro', icon: Sparkles, hint: 'Homepage headline & artwork' },
  { id: 'contact', label: 'Contact & Hire', icon: Mail, hint: 'Email, availability, résumé' },
  { id: 'about', label: 'About & Bio', icon: User, hint: 'Bio, lists, education, stats' },
  { id: 'navigation', label: 'Navigation', icon: Compass, hint: 'Header & footer links' },
  { id: 'footer', label: 'Footer & Social', icon: LayoutGrid, hint: 'Footer copy & social links' },
  { id: 'seo', label: 'SEO & Meta', icon: Globe, hint: 'Global site metadata' },
];

const SiteEditor = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.site, initialSiteContent);
  const [draft, setDraft] = useState(() => normalizeSiteDraft(initialSiteContent));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [siteTab, setSiteTab] = useState('hero');

  useEffect(() => {
    if (data === undefined) return;
    setDraft(normalizeSiteDraft(data ?? initialSiteContent));
  }, [data]);

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const uploadAsset = async (key) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.gif,.mp4,.webm,.ico,.svg';
    input.onchange = async () => {
      let file = input.files?.[0];
      if (!file) return;
      const isCropExempt = file.type === 'image/gif' || file.type === 'image/svg+xml' || file.type === 'image/x-icon' || file.name.endsWith('.ico') || file.name.endsWith('.svg');
      if (file.type.startsWith('image/') && !isCropExempt) {
        try {
          const aspect = key === 'profilePhotoUrl' || key === 'avatarPhotoUrl' || key === 'ogImage' ? 1 : 16/9;
          file = await requestImageCrop(file, aspect);
        } catch {
          return;
        }
      }
      setBusy(true);
      try {
        const url = await uploadCmsAsset(file, `site/${key}`);
        updateField(key, url);
        setStatus('Media uploaded successfully.');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const save = async () => {
    setBusy(true);
    try {
      const mediaErrors = [
        ['Profile Photo URL', draft.profilePhotoUrl],
        ['Avatar Photo URL', draft.avatarPhotoUrl],
        ['Hero Artwork URL', draft.heroArtworkUrl],
        ['Resume URL', draft.resumeUrl],
      ]
        .filter(([, value]) => value && !isLikelyAssetUrl(value))
        .map(([label]) => `${label} must be a valid URL or root-relative path.`);

      if (mediaErrors.length > 0) {
        setStatus(`Please fix media before publishing: ${mediaErrors.join(' ')}`);
        return;
      }

      await saveCmsDoc(CMS_DOCS.site, {
        heroTitle: draft.heroTitle,
        heroSubtitle: draft.heroSubtitle,
        heroIntro: draft.heroIntro,
        heroWordsJson: draft.heroWordsJson,
        currentLearningJson: draft.currentLearningJson,
        devEnvironmentJson: draft.devEnvironmentJson,
        careerGoalsJson: draft.careerGoalsJson,
        hobbiesJson: draft.hobbiesJson,
        educationJson: draft.educationJson,
        availability: draft.availability,
        openToWork: Boolean(draft.openToWork),
        contactEmail: draft.contactEmail,
        preferredContact: draft.preferredContact,
        responseSla: draft.responseSla,
        bookingUrl: draft.bookingUrl,
        cvVersion: draft.cvVersion,
        cvUpdatedAt: draft.cvUpdatedAt,
        resumeUrl: draft.resumeUrl,
        githubUsername: draft.githubUsername,
        profilePhotoUrl: draft.profilePhotoUrl,
        avatarPhotoUrl: draft.avatarPhotoUrl,
        heroArtworkUrl: draft.heroArtworkUrl,
        aboutParagraphs: draft.aboutParagraphs,
        aboutStatsJson: draft.aboutStatsJson,
        engineeringApproachJson: draft.engineeringApproachJson,
        footerTagline: draft.footerTagline,
        footerEmail: draft.footerEmail,
        socialLinksJson: draft.socialLinksJson,
        headerLinksJson: draft.headerLinksJson,
        footerLinksJson: draft.footerLinksJson,
        seoTitle: draft.seoTitle || '',
        seoDescription: draft.seoDescription || '',
        seoImage: draft.seoImage || '',
        geminiApiKey: draft.geminiApiKey || '',
      });
      setStatus('Site content saved successfully!');
    } catch (error) {
      setStatus(getCmsErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        Loading website settings…
      </div>
    );
  }

  const labelFromKey = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-2xl backdrop-blur-xl">
      <div className="space-y-6 p-5 sm:p-8 pb-28">
        <SectionBanner
          icon={Settings2}
          title="Website Content"
          help="Configure general website copy, hero introduction, bios, career stats, social handles, and SEO."
          onSave={save}
          onReset={() => setDraft(normalizeSiteDraft(initialSiteContent))}
          hidePrimarySave
        />

        <AdminStatus message={status} />

        <div className="flex flex-col gap-6">
          {/* Horizontal Section Index Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
            {SITE_CONTENT_TABS.map((tab) => {
              const active = siteTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSiteTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all outline-none',
                    active
                      ? 'border border-sky-500/40 bg-sky-500/15 font-bold text-sky-300 shadow-[0_0_16px_rgba(56,189,248,0.15)]'
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  )}
                >
                  <TabIcon size={14} className={active ? 'text-sky-400' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Configuration Form Pane */}
          <div className="space-y-6 min-w-0">
            {siteTab === 'hero' && (
              <SiteSection
                title="Hero & Introduction"
                description="Headline, intro paragraph, rotating phrases, and hero artwork shown on the homepage."
              >
                <div className="grid gap-4 md:grid-cols-2">

                  {['heroTitle', 'heroSubtitle'].map((key) => (
                    <FieldEditor
                      key={key}
                      field={{ key, label: labelFromKey(key), type: 'text' }}
                      value={draft[key]}
                      onChange={(value) => updateField(key, value)}
                    />
                  ))}
                </div>
                <FieldEditor
                  field={{ key: 'heroIntro', label: 'Hero Intro', type: 'textarea' }}
                  value={draft.heroIntro}
                  onChange={(value) => updateField('heroIntro', value)}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldEditor
                    field={{ key: 'heroArtworkUrl', label: 'Hero Artwork URL', type: 'image' }}
                    value={draft.heroArtworkUrl}
                    onChange={(value) => updateField('heroArtworkUrl', value)}
                    onUpload={() => uploadAsset('heroArtworkUrl')}
                  />
                </div>
                {Object.entries(stringListConfig)
                  .filter(([k]) => k === 'heroWordsJson')
                  .map(([key, config]) => (
                    <HeroWordsEditor
                      key={key}
                      label={config.label}
                      helper={config.helper}
                      placeholder={config.placeholder}
                      value={draft[key]}
                      onChange={(value) => updateField(key, value)}
                    />
                  ))}
              </SiteSection>
            )}

            {siteTab === 'contact' && (
              <SiteSection
                title="Contact & availability"
                description="How visitors reach you, response expectations, and résumé / CV links."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {['availability', 'contactEmail', 'preferredContact', 'responseSla', 'baseLocation', 'currentFocus', 'bookingUrl', 'cvVersion', 'cvUpdatedAt', 'githubUsername'].map(
                    (key) => (
                      <FieldEditor
                        key={key}
                        field={{ key, label: labelFromKey(key), type: 'text' }}
                        value={draft[key]}
                        onChange={(value) => updateField(key, value)}
                      />
                    )
                  )}
                </div>
                <FieldEditor
                  field={{ key: 'resumeUrl', label: 'Resume PDF URL', type: 'file' }}
                  value={draft.resumeUrl}
                  onChange={(value) => updateField('resumeUrl', value)}
                  onUpload={() => uploadAsset('resumeUrl', 'application/pdf')}
                />
              </SiteSection>
            )}

            {siteTab === 'about' && (
              <SiteSection
                title="About & profile"
                description="Manage your bio, profile photo, lists, and structured cards."
              >
                <div className="space-y-12">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent border-b border-white/5 pb-2">Bio & Photo</h4>
                    <FieldEditor
                      field={{ key: 'aboutParagraphs', label: 'About Paragraphs', type: 'textarea' }}
                      value={draft.aboutParagraphs}
                      onChange={(value) => updateField('aboutParagraphs', value)}
                    />
                    <FieldEditor
                      field={{ key: 'profilePhotoUrl', label: 'Profile Photo URL', type: 'image' }}
                      value={draft.profilePhotoUrl}
                      onChange={(value) => updateField('profilePhotoUrl', value)}
                      onUpload={() => uploadAsset('profilePhotoUrl')}
                    />
                    <FieldEditor
                      field={{ key: 'avatarPhotoUrl', label: 'Avatar Photo URL', type: 'image' }}
                      value={draft.avatarPhotoUrl}
                      onChange={(value) => updateField('avatarPhotoUrl', value)}
                      onUpload={() => uploadAsset('avatarPhotoUrl')}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent border-b border-white/5 pb-2">Line-item Lists</h4>
                    <div className="grid gap-4">
                      {Object.entries(stringListConfig)
                        .filter(([k]) => k !== 'heroWordsJson')
                        .map(([key, config]) => (
                          <RepeatableTextEditor
                            key={key}
                            label={config.label}
                            helper={config.helper}
                            placeholder={config.placeholder}
                            value={draft[key]}
                            onChange={(value) => updateField(key, value)}
                          />
                        ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent border-b border-white/5 pb-2">Structured Cards</h4>
                    <div className="grid gap-4">
                      {Object.entries(objectEditorConfigs)
                        .filter(([key]) => key !== 'socialLinksJson' && key !== 'headerLinksJson' && key !== 'footerLinksJson')
                        .map(([key, config]) => (
                          <RepeatableObjectEditor
                            key={key}
                            label={config.label}
                            helper={config.helper}
                            value={draft[key]}
                            onChange={(value) => updateField(key, value)}
                            createItem={config.createItem}
                            fields={config.fields}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </SiteSection>
            )}

            {siteTab === 'navigation' && (
              <SiteSection title="Navigation & Links" icon={LinkIcon} description="Configure site-wide navigation menus.">
                <RepeatableObjectEditor
                  label={objectEditorConfigs.headerLinksJson.label}
                  helper={objectEditorConfigs.headerLinksJson.helper}
                  value={draft.headerLinksJson}
                  onChange={(v) => updateField('headerLinksJson', v)}
                  createItem={objectEditorConfigs.headerLinksJson.createItem}
                  fields={objectEditorConfigs.headerLinksJson.fields}
                />
                <RepeatableObjectEditor
                  label={objectEditorConfigs.footerLinksJson.label}
                  helper={objectEditorConfigs.footerLinksJson.helper}
                  value={draft.footerLinksJson}
                  onChange={(v) => updateField('footerLinksJson', v)}
                  createItem={objectEditorConfigs.footerLinksJson.createItem}
                  fields={objectEditorConfigs.footerLinksJson.fields}
                />
              </SiteSection>
            )}

            {siteTab === 'footer' && (
              <SiteSection title="Footer & social" description="Footer copy and outbound social links.">
                <div className="grid gap-4 md:grid-cols-2">
                  {['footerTagline', 'footerEmail'].map((key) => (
                    <FieldEditor
                      key={key}
                      field={{ key, label: labelFromKey(key), type: 'text' }}
                      value={draft[key]}
                      onChange={(value) => updateField(key, value)}
                    />
                  ))}
                </div>
                {objectEditorConfigs.socialLinksJson && (
                  <RepeatableObjectEditor
                    label={objectEditorConfigs.socialLinksJson.label}
                    helper={objectEditorConfigs.socialLinksJson.helper}
                    value={draft.socialLinksJson}
                    onChange={(value) => updateField('socialLinksJson', value)}
                    createItem={objectEditorConfigs.socialLinksJson.createItem}
                    fields={objectEditorConfigs.socialLinksJson.fields}
                  />
                )}
              </SiteSection>
            )}

            {siteTab === 'seo' && (
              <SiteSection title="SEO & Metadata" description="Manage global title tags, descriptions, and social sharing imagery.">
                <FieldEditor
                  field={{ key: 'seoPreview', type: 'seo-preview' }}
                  draft={draft}
                />
                <FieldEditor
                  field={{ key: 'seoTitle', label: 'Global Title Tag', type: 'text' }}
                  value={draft.seoTitle}
                  onChange={(value) => updateField('seoTitle', value)}
                />
                <FieldEditor
                  field={{ key: 'seoDescription', label: 'Global Meta Description', type: 'textarea' }}
                  value={draft.seoDescription}
                  onChange={(value) => updateField('seoDescription', value)}
                />
                <FieldEditor
                  field={{ key: 'seoImage', label: 'Global OG Image URL', type: 'image' }}
                  value={draft.seoImage}
                  onChange={(value) => updateField('seoImage', value)}
                  onUpload={() => uploadAsset('seoImage')}
                />
                <div className="pt-4 mt-4 border-t border-white/10">
                  <FieldEditor
                    field={{
                      key: 'geminiApiKey',
                      label: 'Google Gemini API Key (Optional for Orbital AI LLM Upgrade)',
                      type: 'password',
                      placeholder: 'AIzaSy...',
                      helper: 'Leave empty to use the instant built-in offline intelligence engine.'
                    }}
                    value={draft.geminiApiKey}
                    onChange={(value) => updateField('geminiApiKey', value)}
                  />
                </div>
              </SiteSection>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-slate-800/90 bg-slate-950/90 px-6 py-4 backdrop-blur-xl sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">Saving publishes website content changes live to your portfolio.</p>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-950 shadow-[0_4px_20px_rgba(56,189,248,0.25)] transition-all hover:bg-sky-400 hover:shadow-[0_4px_28px_rgba(56,189,248,0.35)] active:scale-[0.99] disabled:opacity-60 sm:w-auto"
          >
            <Save size={16} />
            {busy ? 'Saving changes…' : 'Save Website Content'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteEditor;

