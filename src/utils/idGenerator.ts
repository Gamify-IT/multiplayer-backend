export const availableIDs: Set<number> = new Set();
const MAX_ID = 0xFFFF;
let nextId: number = 1;

for (let i = 1; i <= MAX_ID; i++) {
    availableIDs.add(i);
}

/**
 * Gets a unique if for a client.
 * @returns a unique id of 2 byte
 */
export function getId(): number {
    if (availableIDs.size === 0) {
        throw new Error("No available ID");
    }

    const id = nextId;
    availableIDs.delete(id);

    do {
        nextId = (nextId + 1) & MAX_ID;
    } while (!availableIDs.has(nextId) && availableIDs.size > 0);

    return id;
}

/**
 * Releases a given id allowing it to reuse it.
 * @param id id to release
 */
export function releaseId(id: number): void {
    if (id < 0 || id > MAX_ID || availableIDs.has(id)) {
        throw new Error("Invalid ID or already released");
    }
    availableIDs.add(id);

    if (id < nextId) {
        nextId = id;
    }
}