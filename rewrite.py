import re
with open('src/pages/ProjectPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace everything from 'Snappy Case Study Tab Selector' to the end of the article
start_marker = r'\{/\* Snappy Case Study Tab Selector \*/\}'
end_marker = r'</article>'

# Find the start and end indices
start_match = re.search(start_marker, content)
end_match = re.search(end_marker, content)

if start_match and end_match:
    top_part = content[:start_match.start()]
    bottom_part = content[end_match.start():]
    
    new_content = top_part + '''
          {/* --- CASE STUDY SECTIONS --- */}
          <div className="flex flex-col lg:flex-row gap-8 mx-auto max-w-7xl px-4 sm:px-6 mt-16 mb-24 relative">
            {/* Sticky Navigation */}
            <div className="hidden lg:block w-48 shrink-0">
              <div className="sticky top-24 pt-4">
                <nav className="flex flex-col gap-3 border-l border-white/10 pl-4">
                  <h3 className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">Case Study</h3>
                  {['overview', 'problem-solution', 'metrics', 'features', 'architecture', 'timeline', 'tech-stack', 'lessons-learned'].map((id) => (
                    <a key={id} href={`#${id}`} className="text-sm text-text-muted hover:text-accent transition-colors capitalize">
                      {id.replace('-', ' ')}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 space-y-32">
              
              {/* Overview */}
              <section id="overview" className="space-y-6 scroll-mt-24">
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-accent"></div>
                  <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Overview</h2>
                </div>
                <div className="font-sans text-lg text-text-muted leading-relaxed max-w-3xl">
                  {renderSimpleMarkdown(project.description || description)}
                </div>
              </section>

              {/* Problem & Solution */}
              {(project.problem || project.solution) && (
                <section id="problem-solution" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Problem & Solution</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {project.problem && (
                      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 relative overflow-hidden group hover:border-red-500/40 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Target size={84}/></div>
                        <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                          <Target size={20} className="text-red-400" /> Problem
                        </h3>
                        <div className="font-sans text-text-muted leading-relaxed relative z-10">
                          {renderSimpleMarkdown(project.problem)}
                        </div>
                      </div>
                    )}
                    {project.solution && (
                      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Award size={84}/></div>
                        <h3 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                          <Award size={20} className="text-emerald-400" /> Solution
                        </h3>
                        <div className="font-sans text-text-muted leading-relaxed relative z-10">
                          {renderSimpleMarkdown(project.solution)}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Results & Impact */}
              {project.impactMetricsJson && project.impactMetricsJson.length > 0 && (
                <section id="metrics" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Impact & Results</h2>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {project.impactMetricsJson.map((metric, i) => (
                      <div key={i} className="p-8 rounded-2xl bg-secondary/30 border border-white/5 backdrop-blur-sm text-center relative overflow-hidden group hover:border-accent/40 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="text-4xl md:text-5xl font-bold text-text mb-2 relative z-10">
                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-text to-text-muted">{metric.value}</span>
                          {metric.suffix && <span className="text-2xl text-accent font-light">{metric.suffix}</span>}
                        </div>
                        <h3 className="text-xs font-mono text-accent uppercase tracking-wider relative z-10">{metric.label}</h3>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Development Journey / Timeline */}
              {project.timelineJson && project.timelineJson.length > 0 && (
                <section id="timeline" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Development Journey</h2>
                  </div>
                  <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-12">
                    {project.timelineJson.map((step, index) => (
                      <div key={index} className="relative pl-8 md:pl-12 group">
                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(var(--color-accent-rgb),0.8)] group-hover:scale-150 transition-transform" />
                        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6 mb-2">
                          <h3 className="text-xl md:text-2xl font-bold text-text">{step.step}</h3>
                          {step.duration && <span className="text-sm font-mono text-accent uppercase tracking-wider">{step.duration}</span>}
                        </div>
                        {step.description && <p className="text-text-muted leading-relaxed max-w-2xl">{step.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Key Features */}
              {features.length > 0 && (
                <section id="features" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Key Features</h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {features.map((feature, idx) => (
                      <div key={idx} className="rounded-2xl border border-white/10 bg-secondary/20 p-6 flex items-start gap-4 hover:border-accent/40 transition-colors group">
                        <div className="p-3 rounded-xl bg-accent/10 text-accent shrink-0 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-text mb-2">{feature}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Architecture & Tech Stack */}
              {(project.techStackJson?.length > 0 || project.architecture || tech.length > 0) && (
                <section id="architecture" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Architecture & Tech Stack</h2>
                  </div>
                  
                  {project.architecture && (
                    <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md mb-8 hover:border-accent/30 transition-colors">
                       <div className="font-sans text-text-muted leading-relaxed max-w-4xl">
                          {renderSimpleMarkdown(project.architecture)}
                       </div>
                    </div>
                  )}

                  {project.techStackJson && project.techStackJson.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {project.techStackJson.map((t, idx) => (
                        <div key={idx} className="group rounded-2xl border border-white/10 bg-secondary/20 p-6 hover:bg-secondary/40 hover:border-accent/40 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{t.icon || '⚡'}</span>
                            <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors">{t.name}</h3>
                          </div>
                          {t.description && <p className="text-sm text-text-muted leading-relaxed">{t.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tech.map((t) => (
                         <span key={t} className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
                            {getTechIcon(t)}
                            {t}
                         </span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Lessons Learned */}
              {(project.learned || project.lessonsLearned) && (
                <section id="lessons-learned" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Lessons Learned</h2>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                    <div className="font-sans text-text-muted leading-relaxed space-y-4 max-w-4xl">
                      {project.learned && renderSimpleMarkdown(project.learned)}
                      {project.lessonsLearned && renderSimpleMarkdown(project.lessonsLearned)}
                    </div>
                  </div>
                </section>
              )}

            </div>
          </div>
          {/* --- END CASE STUDY SECTIONS --- */}
''' + bottom_part

    with open('src/pages/ProjectPage.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Successfully updated ProjectPage.jsx structure')
else:
    print('Could not find markers')
