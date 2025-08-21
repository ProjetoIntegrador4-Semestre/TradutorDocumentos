import React, { useEffect, useState } from 'react';
import { authFetch } from '../auth';

export default function Dashboard() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await authFetch('/users/me');
      const data = await res.json();
      setMe(data);
    })();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {me ? <pre>{JSON.stringify(me, null, 2)}</pre> : 'Carregando...'}
    </div>
  );
}
