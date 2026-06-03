
import { User } from '../types';

// Standard Base64URL encode (RFC 4648)
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Standard Base64URL decode with error handling
function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  try {
    // Sanitize input
    if (!base64Url || typeof base64Url !== 'string') {
        throw new Error("Invalid base64 string provided");
    }
    
    // Convert base64url to base64
    let base64 = base64Url
        .replace(/-/g, '+')     // Replace '-' with '+'
        .replace(/_/g, '/');    // Replace '_' with '/'
    
    // Add correct padding
    const pad = base64.length % 4;
    if (pad) {
        if (pad === 1) {
            throw new Error("Invalid base64 string length");
        }
        base64 += new Array(5 - pad).join('=');
    }

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  } catch (e) {
      console.error("Base64 decoding failed:", e);
      throw new Error("CORRUPT_CREDENTIAL");
  }
}

// Dynamic RP ID based on current domain
const getRpId = () => window.location.hostname;

const WEBAUTHN_CREDENTIAL_KEY = "mt_biometric_cred_id";
const WEBAUTHN_USER_ID_KEY = "mt_biometric_user_id";
const WEBAUTHN_USER_SNAPSHOT_KEY = "mt_biometric_user_snapshot";

/**
 * Registers a new biometric credential using the Native WebAuthn API.
 */
export const registerBiometric = async (user: User): Promise<{success: boolean, message?: string}> => {
  if (!window.isSecureContext) {
      return { success: false, message: "Security Error: Biometrics require HTTPS. Please deploy with SSL." };
  }

  if (!window.PublicKeyCredential) {
    return { success: false, message: "Biometrics not supported on this browser/device." };
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) {
        return { success: false, message: "No biometric hardware found or screen lock not set." };
    }

    const userName = user.email || user.id || "user";
    const userDisplayName = user.name || userName;

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: challenge,
        rp: { 
          name: "Mobi Store", 
          id: getRpId() 
        },
        user: {
          id: new TextEncoder().encode(user.id),
          name: userName,
          displayName: userDisplayName,
        },
        pubKeyCredParams: [
            { type: "public-key", alg: -7 }, 
            { type: "public-key", alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred",
        },
        timeout: 60000,
        attestation: "none",
      },
    };

    const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);

    if (credential && (credential as any).rawId) {
      const rawIdStr = bufferToBase64Url((credential as any).rawId);
      localStorage.setItem(WEBAUTHN_CREDENTIAL_KEY, rawIdStr);
      localStorage.setItem(WEBAUTHN_USER_ID_KEY, user.id); 
      localStorage.setItem(WEBAUTHN_USER_SNAPSHOT_KEY, JSON.stringify(user));

      return { success: true };
    }
    
    return { success: false, message: "Credential creation failed." };
  } catch (error: any) {
    console.error("Biometric registration error:", error);
    if (error.name === 'NotAllowedError') {
        return { success: false, message: "Biometric access denied or cancelled by user." };
    }
    return { success: false, message: `Setup failed: ${error.message || "Unknown error"}` };
  }
};

/**
 * Authenticates the user using the Native WebAuthn API.
 */
export const authenticateBiometric = async (): Promise<string | null> => {
  if (!window.PublicKeyCredential) return null;

  try {
    const storedCredentialId = localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY);
    const storedUserId = localStorage.getItem(WEBAUTHN_USER_ID_KEY);

    if (!storedCredentialId || !storedUserId) {
      throw new Error("No biometric setup found on this device.");
    }

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challenge,
        rpId: getRpId(),
        allowCredentials: [{
          type: "public-key",
          id: base64UrlToBuffer(storedCredentialId),
          transports: ["internal"],
        }],
        userVerification: "required",
        timeout: 60000,
      },
    };

    const assertion = await navigator.credentials.get(publicKeyCredentialRequestOptions);

    if (assertion) {
      return storedUserId;
    }
    
    return null;
  } catch (error: any) {
    console.error("Biometric authentication error:", error);
    
    // Handle the specific corruption error
    if (error.message === 'CORRUPT_CREDENTIAL') {
        localStorage.removeItem(WEBAUTHN_CREDENTIAL_KEY);
        localStorage.removeItem(WEBAUTHN_USER_ID_KEY);
        localStorage.removeItem(WEBAUTHN_USER_SNAPSHOT_KEY);
        throw new Error("Your login session expired or became invalid. Please sign in with your email and password to re-enable Fingerprint/FaceID.");
    }

    if (error.name === 'NotAllowedError') {
        throw new Error("Biometric scan cancelled.");
    }
    throw error;
  }
};

export const getUserSnapshot = (userId: string): User | null => {
    const snapshot = localStorage.getItem(WEBAUTHN_USER_SNAPSHOT_KEY);
    if (snapshot) {
        try {
            const user = JSON.parse(snapshot) as User;
            if (user.id === userId) return user;
        } catch (e) {
            console.error("Failed to parse user snapshot", e);
        }
    }
    return null;
}

export const hasBiometricCredential = (): boolean => {
    return !!localStorage.getItem(WEBAUTHN_CREDENTIAL_KEY);
}

export const getBiometricType = (): 'FaceID' | 'Fingerprint' | 'Biometrics' => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        return 'FaceID';
    }
    if (/Android/.test(ua)) {
        return 'Fingerprint'; 
    }
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 0) {
        return 'Fingerprint';
    }
    return 'Biometrics';
}
