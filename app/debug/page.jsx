"use client";

import { useAuth } from "@/components/FirebaseProvider";
import { useEffect, useState } from "react";

export default function DebugPage() {
  const { user, loading } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      checkUser();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const response = await fetch('/api/debug-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid }),
      });
      const data = await response.json();
      setDbUser(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-semibold">Firebase User:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              uid: user?.uid,
              email: user?.email,
              displayName: user?.displayName,
            }, null, 2)}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-semibold">Database User:</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(dbUser, null, 2)}
          </pre>
        </div>

        {error && (
          <div className="border border-red-500 p-4 rounded text-red-500">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}