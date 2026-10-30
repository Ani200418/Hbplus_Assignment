export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type DenialReason = 'domain' | 'unverified' | 'provider';

export const ACCESS_DENIED_MESSAGE = 'Access restricted. Please login using your official domain email.';
