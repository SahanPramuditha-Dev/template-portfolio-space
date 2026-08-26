import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import GlobalHelmet from './components/GlobalHelmet.jsx'
import '@fontsource/calistoga'
import '@fontsource/space-grotesk/300.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import './index.css'
import './index.print.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RouteAnalytics from './components/RouteAnalytics.jsx'
import RouteFallback from './components/RouteFallback.jsx'
import { initWebVitals } from './utils/analytics.js'
import SmoothScroll from './components/SmoothScroll.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import OrbitalAiModal from './components/OrbitalAiModal.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import { AchievementsProvider } from './context/AchievementsContext.jsx'

const AdminPage = lazy(() => import('./pages/AdminPage.jsx'))
const BlogPage = lazy(() => import('./pages/BlogPage.jsx'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.jsx'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'))
const ProjectPage = lazy(() => import('./pages/ProjectPage.jsx'))
const ResumePage = lazy(() => import('./pages/ResumePage.jsx'))
const ResourcesPage = lazy(() => import('./pages/ResourcesPage.jsx'))
const ServicesPage = lazy(() => import('./pages/ServicesPage.jsx'))
const OpenSourcePage = lazy(() => import('./pages/OpenSourcePage.jsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'))
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

// Smooth Scroll Polyfill for browsers without native scroll-behavior support
(() => {
  const supportsSmooth = 'scrollBehavior' in document.documentElement.style;
  if (!supportsSmooth) {
    const originalScrollTo = window.scrollTo;
    window.scrollTo = (optionsOrX, y) => {
      if (typeof optionsOrX === 'object' && optionsOrX && optionsOrX.behavior === 'smooth') {
        const start = window.scrollY;
        const target = optionsOrX.top ?? 0;
        const duration = 400;
        let startTime = null;
        const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const step = (ts) => {
          if (startTime === null) startTime = ts;
          const progress = Math.min((ts - startTime) / duration, 1);
          const eased = ease(progress);
          const next = start + (target - start) * eased;
          originalScrollTo(0, next);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } else {
        originalScrollTo(optionsOrX, y);
      }
    };
  }
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GlobalHelmet />
      <ErrorBoundary>
        <ThemeProvider>
          <BrowserRouter>
            <AccessibilityProvider>
              <AchievementsProvider>
                <RouteAnalytics />
                <SmoothScroll />
                <ScrollProgress />
                <ScrollToTop />
                <OrbitalAiModal />
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogPostPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:slug" element={<ProjectPage />} />
                    <Route path="/resume" element={<ResumePage />} />
                    <Route path="/resources" element={<ResourcesPage />} />
                    <Route path="/testimonials" element={<Navigate to="/#testimonials" replace />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/opensource" element={<OpenSourcePage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/cookies" element={<CookiePolicyPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </AchievementsProvider>
            </AccessibilityProvider>
          </BrowserRouter>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>,
)

initWebVitals();
