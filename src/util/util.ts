export function getFileExtension(file: string): string {
    let splitted = file.split('.');
    if (splitted.length === 2) {
        return splitted.pop()!;
    }
    throw Error('Could not determine file type');
}

export function find(regex: RegExp, input: string) {
    const match = regex.exec(input);
    if (match === null || match[1] === undefined) {
        return '';
    }
    return match[1];
}