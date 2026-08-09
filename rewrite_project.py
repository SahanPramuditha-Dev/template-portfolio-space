import re

with open('src/pages/ProjectPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = r'\{/\* --- CASE STUDY SECTIONS --- \*/\}'
end_marker = r'\{/\* --- END CASE STUDY SECTIONS --- \*/\}'

start_match = re.search(start_marker, content)
end_match = re.search(end_marker, content)

if start_match and end_match:
    top_part = content[:start_match.start()]
    bottom_part = content[end_match.end():]
    
    new_content = top_part + '''{/* --- CASE STUDY SECTIONS --- */}
          <div className="flex flex-col lg:flex-row gap-8 mx-auto max-w-7xl px-4 sm:px-6 mt-16 mb-24 relative">
            <StickyNav activeSection={activeTab} />

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

              {/* Problem */}
              {project.problem && (
                <section id="problem" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Problem</h2>
                  </div>
                  <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 relative overflow-hidden group hover:border-red-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Target size={120}/></div>
                    <div className="font-sans text-text-muted leading-relaxed relative z-10 text-lg">
                      {renderSimpleMarkdown(project.problem)}
                    </div>
                  </div>
                </section>
              )}

              {/* Solution */}
              {project.solution && (
                <section id="solution" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Solution</h2>
                  </div>
                  <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Award size={120}/></div>
                    <div className="font-sans text-text-muted leading-relaxed relative z-10 text-lg prose prose-invert prose-p:text-text-muted prose-li:text-text-muted">
                      {renderSimpleMarkdown(project.solution)}
                    </div>
                  </div>
                </section>
              )}

              {/* Demo Showcase Gallery */}
              {project.screenshots && project.screenshots.length > 0 && (
                <section id="demo" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Demo Showcase</h2>
                  </div>
                  <DemoGallery screenshots={project.screenshots} />
                </section>
              )}

              {/* Architecture & Tech Stack */}
              {(project.techStackJson?.length > 0 || project.architecture || tech.length > 0) && (
                <section id="architecture" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Architecture</h2>
                  </div>
                  
                  {project.architecture && (
                    <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md hover:border-accent/30 transition-colors">
                       <div className="font-sans text-text-muted leading-relaxed max-w-4xl">
                          {renderSimpleMarkdown(project.architecture)}
                       </div>
                    </div>
                  )}

                  <div id="tech-stack" className="pt-12 space-y-8 scroll-mt-24">
                    <div className="flex items-center gap-3">
                      <div className="h-px w-8 bg-accent"></div>
                      <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Technology Stack</h2>
                    </div>

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
                  </div>
                </section>
              )}

              {/* Key Features */}
              {(project.featuresJson?.length > 0 || features.length > 0) && (
                <section id="features" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Key Features</h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {project.featuresJson?.length > 0 ? (
                      project.featuresJson.map((feature, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-secondary/20 p-6 flex flex-col gap-2 hover:border-accent/40 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-accent/10 text-accent shrink-0 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
                              <Sparkles size={18} />
                            </div>
                            <h3 className="text-lg font-bold text-text">{feature.title}</h3>
                          </div>
                          {feature.explanation && (
                            <p className="text-text-muted leading-relaxed ml-[52px]">{feature.explanation}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      features.map((feature, idx) => (
                        <div key={idx} className="rounded-2xl border border-white/10 bg-secondary/20 p-6 flex items-start gap-4 hover:border-accent/40 transition-colors group">
                          <div className="p-3 rounded-xl bg-accent/10 text-accent shrink-0 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-text mb-2">{feature}</h3>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}

              {/* Development Journey / Timeline */}
              {project.timelineJson && project.timelineJson.length > 0 && (
                <section id="timeline" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Development Process</h2>
                  </div>
                  <Timeline steps={project.timelineJson} />
                </section>
              )}

              {/* Engineering Decisions & Challenges */}
              {(project.challengesJson?.length > 0 || project.challenges) && (
                <section id="challenges" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Engineering Decisions</h2>
                  </div>
                  
                  {project.challengesJson?.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {project.challengesJson.map((c, i) => (
                        <EngineeringChallengeCard key={i} challenge={c.challenge} solution={c.solution} result={c.result} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-secondary/20 p-6 md:p-8 backdrop-blur-md">
                      <div className="font-sans text-text-muted leading-relaxed space-y-4 max-w-4xl">
                        {renderSimpleMarkdown(project.challenges)}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Performance & Impact Metrics */}
              {(project.impactMetricsJson?.length > 0 || project.developmentAnalyticsJson?.length > 0) && (
                <section id="performance" className="space-y-12 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Performance & Results</h2>
                  </div>
                  
                  {project.impactMetricsJson && project.impactMetricsJson.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {project.impactMetricsJson.map((metric, i) => (
                        <MetricCard key={i} label={metric.label} value={metric.value} suffix={metric.suffix} delay={i * 0.1} />
                      ))}
                    </div>
                  )}

                  {project.developmentAnalyticsJson && project.developmentAnalyticsJson.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-3">
                      {project.developmentAnalyticsJson.map((metric, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-secondary/10 border border-white/5 text-center group hover:bg-secondary/20 transition-colors">
                           <div className="text-2xl md:text-3xl font-bold text-text mb-1">{metric.value}</div>
                           <div className="text-xs font-mono text-text-muted uppercase tracking-wider">{metric.label}</div>
                        </div>
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

              {/* Repository Insights */}
              {project.repoInsights && (
                <section id="repo-insights" className="space-y-8 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-accent"></div>
                    <h2 className="text-2xl font-bold text-text uppercase tracking-widest">Repository Insights</h2>
                  </div>
                  <RepoInsights content={project.repoInsights} />
                </section>
              )}

            </div>
          </div>
          {/* --- END CASE STUDY SECTIONS --- */}''' + bottom_part
    
    with open('src/pages/ProjectPage.jsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated ProjectPage.jsx')
else:
    print('Markers not found')
