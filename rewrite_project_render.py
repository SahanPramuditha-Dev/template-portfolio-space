import re

with open('src/pages/ProjectPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace everything from the main return statement down.
# The main return is right after the `readTime` calculation.
start_marker = r'const readTime = [^;]+;\s*return \(\s*<>'
# The main return ends with a `);` just before the closing `};` of ProjectPage
end_marker = r'\);\s*};'

start_match = re.search(start_marker, content)
end_match = re.search(end_marker, content)

if start_match and end_match:
    # Keep the readTime declaration
    prefix_len = start_match.group(0).find('return (')
    top_part = content[:start_match.start() + prefix_len]
    bottom_part = content[end_match.end()-2:] # Keep the `};`
    
    # We will replace the entire render logic with a heavily varied, scroll-revealing layout.
    
    new_render = '''return (
    <>
      <SEO
        title={`${project.title || 'Project'} | Sahan Pramuditha`}
        description={description}
        canonicalPath={`/projects/${pageSlug}`}
        ogImage={heroSlide?.kind === 'image' ? heroSlide.url : undefined}
      />
      
      {/* Dynamic Starfield Particle Background */}
      <CanvasStarfield />

      {/* Top Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50 shadow-[0_0_15px_rgb(var(--color-accent-rgb))]" 
        style={{ scaleX }} 
      />

      <StickyNav />

      <PageShell backHref="/#projects">
        
        {/* ================= HERO (Full Bleed, High Impact) ================= */}
        <div className="relative w-[100vw] left-1/2 -translate-x-1/2 mb-16 -mt-4 md:-mt-8 overflow-hidden z-10">
          <motion.div 
            style={{ y: heroY }}
            className="relative w-full h-[60vh] min-h-[500px] md:h-[80vh] md:min-h-[600px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] flex items-center justify-center"
          >
            {/* Background Media */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={heroSlide?.url || 'empty'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                {heroSlide?.kind === 'video' ? (
                  <>
                    <video src={heroSlide.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-30 blur-3xl scale-110 saturate-150 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
                    <video src={heroSlide.url} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-contain object-center z-10" />
                  </>
                ) : heroSlide ? (
                  <>
                    <img src={heroSlide.url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-3xl scale-110 saturate-150 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" aria-hidden="true" />
                    <img src={heroSlide.url} alt={heroSlide.alt || project.title} className="absolute inset-0 w-full h-full object-contain object-center z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" loading="lazy" decoding="async" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-secondary/50" />
                )}
                {/* Heavy Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Hero Text Overlay */}
            <div className="absolute bottom-16 md:bottom-24 left-0 right-0 z-30 px-4 sm:px-6">
              <div className="max-w-6xl mx-auto space-y-6">
                 
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-3">
                   {project.featured && <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-accent text-primary">Featured Project</span>}
                   {project.category && <span className="text-sm font-mono text-accent uppercase tracking-widest">{project.category}</span>}
                 </motion.div>

                 <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
                   {project.title}
                 </motion.h1>

                 {project.valueProposition && (
                   <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl drop-shadow-md">
                     {project.valueProposition}
                   </motion.p>
                 )}

                 {/* Hero Quick Stats / Meta */}
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center gap-6 pt-4 text-sm font-mono text-white/70">
                    {project.role && <div className="flex items-center gap-2"><Target size={16} className="text-accent"/> {project.role}</div>}
                    {project.projectTimeline && <div className="flex items-center gap-2"><Calendar size={16} className="text-accent"/> {project.projectTimeline}</div>}
                    {project.status && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-accent animate-pulse"/> {project.status}</div>}
                 </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ================= STORY ARC & LAYOUT PACING ================= */}
        <article className="relative z-10 w-full pb-24 overflow-hidden">
          
          {/* 1. OVERVIEW (Narrow Column for Legibility) */}
          <motion.section id="overview" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 scroll-mt-24 mb-32">
            <h2 className="text-sm font-mono text-accent uppercase tracking-widest flex items-center gap-3">
              <span className="w-8 h-px bg-accent"></span> Overview
            </h2>
            <div className="font-sans text-xl md:text-2xl text-white/90 leading-relaxed font-medium">
              {renderSimpleMarkdown(project.description || description)}
            </div>
          </motion.section>

          {/* 2. PROBLEM & SOLUTION (Split Layout) */}
          {(project.problem || project.solution) && (
            <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-32">
              <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                
                {project.problem && (
                  <motion.div id="problem" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="scroll-mt-24 space-y-6">
                    <h2 className="text-sm font-mono text-red-400 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-8 h-px bg-red-400"></span> The Problem
                    </h2>
                    <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 relative group hover:border-red-500/40 transition-colors">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500"><Target size={100}/></div>
                      <div className="font-sans text-text-muted leading-relaxed relative z-10 text-lg">
                        {renderSimpleMarkdown(project.problem)}
                      </div>
                    </div>
                  </motion.div>
                )}

                {project.solution && (
                  <motion.div id="solution" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} className="scroll-mt-24 space-y-6">
                    <h2 className="text-sm font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-3">
                      <span className="w-8 h-px bg-emerald-400"></span> The Solution
                    </h2>
                    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 relative group hover:border-emerald-500/40 transition-colors">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500"><Award size={100}/></div>
                      <div className="font-sans text-text-muted leading-relaxed relative z-10 text-lg prose prose-invert prose-p:text-text-muted prose-li:text-text-muted">
                        {renderSimpleMarkdown(project.solution)}
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </section>
          )}

          {/* 3. DEMO SHOWCASE (Full Width Gallery) */}
          {project.screenshots && project.screenshots.length > 0 && (
            <motion.section id="demo" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3 mb-12">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">Demo Showcase</h2>
                <p className="text-text-muted max-w-2xl text-lg">Visual highlights and key interactions from the final product.</p>
              </div>
              <DemoGallery screenshots={project.screenshots} />
            </motion.section>
          )}

          {/* 4. ARCHITECTURE (Large Interactive Card) */}
          {(project.architecture || tech.length > 0) && (
            <motion.section id="architecture" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">System Architecture</h2>
              </div>
              <InteractiveArchitecture content={project.architecture} />
            </motion.section>
          )}

          {/* 5. TECH STACK (Grid Layout) */}
          {(project.techStackJson?.length > 0 || tech.length > 0) && (
            <motion.section id="tech-stack" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3 mb-8">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">Technology Stack</h2>
                <p className="text-text-muted">Tools chosen specifically to optimize performance and developer experience.</p>
              </div>
              {project.techStackJson && project.techStackJson.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {project.techStackJson.map((t, idx) => (
                    <div key={idx} className="group rounded-2xl border border-white/10 bg-secondary/20 p-6 hover:bg-secondary/40 hover:border-accent/40 transition-all cursor-default">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{t.icon || '⚡'}</span>
                        <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors">{t.name}</h3>
                      </div>
                      {t.description && <p className="text-sm text-text-muted leading-relaxed">{t.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                  {tech.map((t) => (
                     <span key={t} className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-5 py-2.5 text-sm font-medium text-accent">
                        {getTechIcon(t)}
                        {t}
                     </span>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {/* 6. KEY FEATURES (Masonry or Grid) */}
          {(project.featuresJson?.length > 0 || features.length > 0) && (
            <motion.section id="features" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3 mb-12">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">Key Features</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {project.featuresJson?.length > 0 ? (
                  project.featuresJson.map((feature, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="rounded-3xl border border-white/10 bg-secondary/20 p-8 hover:bg-secondary/40 hover:border-accent/40 transition-colors group">
                      <div className="p-3 rounded-2xl bg-accent/10 text-accent inline-block mb-6 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
                        <Sparkles size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
                      {feature.explanation && (
                        <p className="text-text-muted leading-relaxed">{feature.explanation}</p>
                      )}
                    </motion.div>
                  ))
                ) : (
                  features.map((feature, idx) => (
                    <div key={idx} className="rounded-2xl border border-white/10 bg-secondary/20 p-6 flex items-start gap-4">
                      <Sparkles size={20} className="text-accent shrink-0 mt-1" />
                      <h3 className="text-lg font-medium text-text">{feature}</h3>
                    </div>
                  ))
                )}
              </div>
            </motion.section>
          )}

          {/* 7. DEVELOPMENT PROCESS (Interactive Timeline) */}
          {project.timelineJson && project.timelineJson.length > 0 && (
            <section id="timeline" className="max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3 mb-12">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">Development Process</h2>
              </div>
              <AnimatedTimeline steps={project.timelineJson} />
            </section>
          )}

          {/* 8. ENGINEERING DECISIONS (Expanding Cards) */}
          {(project.challengesJson?.length > 0 || project.challenges) && (
            <motion.section id="challenges" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3 mb-12">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">Engineering Decisions</h2>
                <p className="text-text-muted max-w-2xl">Real problems encountered and the technical solutions applied.</p>
              </div>
              
              {project.challengesJson?.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {project.challengesJson.map((c, i) => (
                    <ExpandingChallengeCard key={i} challenge={c.challenge} solution={c.solution} result={c.result} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-white/10 bg-secondary/20 p-8 md:p-12 backdrop-blur-md">
                  <div className="font-sans text-text-muted leading-relaxed space-y-4 max-w-4xl text-lg">
                    {renderSimpleMarkdown(project.challenges)}
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {/* 9. PERFORMANCE & METRICS (Animated Dashboard) */}
          {(project.perfScore || project.developmentAnalyticsJson?.length > 0 || project.impactMetricsJson?.length > 0) && (
            <section id="performance" className="max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3 mb-12">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">Performance & Results</h2>
              </div>
              
              <div className="space-y-8">
                {/* Lighthouse Circular Dashboard */}
                {project.perfScore && <PerformanceDashboard project={project} />}

                {/* Quantitative Dev Analytics Grid */}
                {project.developmentAnalyticsJson && project.developmentAnalyticsJson.length > 0 && (
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {project.developmentAnalyticsJson.map((metric, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-6 md:p-8 rounded-3xl bg-secondary/20 border border-white/10 text-center group hover:bg-secondary/40 hover:border-accent/30 transition-colors">
                         <div className="text-3xl md:text-4xl font-bold text-text mb-2 drop-shadow-md">{metric.value}</div>
                         <div className="text-xs font-mono text-text-muted uppercase tracking-wider group-hover:text-accent transition-colors">{metric.label}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {/* Traditional Impact Metrics */}
                {project.impactMetricsJson && project.impactMetricsJson.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {project.impactMetricsJson.map((metric, i) => (
                      <MetricCard key={i} label={metric.label} value={metric.value} suffix={metric.suffix} delay={i * 0.1} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 10. REPOSITORY INSIGHTS */}
          {project.repoInsights && (
            <motion.section id="repo-insights" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24 mb-32">
              <div className="flex flex-col items-center text-center space-y-3 mb-12">
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest">Repository Insights</h2>
              </div>
              <RepoInsights content={project.repoInsights} />
            </motion.section>
          )}

          {/* 11. LESSONS LEARNED (Narrow Reading Column) */}
          {(project.learned || project.lessonsLearned) && (
            <motion.section id="lessons-learned" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 scroll-mt-24 mb-32">
              <h2 className="text-sm font-mono text-accent uppercase tracking-widest flex items-center gap-3">
                <span className="w-8 h-px bg-accent"></span> Lessons Learned
              </h2>
              <div className="font-sans text-lg text-text-muted leading-relaxed">
                {project.learned && renderSimpleMarkdown(project.learned)}
                {project.lessonsLearned && renderSimpleMarkdown(project.lessonsLearned)}
              </div>
            </motion.section>
          )}

        </article>

        {/* ================= MASSIVE FOOTER CTA ================= */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mt-16 mb-24 relative z-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[3rem] border border-accent/20 bg-gradient-to-r from-accent/5 via-secondary/20 to-primary p-12 md:p-16 text-center shadow-[0_0_50px_rgba(var(--color-accent-rgb),0.1)] group hover:shadow-[0_0_80px_rgba(var(--color-accent-rgb),0.15)] transition-shadow duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--color-accent-rgb),0.08),transparent_70%)] group-hover:opacity-100 opacity-70 transition-opacity duration-500" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto flex flex-col items-center">
              <Rocket size={48} className="text-accent mb-4 animate-bounce" />
              <h3 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight">
                Interested in this project?
              </h3>
              <p className="text-lg text-text-muted leading-relaxed">
                Let's collaborate to build something outstanding for your business using a similar tech stack.
              </p>
              <div className="pt-6 flex flex-wrap justify-center gap-4">
                <a
                  href={`/#contact?projectType=${encodeURIComponent(project.projectType === 'client' ? 'Client Project' : 'Web App')}&message=${encodeURIComponent('Hi Sahan, I saw your work on "' + project.title + '" and would love to collaborate on a similar project!')}`}
                  className="inline-flex h-12 md:h-14 items-center justify-center rounded-2xl bg-accent px-8 md:px-10 text-sm font-mono font-bold uppercase tracking-wider text-primary hover:bg-white hover:text-black transition-all hover:scale-105"
                >
                  Start a project
                </a>
                {hasLive && (
                  <a href={project.external} target="_blank" rel="noreferrer" className="inline-flex h-12 md:h-14 items-center justify-center rounded-2xl bg-white/10 px-8 text-sm font-mono font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all">
                    View Live Demo
                  </a>
                )}
                {hasGithub && (
                  <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex h-12 md:h-14 items-center justify-center rounded-2xl border border-white/20 bg-transparent px-8 text-sm font-mono font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all">
                    <Github size={18} className="mr-2" /> Source Code
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Next / Previous Project Navigation */}
        <div className="mx-auto w-full px-4 sm:px-6 border-t border-white/5 py-16 bg-secondary/10 relative z-20">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-2 gap-6">
            {prevProject ? (
              <Link to={`/projects/${slugify(prevProject.slug || prevProject.id || prevProject.title || prevProject.missionCode)}`} className="group flex flex-col justify-center rounded-3xl border border-white/5 bg-transparent p-8 md:p-12 transition-all hover:bg-white/5 hover:border-accent/30 hover:-translate-x-2">
                <span className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted transition-colors group-hover:text-accent">
                  <ArrowLeft size={16} /> Previous Project
                </span>
                <span className="text-2xl md:text-3xl font-bold text-text group-hover:text-white transition-colors">{prevProject.title}</span>
              </Link>
            ) : <div />}
            {nextProject ? (
              <Link to={`/projects/${slugify(nextProject.slug || nextProject.id || nextProject.title || nextProject.missionCode)}`} className="group flex flex-col justify-center items-end text-right rounded-3xl border border-white/5 bg-transparent p-8 md:p-12 transition-all hover:bg-white/5 hover:border-accent/30 hover:translate-x-2">
                <span className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-muted transition-colors group-hover:text-accent">
                  Next Project <ArrowRight size={16} />
                </span>
                <span className="text-2xl md:text-3xl font-bold text-text group-hover:text-white transition-colors">{nextProject.title}</span>
              </Link>
            ) : <div />}
          </div>
        </div>
      </PageShell>
    </>
  );
};
'''
    
    new_content = top_part + new_render + bottom_part
    
    with open('src/pages/ProjectPage.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated ProjectPage.jsx layout pacing.')
else:
    print('Markers not found')
