export function indent(level: number, size: number = 2): string {
    return ' '.repeat(level * size);
}