import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

function LogInOutButton() {
  const { t } = useTranslation();
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
            <a href="/api/auth/logout">
              {' '}
              {user.displayName}
              {' — '}
              {t('navigation.logout')}
            </a>
          </div>
        )
        : (
          <a href="/api/auth/login">
            {t('navigation.login')}
          </a>
        )}
    </div>
  );
}

export default LogInOutButton;
