import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { environment } from '../../../environments/environment';

// Configuración temporal directa para debugging
const firebaseConfigDirect = {
  apiKey: 'AIzaSyADnHS9iVC66Mw1-dw_2dGNfUELp-uZvuc',
  authDomain: 'checkliist-611fe.firebaseapp.com',
  projectId: 'checkliist-611fe',
  storageBucket: 'checkliist-611fe.firebasestorage.app',
  messagingSenderId: '287374784614',
  appId: '1:287374784614:web:b8a240e66a41380d20d5a7',
  measurementId: 'G-R67GLCHLQ0',
};

// Debug - comparar configuraciones
console.log('🔥 Environment config:', environment.firebase);
console.log('🔥 Direct config:', firebaseConfigDirect);
console.log('🔥 Using direct config for now...');

// Initialize Firebase con configuración directa temporalmente
const app = initializeApp(firebaseConfigDirect);

// Exportar instancias de Auth, Firestore y Analytics
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

console.log('✅ Firebase inicializado con config directa');

// Conectar emuladores solo en desarrollo (opcional)
if (!environment.production) {
  try {
    // Descomentar estas líneas si tienes emuladores locales configurados:
    // connectAuthEmulator(auth, "http://localhost:9099");
    // connectFirestoreEmulator(db, "localhost", 8080);
  } catch (error) {
    // Los emuladores probablemente ya están conectados
    console.log('Firebase emulators already connected or not available');
  }
}
