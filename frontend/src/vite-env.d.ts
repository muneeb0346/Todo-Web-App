Object.defineProperty(window, 'import', {
    value: {
        meta: {
            env: {
                VITE_API_URL: 'http://localhost:5000',
            },
        },
    },
});

declare global {
    interface ImportMeta {
        env: {
            VITE_API_URL: string;
        };
    }
}
