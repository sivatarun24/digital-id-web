import { useState, useEffect } from 'react';
import { instAdminGetPermissions } from '../api/admin';

/**
 * Fetches the current inst-admin's institution permissions once on mount.
 * Returns null while loading, empty object on error.
 */
export default function useInstAdminPerms() {
  const [perms, setPerms] = useState(null);

  useEffect(() => {
    instAdminGetPermissions()
      .then(setPerms)
      .catch(() => setPerms({}));
  }, []);

  return perms;
}
