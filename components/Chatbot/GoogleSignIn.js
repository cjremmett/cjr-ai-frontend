"use client";
import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';


function GoogleSignIn({ login, logOut, profile }) {
  return (
    <div>
      {!profile ? (
        <button onClick={login}>Sign in with Google</button>
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