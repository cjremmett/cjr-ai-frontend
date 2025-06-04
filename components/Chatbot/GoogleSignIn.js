"use client";
import React from 'react';
import './GoogleSignIn.css';

function GoogleSignIn({ login, logOut, profile }) {
  return (
    <div className="googleSignInContainer">
      <div className="welcome-area">
        {profile && (
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 400 }}>
            Welcome, {profile.name}!
          </h3>
        )}
      </div>
      {!profile ? (
        <button onClick={login}>Sign in with Google</button>
      ) : (
        <button onClick={logOut}>Sign Out</button>
      )}
    </div>
  );
}

export default GoogleSignIn;