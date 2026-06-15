export const PLAN_LIMITS = {
  free: {
    memories: 100,
    apiKeys: 2,
    agents: 5,
    apiCallsPerDay: 1_000,
  },
  pro: {
    memories: 50_000,
    apiKeys: 20,
    agents: 100,
    apiCallsPerDay: 50_000,
  },
  enterprise: {
    memories: Infinity,
    apiKeys: Infinity,
    agents: Infinity,
    apiCallsPerDay: Infinity,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
