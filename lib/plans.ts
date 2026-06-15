export const PLAN_LIMITS = {
  free: {
    memories: 500,
    apiKeys: 3,
    agents: 5,
  },
  pro: {
    memories: 50_000,
    apiKeys: 20,
    agents: 100,
  },
  enterprise: {
    memories: Infinity,
    apiKeys: Infinity,
    agents: Infinity,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
