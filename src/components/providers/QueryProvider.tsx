'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

// Provider React Query pour le caching des données API
export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Cache les données pendant 5 minutes
                        staleTime: 5 * 60 * 1000,
                        // Refetch au focus de la fenêtre
                        refetchOnWindowFocus: false,
                        // Retry 1 fois en cas d'erreur
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
