import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

// 1. Create the Client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 60 * 24, // Data stays fresh for 24 hours
            gcTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days (Garbage Collection)
            retry: 2,
        },
    },
});

// 2. Create the Persister
export const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    throttleTime: 1000, // Save to disk every 1 second max
});