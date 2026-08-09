import re

with open('src/pages/admin/utils/adminConfigs.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add featuresJson after features
content = content.replace(
    "{ key: 'features', label: 'Key Features List', type: 'list', placeholder: 'e.g. Automatic flashcard generation / Spaced repetition algorithm', group: 'story' },",
    "{ key: 'features', label: 'Key Features List', type: 'list', placeholder: 'e.g. Automatic flashcard generation / Spaced repetition algorithm', group: 'story' },\n  {\n    key: 'featuresJson',\n    label: 'Key Features Detailed',\n    type: 'object-list',\n    group: 'story',\n    createItem: () => ({ title: '', explanation: '' }),\n    fields: [\n      { key: 'title', label: 'Feature Title', type: 'text', placeholder: 'e.g. Realtime CMS' },\n      { key: 'explanation', label: 'Explanation', type: 'textarea', placeholder: 'e.g. Allows publishing projects without redeployment.' },\n    ],\n  },"
)

# Add challengesJson after challenges
content = content.replace(
    "{ key: 'challenges', label: 'Engineering Challenges', type: 'textarea', group: 'story', placeholder: 'e.g. Optimizing OpenAI token costs for large document processing.' },",
    "{ key: 'challenges', label: 'Engineering Challenges', type: 'textarea', group: 'story', placeholder: 'e.g. Optimizing OpenAI token costs for large document processing.' },\n  {\n    key: 'challengesJson',\n    label: 'Engineering Decisions & Challenges',\n    type: 'object-list',\n    group: 'story',\n    createItem: () => ({ challenge: '', solution: '', result: '' }),\n    fields: [\n      { key: 'challenge', label: 'Challenge/Problem', type: 'textarea', placeholder: 'e.g. Too many Firebase reads.' },\n      { key: 'solution', label: 'Solution', type: 'textarea', placeholder: 'e.g. Caching, Memoization' },\n      { key: 'result', label: 'Result', type: 'text', placeholder: 'e.g. 65% fewer reads.' },\n    ],\n  },"
)

# Add repoInsights after nextSteps
content = content.replace(
    "{ key: 'nextSteps', label: 'Next Steps & Future Roadmaps', type: 'textarea', group: 'story', placeholder: 'e.g. Integrating offline vector syncing and real-time collaboration.' },",
    "{ key: 'nextSteps', label: 'Next Steps & Future Roadmaps', type: 'textarea', group: 'story', placeholder: 'e.g. Integrating offline vector syncing and real-time collaboration.' },\n  { key: 'repoInsights', label: 'Repository & Code Insights', type: 'markdown', group: 'story', placeholder: 'Explain Folder structure, testing, CI/CD, state management...' },"
)

# Add developmentAnalyticsJson before perfScore
content = content.replace(
    "{ key: 'perfScore', label: 'Lighthouse Performance Score (0-100)', type: 'text', group: 'metrics', placeholder: 'e.g. 98' },",
    "{\n    key: 'developmentAnalyticsJson',\n    label: 'Development Analytics (LOC, Commits)',\n    type: 'object-list',\n    group: 'metrics',\n    createItem: () => ({ label: '', value: '' }),\n    fields: [\n      { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Lines of Code' },\n      { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 15,000+' },\n    ],\n  },\n  { key: 'perfScore', label: 'Lighthouse Performance Score (0-100)', type: 'text', group: 'metrics', placeholder: 'e.g. 98' },"
)

# Add testimonialsJson after outcomes
content = content.replace(
    "{ key: 'outcomes', label: 'Business & User Outcomes', type: 'textarea', group: 'story', placeholder: 'e.g. Increased student study consistency metrics by 25%.' },",
    "{ key: 'outcomes', label: 'Business & User Outcomes', type: 'textarea', group: 'story', placeholder: 'e.g. Increased student study consistency metrics by 25%.' },\n  {\n    key: 'testimonialsJson',\n    label: 'Project Testimonials',\n    type: 'object-list',\n    group: 'story',\n    createItem: () => ({ quote: '', author: '', role: '' }),\n    fields: [\n      { key: 'quote', label: 'Quote', type: 'textarea', placeholder: 'e.g. Made revision much easier.' },\n      { key: 'author', label: 'Author', type: 'text', placeholder: 'e.g. Student' },\n      { key: 'role', label: 'Role/Company', type: 'text', placeholder: 'e.g. University of Colombo' },\n    ],\n  },"
)

with open('src/pages/admin/utils/adminConfigs.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated adminConfigs.js')
