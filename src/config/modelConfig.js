/**
 * 3D object configuration per section (symbolic, lightweight scenes).
 */
export const modelConfig = {
  hero: {
    component: 'sketchfab-orion',
    description: 'Sketchfab NASA Orion capsule embed for the dashboard hero',
  },
  projects: {
    component: 'portfolio-cube',
    description: 'Glowing portfolio cube for the projects section',
  },
  contact: {
    component: 'space-probe',
    description: 'Minimal satellite / probe for contact',
  },
  skills: {
    preferredModel: 'iss',
    autoDetect: false,
  },
};

export const getModelPreference = (section = 'skills') => {
  const config = modelConfig[section];
  if (!config) return 'iss';

  if (config.autoDetect) {
    const isLowEnd =
      (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    return isLowEnd ? config.preferredModel : config.preferredModel;
  }

  return config.preferredModel ?? config.component ?? 'iss';
};
