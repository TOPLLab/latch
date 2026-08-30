export function retry<T>(promise: () => Promise<T>, retries: number): Promise<T> {
    return (async () => {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await promise();
            } catch {
                // retry
            }
        }
        throw new Error("exhausted number of retries (" + retries + ")");
    })();
}