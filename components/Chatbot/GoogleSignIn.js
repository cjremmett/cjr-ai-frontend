"use client";
import React from 'react';
import './GoogleSignIn.css';

function GoogleSignIn({ login, logOut, profile }) {
  return (
    <div className="googleSignInContainer">
      {!profile ? (
        <button onClick={login}>Sign in with Google</button>
      ) : (
        <div style={{ width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 400 }}>Welcome, {profile.name}!</h3>
          <button onClick={logOut}>Sign Out</button>
        </div>
      )}
    </div>
  );
}

export default GoogleSignIn;