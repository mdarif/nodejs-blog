import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const useUser = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const auth = getAuth();

  // console.log('useUse auth', auth);

  useEffect(() => {
    /**
     * Get the currently signed-in user
     * The recommended way to get the current user is by setting an observer
     * on the Auth object:
     */

    /**
     * onAuthStateChanged
     *
     * For each of your app's pages that need information about the signed-in
     * user, attach an 'observer' to the global authentication object.
     * This observer gets called whenever the user's sign-in state changes.
     *
     * Attach the observer using the onAuthStateChanged method. When a user
     * successfully signs in, you can get information about the user in the observer.
     */
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('user in useUser', user);
      setUser(user);
      setIsLoading(false);
    });

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  return { user, isLoading };
};

export default useUser;
