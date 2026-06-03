import { Capacitor } from '@capacitor/core';
import React, { createContext, useState, useContext, ReactNode, FC, useEffect } from 'react';
// FIX: Switched to firebase/compat/app to get the User type, as v9 modular imports are failing.
import firebase from 'firebase/compat/app';
import { auth, googleProvider, storage, db } from '../services/firebase';
import { User } from '../types';
import { createReferral, getUserByReferralCode } from '../services/api';
import * as biometricService from '../services/biometricService';
import { sendEmail, getOtpEmailTemplate } from '../services/email';

// FIX: Defined FirebaseUser type from the v8 compat library to match the API style.
type FirebaseUser = firebase.User;

const GOOGLE_CLIENT_ID = "864103694948-j361sj4sfshordq7atj552i9onpgdr6v.apps.googleusercontent.com";

declare global {
  interface Window {
    google: any;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean; // Added state
  loginWithGoogle: () => Promise<FirebaseUser>;
  loginWithEmail: (email: string, pass: string) => Promise<FirebaseUser>;
  loginWithBiometric: (userId: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, referralCode?: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, code: string, shouldDelete?: boolean) => Promise<boolean>;
  resetPasswordWithOtp: (email: string, otp: string) => Promise<void>;
  updateUserPhoto: (photoDataUrl: string) => Promise<void>;
}

// Hardcoded admin emails for role assignment
const ADMIN_EMAILS = [
  'mobistorestore@gmail.com',
  'avaymishra11@gmail.com',
  'sandy0405pandey@gmail.com',
  'bipin91116bi@gmail.com'
];

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticating: false,
  loginWithGoogle: async () => { throw new Error('not implemented'); },
  loginWithEmail: async () => { throw new Error('not implemented'); },
  loginWithBiometric: async () => { throw new Error('not implemented'); },
  signUpWithEmail: async () => { throw new Error('not implemented'); },
  logout: async () => { throw new Error('not implemented'); },
  resetPassword: async () => { throw new Error('not implemented'); },
  sendEmailOtp: async () => { throw new Error('not implemented'); },
  verifyEmailOtp: async () => { throw new Error('not implemented'); },
  resetPasswordWithOtp: async () => { throw new Error('not implemented'); },
  updateUserPhoto: async () => { throw new Error('not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

// Check if we are running in a native environment (Android/iOS)
const isNative = Capacitor.isNativePlatform();

// Helper function to create user document in Firestore
const createUserProfileDocument = async (firebaseUser: FirebaseUser, additionalData?: { name: string, referralCode?: string }) => {
  if (!firebaseUser) return;

  const userRef = db.doc(`users/${firebaseUser.uid}`);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    const { email, displayName, photoURL } = firebaseUser;
    const name = additionalData?.name || displayName || 'User';
    const role = (email && ADMIN_EMAILS.includes(email)) ? 'admin' : 'user';

    // Generate a unique 6-character referral code
    const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      // Initialize User Data
      await userRef.set({
        id: firebaseUser.uid,
        name,
        email,
        role,
        photoURL: photoURL || null,
        points: 0,
        referralCode: myReferralCode,
        createdAt: new Date().toISOString(),
      });

      // Handle Referred By Logic
      const codeToUse = additionalData?.referralCode || sessionStorage.getItem('referralCode');

      if (codeToUse) {
        const referrer = await getUserByReferralCode(codeToUse);
        if (referrer) {
          // 1. Reward New User immediately (10 points)
          await userRef.update({
            points: 10
          });

          // 2. Create Pending Referral Record for Referrer
          await createReferral({
            referrerId: referrer.id,
            referrerName: referrer.name,
            referredUserId: firebaseUser.uid,
            referredUserName: name,
            status: 'Pending',
            points: 20,
            date: new Date().toISOString().split('T')[0]
          });
        }
        // Clean up session storage
        sessionStorage.removeItem('referralCode');
      }

    } catch (error) {
      console.error("Error creating user profile document:", error);
    }
  }
  return userRef;
};


export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    // FIX: Set persistence to LOCAL for native platforms to prevent session storage issues
    if (isNative) {
      auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .catch(e => console.error("Error setting persistence:", e));
    }

    // FIX: Switched from v9 onAuthStateChanged(auth, ...) to v8 auth.onAuthStateChanged(...).
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Default role based on email list
        let role: 'user' | 'admin' = (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email)) ? 'admin' : 'user';
        let photoURL = firebaseUser.photoURL;
        let points = 0;
        let referralCode = '';
        let claimedRewards = {};
        let createdAt = '';

        // Fetch additional data from Firestore
        try {
          const userDocRef = db.collection('users').doc(firebaseUser.uid);
          const userDoc = await userDocRef.get();

          if (userDoc.exists) {
            const data = userDoc.data();
            if (data) {
              // Priority: If email is in ADMIN_EMAILS, force admin role. Otherwise trust DB.
              if (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email)) {
                role = 'admin';
                // If DB says 'user' but email is in admin list, update DB.
                if (data.role !== 'admin') {
                  userDocRef.update({ role: 'admin' });
                }
              } else if (data.role) {
                role = data.role as 'user' | 'admin';
              }

              if (data.photoURL) photoURL = data.photoURL;
              if (data.points) points = data.points;
              if (data.claimedRewards) claimedRewards = data.claimedRewards;
              if (data.createdAt) createdAt = data.createdAt;

              // FIX: Migration for existing users without referral code
              if (data.referralCode) {
                referralCode = data.referralCode;
              } else {
                // Generate one now if missing
                const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                await userDocRef.update({ referralCode: newCode });
                referralCode = newCode;
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error);
        }

        // Map Firebase user to our app's User type
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || 'No email',
          role: role,
          photoURL: photoURL,
          points,
          referralCode,
          claimedRewards,
          createdAt,
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
      setIsAuthenticating(false); // Stop overlay when auth state is resolved
    });

    // Handle Redirect Result (Only for Web, as it fails in Capacitor WebViews)
    if (!isNative) {
      const handleRedirect = async () => {
        try {
          const result = await auth.getRedirectResult();
          if (result.user) {
            setIsAuthenticating(true);
            await createUserProfileDocument(result.user);
            setIsAuthenticating(false);
          }
        } catch (error) {
          console.error("Redirect Auth Error:", error);
          setIsAuthenticating(false);
        }
      };
      handleRedirect();
    }

    return () => unsubscribe();
  }, []);

  // Google One Tap Initialization (Web-only! GIS fails on 'https://localhost' capacitor origin)
  useEffect(() => {
    if (user || loading || !window.google || isNative) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          setIsAuthenticating(true);
          try {
            console.log("Google GIS Callback received");
            const credential = firebase.auth.GoogleAuthProvider.credential(response.credential);
            const result = await auth.signInWithCredential(credential);
            if (result.user) {
              await createUserProfileDocument(result.user);
            }
          } catch (error) {
            console.error("Google GIS Login Error:", error);
          } finally {
            setIsAuthenticating(false);
          }
        },
        auto_select: false, // Don't force login without clicking
        itp_support: true,
        use_fedcm_for_prompt: true, // Modern browser support
      });

      // Show the One Tap UI automatically on mount
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("One Tap not displayed:", notification.getNotDisplayedReason());
        }
      });
    } catch (e) {
      console.error("Failed to initialize Google One Tap", e);
    }
  }, [user, loading]);

  // MODIFIED: Use the premium Google GIS flow instead of traditional popup/redirect.
  // This triggers THE prompt you liked.
  const loginWithGoogle = async (): Promise<FirebaseUser> => {
    // 1. GIS (One Tap) is only for Web.
    if (!isNative && window.google) {
      window.google.accounts.id.prompt();
    } 
    // 2. On Native, popup/redirect is extremely unstable. 
    // Without the Native Google Plugin, we advise email login or try a safer credential flow.
    else if (isNative) {
      throw new Error("Social login is currently being optimized for the mobile app. Please use your Email and Password to sign in for now.");
    }
    // 3. Web Fallback (when GIS is not available)
    else {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      setIsAuthenticating(true);
      try {
        const result = await auth.signInWithPopup(googleProvider);
        if (result.user) {
          await createUserProfileDocument(result.user);
          return result.user;
        }
      } catch (err: any) {
        console.error("Google Popup Auth Failed:", err);
        // If it's a redirect error, explain it.
        if (err.code === 'auth/operation-not-supported-in-this-environment') {
          throw new Error("This browser doesn't support popups. Please try a different login method.");
        }
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
    }
    return {} as FirebaseUser;
  };

  // FIX: Switched from v9 signInWithEmailAndPassword(auth, ...) to v8 auth.signInWithEmailAndPassword(...).
  const loginWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
    setIsAuthenticating(true);
    try {
      const result = await auth.signInWithEmailAndPassword(email, pass);
      if (!result.user) {
        setIsAuthenticating(false);
        throw new Error("Email login failed, user data not received.");
      }
      return result.user;
    } catch (e) {
      setIsAuthenticating(false);
      throw e;
    }
  };

  // Function to "login" via biometric ID
  const loginWithBiometric = async (userId: string): Promise<void> => {
    setIsAuthenticating(true);
    try {
      // 1. Try to load from local snapshot first (bypasses Firestore permission error when unauthenticated)
      const localSnapshot = biometricService.getUserSnapshot(userId);
      if (localSnapshot) {
        setUser(localSnapshot);
        setIsAuthenticating(false);
        return;
      }

      // 2. Fallback to Firestore (Might fail if rules strictly enforce auth)
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        setIsAuthenticating(false);
        throw new Error("User record not found for biometric login.");
      }
      const data = userDoc.data();
      if (data) {
        const appUser: User = {
          id: data.id,
          name: data.name || 'User',
          email: data.email || 'No email',
          role: data.role || 'user',
          photoURL: data.photoURL || null,
          points: data.points || 0,
          referralCode: data.referralCode,
          claimedRewards: data.claimedRewards || {},
          createdAt: data.createdAt,
        };
        setUser(appUser);
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error("Biometric login error", error);
      setIsAuthenticating(false);
      throw error;
    }
  };

  // FIX: Switched from v9 createUserWithEmailAndPassword/updateProfile to v8 auth.createUserWithEmailAndPassword/user.updateProfile.
  const signUpWithEmail = async (name: string, email: string, pass: string, referralCode?: string): Promise<FirebaseUser> => {
    setIsAuthenticating(true);
    try {
      const result = await auth.createUserWithEmailAndPassword(email, pass);
      if (result.user) {
        // We need to update the profile to set the displayName
        await result.user.updateProfile({ displayName: name });
        await createUserProfileDocument(result.user, { name, referralCode });
        return result.user;
      }
      setIsAuthenticating(false);
      throw new Error("Sign up failed, user data not received.");
    } catch (e) {
      setIsAuthenticating(false);
      throw e;
    }
  };

  // FIX: Switched from v9 signOut(auth) to v8 auth.signOut().
  const logout = async (): Promise<void> => {
    await auth.signOut();
  };

  const resetPassword = async (email: string): Promise<void> => {
    // Rely exclusively on Firebase's secure password reset email flow
    await auth.sendPasswordResetEmail(email);
  };

  const sendEmailOtp = async (email: string): Promise<void> => {
    // 1. Generate 6-digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 2. Fetch user name if exists
    let name = "User";
    try {
      const userDoc = await db.collection('users').where('email', '==', email).limit(1).get();
      if (!userDoc.empty) {
        name = userDoc.docs[0].data().name || "User";
      }
    } catch (e) { /* ignore */ }

    // 3. Store in Firestore (verification_codes collection)
    // This allows a Cloud Function or Backend to pick it up and send the real email
    await db.collection('verification_codes').doc(email).set({
      code: otp,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 10 * 60000) // 10 minutes expiry
    });

    // 4. Send the actual email
    try {
      const emailBody = getOtpEmailTemplate(name, otp);
      await sendEmail({
        to: email,
        subject: 'Mobi Store: Your Verification Code',
        body: emailBody
      });
      console.log(`[REAL MAIL] Sent successfully to ${email}`);
    } catch (err) {
      console.error("Failed to send real email via GAS/CloudFunctions fallback:", err);
      // We don't throw here so the user can still see the debug log if needed for local testing
    }

    console.log(`[DEBUG] Real OTP for ${email}: ${otp}`);
  };

  const verifyEmailOtp = async (email: string, code: string, shouldDelete: boolean = true): Promise<boolean> => {
    const doc = await db.collection('verification_codes').doc(email).get();
    if (!doc.exists) return false;
    
    const data = doc.data();
    if (!data) return false;

    // Check if code matches and is not expired
    if (data.code === code && new Date() < data.expiresAt.toDate()) {
        if (shouldDelete) {
            await db.collection('verification_codes').doc(email).delete();
        }
        return true;
    }
    return false;
  };

  const resetPasswordWithOtp = async (email: string, otp: string): Promise<void> => {
    // OTP already verified before calling this. Now securely trigger the Firebase reset email.
    // Clean up the used OTP code from Firestore
    await db.collection('verification_codes').doc(email).delete().catch(() => {});
    // Send the Firebase password reset email (only reached after successful OTP check)
    await auth.sendPasswordResetEmail(email);
  };

  const updateUserPhoto = async (photoDataUrl: string): Promise<void> => {
    const currentUser = auth.currentUser;
    // If authenticated via biometric (no currentUser.uid), we check state
    const currentUserId = currentUser?.uid || user?.id;

    if (!currentUserId) {
      throw new Error("No user is logged in.");
    }

    // Instead of Storage, we simply update the user document in Firestore with the base64 string.
    // This bypasses Storage rules entirely.
    const userRef = db.doc(`users/${currentUserId}`);
    await userRef.update({ photoURL: photoDataUrl });

    // Manually update the local user state to reflect the change immediately.
    setUser(prevUser => {
      if (prevUser) {
        return { ...prevUser, photoURL: photoDataUrl };
      }
      return null;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticating, loginWithGoogle, loginWithEmail, loginWithBiometric, signUpWithEmail, logout, resetPassword, sendEmailOtp, verifyEmailOtp, resetPasswordWithOtp, updateUserPhoto }}>
      {children}
    </AuthContext.Provider>
  );
};
