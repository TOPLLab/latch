export interface DebugFrame<T extends number = number> {
    type: T;
    payload: Uint8Array;
}

const MAX_VARINT_BYTES = 5;
const MAX_PAYLOAD_SIZE = 0x7fffffff;

export function encodeFrame<T extends number>(frame: DebugFrame<T>): Buffer {
    if (!Number.isInteger(frame.type) || frame.type < 0 || frame.type > 0xff) {
        throw new Error("Debug frame type must fit in one byte.");
    }
    return Buffer.concat([Buffer.from([frame.type]), encodeLength(frame.payload.length), Buffer.from(frame.payload)]);
}

export function encodeLength(length: number): Buffer {
    if (!Number.isInteger(length) || length < 0 || length > MAX_PAYLOAD_SIZE) {
        throw new Error("Invalid debug frame payload length.");
    }

    const bytes: number[] = [];
    do {
        let byte = length & 0x7f;
        length >>>= 7;
        if (length > 0) byte |= 0x80;
        bytes.push(byte);
    } while (length > 0);
    return Buffer.from(bytes);
}

export class DebugFrameDecoder {
    private buffer = Buffer.alloc(0);

    push(chunk: Uint8Array): DebugFrame[] {
        this.buffer = Buffer.concat([this.buffer, Buffer.from(chunk)]);
        const frames: DebugFrame[] = [];
        let offset = 0;

        while (offset < this.buffer.length) {
            const length = this.readLength(offset + 1);
            if (length === undefined) break;
            const start = offset + 1 + length.bytes;
            const end = start + length.value;
            if (end > this.buffer.length) break;
            frames.push({type: this.buffer[offset], payload: this.buffer.subarray(start, end)});
            offset = end;
        }

        this.buffer = this.buffer.subarray(offset);
        return frames;
    }

    private readLength(offset: number): {value: number; bytes: number} | undefined {
        let value = 0;
        for (let index = 0; index < MAX_VARINT_BYTES; index++) {
            const position = offset + index;
            if (position >= this.buffer.length) return undefined;
            const byte = this.buffer[position];
            value |= (byte & 0x7f) << (index * 7);
            if ((byte & 0x80) === 0) {
                if (value > MAX_PAYLOAD_SIZE) throw new Error("Debug frame payload is too large.");
                return {value, bytes: index + 1};
            }
        }
        throw new Error("Invalid debug frame length varint.");
    }
}
