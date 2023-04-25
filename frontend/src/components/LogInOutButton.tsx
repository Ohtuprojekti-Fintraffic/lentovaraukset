import React, { useEffect, useState } from 'react';

function LogInOutButton() {
  const [user, setUser] = useState<{ displayName: string } | null>(null);
  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetch('/api/auth/user');
      setUser(await fetchedUser.json());
    };
    getUser();
  }, []);

  return (
    <div>
      {user
        ? (
          <div>
            {' '}
            {user.displayName}
            {' '}
            <a href="/api/auth/logout">Kirjaudu ulos</a>
          </div>
        )
        : <a href="/api/auth/login">Kirjaudu sisään</a>}
    </div>
  );
}

export default LogInOutButton;
