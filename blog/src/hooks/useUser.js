import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';

const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Get the currently signed-in user
     * The recommended way to get the current user is by setting an observer
     * on the Auth object:
     */
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setUser(user);
      setIsLoading(false);
    });

    // Clean up
    return unsubscribe;
  }, []);

  return {
    user,
    isLoading,
  };
};
export default useUser;
