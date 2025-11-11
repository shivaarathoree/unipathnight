"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/config";
import Header from "./header";
import { syncFirebaseUser } from "@/actions/user";

const AuthContext = createContext({
  user: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within FirebaseProvider");
  }
  return context;
};

export default function FirebaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Firebase auth state changed:", currentUser);
      
      // Set user state and stop loading immediately
      setUser(currentUser);
      setLoading(false);

      // Sync user in background (don't block UI)
      if (currentUser && typeof currentUser === 'object' && currentUser.uid && currentUser.email) {
        // Ensure server session cookie is set
        try {
          const idToken = await currentUser.getIdToken();
          await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
        } catch (e) {
          console.error('Failed to set session cookie', e);
        }

        syncFirebaseUser(
          currentUser.uid,
          currentUser.email,
          currentUser.displayName || null
        ).catch(error => {
          console.error("Failed to sync user to database:", error);
        });
      } else {
        // Clear server session cookie on logout or invalid user
        try {
          await fetch('/api/session', { method: 'DELETE' });
        } catch (e) {
          console.error('Failed to clear session cookie', e);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <Header />
      {children}
    </AuthContext.Provider>
  );
}