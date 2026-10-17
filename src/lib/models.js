// Claude models offered in Settings. Kept separate from ai.js so the Anthropic
// SDK only loads when you actually use the planner or quote reader.
export const MODELS = [
  { id: 'claude-opus-5', label: 'Claude Opus 5 — most thoughtful' },
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 — balanced' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 — fastest & cheapest' },
];
