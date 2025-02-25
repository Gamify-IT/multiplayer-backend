import { getAvailableId, releaseId, courses } from "../src/utils/idGenerator";

describe('Player ID generation', () => {
  
  beforeEach(() => {
    courses.clear();
  });

  test('Unique ID per course', () => {
    const courseId = 1;

    const id1 = getAvailableId(courseId);
    const id2 = getAvailableId(courseId);

    expect(id1).not.toBe(id2);
  });

  test('Reuse of released ID ', () => {
    const courseId = 1;
    
    const id1 = getAvailableId(courseId);
    releaseId(courseId, id1);
    
    const id2 = getAvailableId(courseId);
    expect(id2).toBe(id1);
  });

  test('Error if all IDs are in use', () => {
    const courseId = 1;

    for (let i = 0; i < 256; i++) {
      getAvailableId(courseId);
    }

    expect(() => getAvailableId(courseId)).toThrowError(`No available IDs in course ${courseId}`);
  });

  test('no changes if same id is released multiple times', () => {
    const courseId = 1;
    const id1 = getAvailableId(courseId);

    releaseId(courseId, id1);
    releaseId(courseId, id1);

    const id2 = getAvailableId(courseId);
    expect(id2).toBe(id1);
  });
});
