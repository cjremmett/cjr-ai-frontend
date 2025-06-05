"use client";
import React from 'react';
import './GoogleSignIn.css';

function GoogleSignIn({ login, logOut, profile }) {
  return (
    <div className="googleSignInContainer">
      {!profile ? (
        <button onClick={login}>Sign in with Google</button>
      ) : (
        <button onClick={logOut}>Sign Out</button>
      )}
    </div>
  );
}

export default GoogleSignIn;