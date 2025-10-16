'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import app, { auth, db as firestore } from '@/firebase/config';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';


interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return (
    <FirebaseProvider
      firebaseApp={app as FirebaseApp}
      auth={auth as Auth}
      firestore={firestore as Firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
