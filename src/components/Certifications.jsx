import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, ExternalLink, Calendar, FileText, X, Download } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

/* ── PDF Lightbox Modal ─────────────────────────────────────── */
const PdfModal = ({ url, title, onClose }) => {
  return (
    <AnimatePresence>
      {url && (
        <motion.div
          key="pdf-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            key="pdf-modal-panel"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-4xl flex flex-col rounded-2xl overflow-hidden border border-accent/30 shadow-2xl"
            style={{ maxHeight: '92vh', background: 'rgb(var(--color-primary-rgb, 10 10 20))' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10 bg-secondary/40 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-accent shrink-0" />
                <span className="text-sm font-semibold text-text truncate">{title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-mono text-accent hover:bg-accent/20 transition-colors"
                >
                  <Download size={13} /> Download
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-text transition-colors"
                >
                  <ExternalLink size={13} /> Open
                </a>
                <button
                  onClick={onClose}
                  className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-text-muted hover:text-text hover:border-white/25 transition-colors"
                  aria-label="Close PDF preview"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* PDF Embed */}
            <div className="flex-1 overflow-hidden bg-black/60">
              <iframe
                src={url}
                title={`${title} — Certificate PDF`}
                className="w-full h-full"
                style={{ height: '78vh', border: 'none' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Certificate Card ───────────────────────────────────────── */
const CertificationCard = ({ cert, index, onViewPdf }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-6 rounded-xl border border-secondary/50 hover:border-accent/50 transition-all duration-300 group bg-secondary/20 hover:bg-secondary/30"
    >
      {cert.image && (
        <div className="w-full h-32 mb-6 rounded-lg bg-black/30 border border-white/5 flex items-center justify-center overflow-hidden p-2">
          <img src={cert.image} alt={`${cert.title} badge`} className="max-w-full max-h-full object-contain drop-shadow-lg" />
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-accent/20 rounded-lg group-hover:bg-accent/30 transition-colors">
          <Award className="text-accent" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text mb-1">{cert.title}</h3>
          <p className="text-text-muted text-sm font-mono">{cert.issuer}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-text-muted">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{cert.date}</span>
        </div>
        {cert.credential && (
          <span className="font-mono text-xs bg-primary/50 px-2 py-1 rounded">
            {cert.credential}
          </span>
        )}
      </div>

      {Array.isArray(cert.skills) && cert.skills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-text-muted mb-2 font-mono">Skills:</p>
          <div className="flex flex-wrap gap-2">
            {cert.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-primary/50 text-accent rounded text-xs font-mono border border-accent/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action row */}
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {cert.link && (
          <a
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-accent hover:text-text transition-colors text-sm font-mono group/link"
          >
            Verify Certificate
            <ExternalLink size={14} className="group-hover/link:translate-x-1 transition-transform" />
          </a>
        )}

        {cert.pdfUrl && (
          <button
            type="button"
            onClick={() => onViewPdf(cert.pdfUrl, cert.title)}
            className="inline-flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-1.5 text-sm font-mono text-accent hover:bg-accent/20 transition-colors group/pdf"
          >
            <FileText size={14} className="group-hover/pdf:scale-110 transition-transform" />
            View Certificate PDF
          </button>
        )}
      </div>
    </motion.div>
  );
};

/* ── Section ────────────────────────────────────────────────── */
const Certifications = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.certifications, { items: [] });
  const certificationsList = Array.isArray(data?.items) ? data.items : [];

  const [pdfModal, setPdfModal] = useState({ url: '', title: '' });
  const openPdf  = (url, title) => setPdfModal({ url, title });
  const closePdf = () => setPdfModal({ url: '', title: '' });

  if (loading || data === undefined) {
    return <CmsSectionSkeleton id="certifications" />;
  }

  return (
    <SectionWrapper id="certifications">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8 sm:mb-12 md:mb-16 font-display gradient-text">
          <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">06.</span>
          <span className="flex-grow min-w-0">Certifications &amp; Achievements</span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
        </h2>

        {certificationsList.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No certificates have been added yet. Open the admin panel to publish your first certificate.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificationsList.map((cert, index) => (
              <CertificationCard
                key={cert.title || index}
                cert={cert}
                index={index}
                onViewPdf={openPdf}
              />
            ))}
          </div>
        )}

        {certificationsList.length > 0 && (
          <p className="text-center text-text-muted mt-8 text-sm font-mono opacity-50">
            * Click on any certificate to verify its authenticity
          </p>
        )}
      </div>

      {/* PDF Lightbox */}
      <PdfModal url={pdfModal.url} title={pdfModal.title} onClose={closePdf} />
    </SectionWrapper>
  );
};

export default Certifications;


