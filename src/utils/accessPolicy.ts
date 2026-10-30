import type { DenialReason } from '../types/auth';
import { isEmailFromAllowedDomain } from './validateEmailDomain';

export interface PolicyInput {
  email: string | null | undefined;
  emailVerified: boolean;
  providerIds: string[];
}

export interface PolicyOptions {
  allowedDomain: string;
  requireVerifiedEmail: boolean;
}

export type PolicyResult = { allowed: true } | { allowed: false; reason: DenialReason };

/** Pure access decision. The input must come from the Firebase user, never from UI state. */
export function evaluateAccess(input: PolicyInput, options: PolicyOptions): PolicyResult {
  if (!isEmailFromAllowedDomain(input.email, options.allowedDomain)) {
    return { allowed: false, reason: 'domain' };
  }
  if (options.requireVerifiedEmail && !input.emailVerified) {
    return { allowed: false, reason: 'unverified' };
  }
  if (!input.providerIds.includes('google.com')) {
    return { allowed: false, reason: 'provider' };
  }
  return { allowed: true };
}

export type RouteDecision = 'wait' | 'allow' | 'login';

/** Decision for protected screens: never render content while auth is still resolving. */
export function decideProtectedRoute(status: 'loading' | 'authenticated' | 'unauthenticated'): RouteDecision {
  if (status === 'loading') return 'wait';
  return status === 'authenticated' ? 'allow' : 'login';
}
