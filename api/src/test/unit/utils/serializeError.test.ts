import { serializeError } from '../../../middlewares/errorHandler.middleware';

describe('serializeError', () => {
  it('should serialize a standard Error object', () => {
    const error = new Error('Oops!');
    const result = serializeError(error);
    expect(result).toMatchObject({
      name: 'Error',
      message: 'Oops!',
      stack: expect.any(String),
    });
  });

  it('should serialize a custom error with extra properties', () => {
    class CustomError extends Error {
      status: number;
      constructor(message: string, status: number) {
        super(message);
        this.status = status;
      }
    }
    const customError = new CustomError('Custom!', 418);
    const result = serializeError(customError);
    expect(result).toMatchObject({
      name: 'Error',
      message: 'Custom!',
      stack: expect.any(String),
      status: 418,
    });
  });

  it('should serialize a plain object', () => {
    const obj = { foo: 'bar', baz: 42 };
    const result = serializeError(obj);
    expect(result).toEqual({ foo: 'bar', baz: 42 });
  });

  it('should serialize a primitive value', () => {
    const result = serializeError(1234);
    expect(result).toEqual({ message: '1234' });
  });

  it('should serialize null', () => {
    const result = serializeError(null);
    expect(result).toEqual({ message: 'null' });
  });

  it('should serialize undefined', () => {
    const result = serializeError(undefined);
    expect(result).toEqual({ message: 'undefined' });
  });

  it('should serialize a symbol', () => {
    const sym = Symbol('s');
    const result = serializeError(sym);
    expect(result).toEqual({ message: sym.toString() });
  });
});
