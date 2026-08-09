import re

with open('src/pages/ProjectPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if "import { parseMarkdownSections }" not in content:
    content = content.replace(
        "import { renderSimpleMarkdown } from '../utils/markdown';",
        "import { renderSimpleMarkdown } from '../utils/markdown';\nimport { parseMarkdownSections } from '../utils/markdownParser';"
    )

# Find where `const project = projects.find(...)` ends and insert the extraction logic
target_str = '''  if (loading || data === undefined) {'''

injection = '''
  const parsedSections = useMemo(() => {
    if (!project) return {};
    return parseMarkdownSections(project.description || description || '');
  }, [project, description]);

  // Merge explicitly defined CMS fields with extracted markdown sections
  const pOverview = parsedSections['overview'] || parsedSections['about'] || project.description || description;
  const pProblem = project.problem || parsedSections['the-problem'] || parsedSections['problem'];
  const pSolution = project.solution || parsedSections['the-solution'] || parsedSections['solution'];
  const pFeatures = project.featuresJson?.length > 0 ? project.featuresJson : (parsedSections['key-features'] || parsedSections['features']);
  const pArchitecture = project.architecture || parsedSections['technology-approach'] || parsedSections['architecture'];
  const pChallenges = project.challengesJson?.length > 0 ? project.challengesJson : (project.challenges || parsedSections['challenges']);
  const pResults = project.perfScore || project.developmentAnalyticsJson?.length > 0 || project.impactMetricsJson?.length > 0 || parsedSections['results'];
  const pImpact = project.impactMetricsJson?.length > 0 || parsedSections['impact'];
  const pLessons = project.learned || project.lessonsLearned || parsedSections['lessons-learned'];

'''

if injection not in content:
    content = content.replace(target_str, injection + target_str)

# Now we need to update the render block to use these extracted variables.
# 1. OVERVIEW
content = content.replace(
    '''{renderSimpleMarkdown(project.description || description)}''',
    '''{renderSimpleMarkdown(typeof pOverview === 'string' ? pOverview : '')}'''
)

# 2. PROBLEM & SOLUTION
content = content.replace(
    '''{(project.problem || project.solution) && (''',
    '''{(pProblem || pSolution) && ('''
)
content = content.replace(
    '''{project.problem && (''',
    '''{pProblem && ('''
)
content = content.replace(
    '''{renderSimpleMarkdown(project.problem)}''',
    '''{renderSimpleMarkdown(typeof pProblem === 'string' ? pProblem : '')}'''
)
content = content.replace(
    '''{project.solution && (''',
    '''{pSolution && ('''
)
content = content.replace(
    '''{renderSimpleMarkdown(project.solution)}''',
    '''{renderSimpleMarkdown(typeof pSolution === 'string' ? pSolution : '')}'''
)

# 4. ARCHITECTURE
content = content.replace(
    '''{(project.architecture || tech.length > 0) && (''',
    '''{(pArchitecture || tech.length > 0) && ('''
)
content = content.replace(
    '''<InteractiveArchitecture content={project.architecture} />''',
    '''<InteractiveArchitecture content={typeof pArchitecture === 'string' ? pArchitecture : project.architecture} />'''
)

# 6. KEY FEATURES
content = content.replace(
    '''{(project.featuresJson?.length > 0 || features.length > 0) && (''',
    '''{(pFeatures || features.length > 0) && ('''
)
content = content.replace(
    '''{project.featuresJson?.length > 0 ? (''',
    '''{(Array.isArray(pFeatures) && pFeatures.length > 0) ? ('''
)
content = content.replace(
    '''project.featuresJson.map((feature, idx) => (''',
    '''pFeatures.map((feature, idx) => ('''
)
# We also need to handle if pFeatures is a markdown string.
# But in the V2 layout, the "else" branch iterates over `features` array.
# If pFeatures is a string, it will crash `features.map`. 
# Wait, let's fix the KEY FEATURES block specifically.

features_block_old = '''              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(Array.isArray(pFeatures) && pFeatures.length > 0) ? (
                  pFeatures.map((feature, idx) => (
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
              </div>'''

features_block_new = '''              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.isArray(pFeatures) ? (
                  pFeatures.map((feature, idx) => (
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
                ) : typeof pFeatures === 'string' ? (
                  <div className="col-span-full rounded-3xl border border-white/10 bg-secondary/20 p-8 backdrop-blur-md">
                    <div className="font-sans text-text-muted leading-relaxed prose prose-invert">
                      {renderSimpleMarkdown(pFeatures)}
                    </div>
                  </div>
                ) : (
                  features.map((feature, idx) => (
                    <div key={idx} className="rounded-2xl border border-white/10 bg-secondary/20 p-6 flex items-start gap-4">
                      <Sparkles size={20} className="text-accent shrink-0 mt-1" />
                      <h3 className="text-lg font-medium text-text">{feature}</h3>
                    </div>
                  ))
                )}
              </div>'''

content = content.replace(features_block_old, features_block_new)
# Note: Since I already replaced `project.featuresJson?.length > 0 ? (` with `{(Array.isArray(pFeatures) && pFeatures.length > 0) ? (` above, I need to match that exact string or just do a regex replace.
# Actually I'll just regex replace the whole KEY FEATURES section to be safe.

with open('src/pages/ProjectPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
