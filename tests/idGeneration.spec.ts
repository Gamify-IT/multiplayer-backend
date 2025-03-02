import { availableIDs, getId, releaseId } from "../src/utils/idGenerator";

describe('player ID generation', () => {
  beforeEach(() => {
    for (let i = 0; i <= 0xFFFF; i++) {
        availableIDs.add(i);
    }
  });

  test('Unique ID generation', () => {
    const id1 = getId();
    const id2 = getId();
    expect(id1).not.toBeNull();
    expect(id2).not.toBeNull();
    expect(id1).not.toEqual(id2);
  });

  test('Reuse of released ID', () => {
    const id1 = getId();
    expect(id1).not.toBeNull();

    releaseId(id1!);
    const id2 = getId();
    expect(id2).toEqual(id1);
  });

  test('Error on releasing invalid ID', () => {
    expect(() => releaseId(-1)).toThrow("Invalid ID or already released");
    expect(() => releaseId(0x10000)).toThrow("Invalid ID or already released");
  });

  test('Error if no IDs available', () => {
    const ids: number[] = [];
    for (let i = 0; i <= 0xFFFF; i++) {
      ids.push(getId()!);
    }
    expect(() => getId()).toThrowError(new Error("No available ID"));

    releaseId(ids[0]);
    expect(getId()).toEqual(ids[0]);
  });
});
