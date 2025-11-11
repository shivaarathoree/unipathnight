import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config'; // Import from your existing config

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const getIdToken = async () => {
    if (!user) throw new Error('No user logged in');
    return await user.getIdToken();
  };

  return {
    user,
    loading,
    getIdToken,
    auth,
  };
}