export async function retry<T>(promise: () => Promise<T>, retries: number): Promise<T> {
    let attempt: number = 0;
    let trying: boolean = true;
    while (trying) {
        trying = false;
        try {
            return await promise();
        } catch {
            trying = ++attempt < retries;
        }
    }
    throw new Error(`exhausted number of retries (${retries})`);
}