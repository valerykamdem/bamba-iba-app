import { Suspense } from 'react';
import RegisterClient from './registerClient';

export default function RegisterPageWrapper() {
    return (
        <Suspense fallback={<div>Chargement de la page de register...</div>}>
            <RegisterClient />
        </Suspense>
    );
}