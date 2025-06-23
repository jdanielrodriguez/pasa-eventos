import { truncate } from '../../../middlewares/errorHandler.middleware';

describe('truncate', () => {
  it('should return the same string if below the limit', () => {
    const str = 'Hello world';
    expect(truncate(str, 20)).toBe('Hello world');
  });

  it('should truncate a long string and append ...', () => {
    const str = 'a'.repeat(1000);
    expect(truncate(str, 10)).toBe('aaaaaaaaaa...');
  });

  it('should stringify and truncate objects', () => {
    const obj = { foo: 'bar', baz: [1, 2, 3] };
    const result = truncate(obj, 100);
    expect(typeof result).toBe('string');
    expect(result).toContain('foo');
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('should return truncated string for object with long JSON', () => {
    const obj = { foo: 'a'.repeat(200) };
    const result = truncate(obj, 50);
    expect(typeof result).toBe('string');
    expect(result.startsWith('{"foo":"')).toBe(true);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should handle null and undefined gracefully', () => {
    expect(truncate(null, 10)).toBe('null');
    expect(truncate(undefined, 10)).toBe('undefined');
  });

  it('should not throw if object is not serializable', () => {
    const circular: Record<string, unknown> = {};
    (circular as Record<string, unknown>)['self'] = circular;
    expect(typeof truncate(circular, 50)).toBe('string');
  });

  it('should handle numbers and booleans', () => {
    expect(truncate(12345, 10)).toBe('12345');
    expect(truncate(true, 10)).toBe('true');
    expect(truncate(false, 10)).toBe('false');
  });
});
