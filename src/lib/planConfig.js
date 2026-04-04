/**
 * Single source of truth for subscription plan limits and pricing.
 * Import this wherever plan limits or prices are needed.
 */

export const PLAN_LIMITS = {
  free:       2,
  premium:    5,
  teams:      10,
  enterprise: 30,
};

export const PLAN_PRICES = {
  free:       0,
  premium:    19,
  teams:      49,
  enterprise: 99,
};

/**
 * Returns the card limit for a given plan key.
 * Defaults to free plan limit if plan is unrecognised.
 */
export function getCardLimit(plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}
