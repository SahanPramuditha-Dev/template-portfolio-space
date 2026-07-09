export const makeEditorRow = (value = '') => ({
  id:
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  value,
});
