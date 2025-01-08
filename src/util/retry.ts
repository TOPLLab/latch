export function retry<T>(promise: () => Promise<T>, retries: number): Promise<T> {
    return new Promise<T>(async function (resolve, reject) {
        let attempt: number = 0;
        let trying: boolean = true;
        while (trying) {
            trying = false;
            try {
                const result: T = await promise();
                resolve(result);
            } catch (e) {
                trying = ++attempt < retries;
            }
        }
        reject(new Error(`exhausted number of retries (${retries})`));
    });
}