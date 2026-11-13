'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  auth.languageCode = 'ar';
  return auth;
}

export interface GooglePopupResult {
  idToken: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export async function signInWithGooglePopup(): Promise<GooglePopupResult> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  provider.setCustomParameters({
    prompt: 'select_account',
  });

  try {
    const credential = await signInWithPopup(auth, provider);
    const idToken = await credential.user.getIdToken(true);

    if (!idToken) {
      throw new Error('تعذر الحصول على رمز التحقق من Google. حاول مرة أخرى.');
    }

    return {
      idToken,
      uid: credential.user.uid,
      email: credential.user.email || '',
      displayName: credential.user.displayName || '',
      photoURL: credential.user.photoURL || '',
    };
  } catch (error: any) {
    const code = error?.code || '';

    if (code === 'auth/popup-closed-by-user') {
      throw new Error('تم إغلاق نافذة Google قبل إتمام تسجيل الدخول.');
    }
    if (code === 'auth/cancelled-popup-request') {
      throw new Error('تم إلغاء الطلب السابق. اضغط على الزر مرة أخرى للمتابعة.');
    }
    if (code === 'auth/popup-blocked') {
      throw new Error('المتصفح منع فتح نافذة Google المنبثقة. اسمح بالنوافذ المنبثقة (Popups) وحاول مجدداً.');
    }
    if (code === 'auth/network-request-failed') {
      throw new Error('تعذر الاتصال بخدمة Google. تأكد من اتصالك بالإنترنت وحاول مرة أخرى.');
    }
    if (code === 'auth/unauthorized-domain') {
      throw new Error('هذا النطاق غير مصرح به في إعدادات Firebase Authentication.');
    }
    if (code === 'auth/account-exists-with-different-credential') {
      throw new Error('هذا البريد الإلكتروني مرتبط بطريقة تسجيل دخول أخرى.');
    }

    throw new Error(error?.message || 'حدث خطأ أثناء تسجيل الدخول عبر Google. حاول مرة أخرى.');
  }
}
