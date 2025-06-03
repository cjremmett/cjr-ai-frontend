"use client";
import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';


function GoogleSignIn() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log('Google Sign In Failed:', error),
  });

  const logOut = () => {
    googleLogout();
    setProfile(null);
    setUser(null);
    localStorage.removeItem('cjremmett-ai-googleProfile'); // Clear profile from localStorage
  };

  useEffect(() => {
    // Load profile from localStorage on initial render
    const storedProfile = localStorage.getItem('cjremmett-ai-googleProfile');
    if(storedProfile)
    {
      setProfile(storedProfile);
    }
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: { Authorization: `Bearer ${user.access_token}` },
          });
          const data = await res.json();
          setProfile(data);
          localStorage.setItem('cjremmett-ai-googleProfile', JSON.stringify(data)); // Store profile in localStorage
          console.log(data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    }

    fetchProfile();
  }, [user]);

  return (
    <div>
      {!profile ? (
        <button onClick={() => login()}>Sign in with Google</button>
      ) : (
        <div>
          <h3>Welcome, {profile.name}!</h3>
          <button onClick={logOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
}

export default GoogleSignIn;