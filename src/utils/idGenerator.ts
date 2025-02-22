export const courses = new Map<number, Uint8Array>();

export function getAvailableId(courseId: number): number {
    if (!courses.has(courseId)) {
        // 256 unique ids per course
        courses.set(courseId, new Uint8Array(32));
    }

    const bitset = courses.get(courseId)!;

    for (let byteIndex = 0; byteIndex < 32; byteIndex++) {
        // only check non-full bytes
        if (bitset[byteIndex] !== 0xff) {
            for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
                const mask = 1 << bitIndex;
                if ((bitset[byteIndex] & mask) === 0) {
                    // set the bit
                    bitset[byteIndex] |= mask;
                    return byteIndex * 8 + bitIndex;
                }
            }
        }
    }
    throw new Error(`No available IDs in course ${courseId}`);
}

export function releaseId(courseId: number, id: number) {
    if (!courses.has(courseId)) return;

    const bitset = courses.get(courseId)!;
    const byteIndex = Math.floor(id / 8);
    const bitIndex = id % 8;
    // delete the bit
    bitset[byteIndex] &= ~(1 << bitIndex);
}