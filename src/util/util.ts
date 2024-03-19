export function getFileExtension(file: string): string {
    let result = /(?:\.([^.]+))?$/.exec(file)
    if (result === null || result.length < 1) {
        throw Error('Could not determine file type');
    }
    return result[1];
}

export function find(regex: RegExp, input: string) {
    const match = regex.exec(input);
    if (match === null || match[1] === undefined) {
        return '';
    }
    return match[1];
}