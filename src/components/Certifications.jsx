import React from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import SectionWrapper from './SectionWrapper';
import { CMS_DOCS, useCmsDoc } from '../lib/cms';
import { CmsSectionSkeleton } from './CmsShapeSkeleton';

const CertificationCard = ({ cert, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-6 rounded-xl border border-secondary/50 hover:border-accent/50 transition-all duration-300 group bg-secondary/20 hover:bg-secondary/30"
    >
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
    </motion.div>
  );
};

const Certifications = () => {
  const { data, loading } = useCmsDoc(CMS_DOCS.certifications, { items: [] });
  const certificationsList = Array.isArray(data?.items) ? data.items : [];

  if (loading || data === undefined) {
    return <CmsSectionSkeleton id="certifications" />;
  }

  return (
    <SectionWrapper id="certifications">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative">
        <h2 className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl md:text-3xl font-bold text-text mb-8 sm:mb-12 md:mb-16 font-display gradient-text">
          <span className="text-accent font-mono text-lg sm:text-xl mr-0 sm:mr-2">06.</span>
          <span className="flex-grow min-w-0">Certifications & Achievements</span>
          <span className="h-px bg-secondary flex-grow min-w-[60px] ml-0 sm:ml-4 opacity-50 w-full sm:w-auto order-3 sm:order-none"></span>
        </h2>

        {certificationsList.length === 0 ? (
          <div className="rounded-2xl border border-secondary/50 bg-secondary/20 px-6 py-16 text-center text-text-muted">
            No certificates have been added yet. Open the admin panel to publish your first certificate.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificationsList.map((cert, index) => (
              <CertificationCard key={cert.title || index} cert={cert} index={index} />
            ))}
          </div>
        )}

        {certificationsList.length > 0 && (
          <p className="text-center text-text-muted mt-8 text-sm font-mono opacity-50">
            * Click on any certificate to verify its authenticity
          </p>
        )}
      </div>
    </SectionWrapper>
  );
};

export default Certifications;
