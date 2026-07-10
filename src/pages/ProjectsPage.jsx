import React from 'react';
import SEO from '../components/SEO';
import PageShell from '../components/PageShell';
import Projects from '../components/Projects';

const ProjectsPage = () => {
  return (
    <>
      <SEO
        title="Projects Archive | Sahan Pramuditha"
        description="A comprehensive archive of software engineering projects, system tools, open-source repositories, and developer experiments built by Sahan Pramuditha."
        canonicalPath="/projects"
      />
      <PageShell
        eyebrow="Portfolio Archive"
        title="All Projects & Code"
        description="A clean, searchable archive of all my open-source tools, applications, and experiments, sorted featured-first."
      >
        <Projects isHomepage={false} />
      </PageShell>
    </>
  );
};

export default ProjectsPage;
