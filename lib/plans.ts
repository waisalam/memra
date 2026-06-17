export const PLAN_LIMITS = {
  free: {
    memories: 100,
    apiKeys: Infinity,
    extensionKeys: 1,
    agents: 5,
    apiCallsPerDay: 1_000,
    extensionSessions: 5,
  },
  pro: {
    memories: 50_000,
    apiKeys: Infinity,
    extensionKeys: 1,
    agents: 100,
    apiCallsPerDay: 50_000,
    extensionSessions: 50,
  },
  enterprise: {
    memories: Infinity,
    apiKeys: Infinity,
    extensionKeys: 1,
    agents: Infinity,
    apiCallsPerDay: Infinity,
    extensionSessions: Infinity,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS
