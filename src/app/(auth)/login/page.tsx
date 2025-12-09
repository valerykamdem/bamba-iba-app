import { Suspense } from 'react';
import LoginClient from './loginClient'; 

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Chargement de la page de connexion...</div>}>
      <LoginClient />
    </Suspense>
  );
}