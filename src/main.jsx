import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminPage from './pages/AdminPage.jsx'
import BlogPage from './pages/BlogPage.jsx'
import BlogPostPage from './pages/BlogPostPage.jsx'
import ResumePage from './pages/ResumePage.jsx'
import ResourcesPage from './pages/ResourcesPage.jsx'
import TestimonialsPage from './pages/TestimonialsPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import OpenSourcePage from './pages/OpenSourcePage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import CookiePolicyPage from './pages/CookiePolicyPage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import RouteAnalytics from './components/RouteAnalytics.jsx'

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
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <RouteAnalytics />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/opensource" element={<OpenSourcePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
