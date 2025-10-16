'use client';

// This file is the main entrypoint for all client-side Firebase SDKs.
// It re-exports everything from the other Firebase modules.
// This is to ensure that all Firebase-related code is bundled together
// and that we don't accidentally import server-side code into the client.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export { auth, db } from './config';
