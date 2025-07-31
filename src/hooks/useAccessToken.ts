import { useEffect, useState } from 'react';

export function useAccessToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getTokenFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('accessToken');
      
      if (token) {
        setAccessToken(token);
        // Store in localStorage for persistence
        localStorage.setItem('accessToken', token);
      } else {
        // Try to get from localStorage if not in URL
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          setAccessToken(storedToken);
        }
      }
    };

    getTokenFromUrl();
  }, []);

  return accessToken;
}