import { useEffect, useState } from 'react';
import type { Me } from '@sdp/shared';
import { api } from './api';

export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    api.me().then(setMe).catch(setError);
  }, []);

  return { me, error };
}
