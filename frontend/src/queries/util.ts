import { ServiceErrorCode } from '@lentovaraukset/shared/src';

export class ApiError extends Error {
  response: Response;

  constructor(response: Response) {
    super(`API call to ${response.url} failed with status code ${response.status}`);
    this.name = this.constructor.name;

    this.response = response;
    // https://github.com/microsoft/TypeScript/issues/13965
    // https://stackoverflow.com/questions/31626231/custom-error-class-in-typescript
    // instanceof not working fix:
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const errorIfNotOk = (response: Response): void => {
  if (response.ok) { return; }
  throw new ApiError(response);
};

export const isErrorForCode = async (
  err: unknown,
  code: ServiceErrorCode,
): Promise<boolean> => (err instanceof ApiError)
  && (await err.response.clone().json())?.error?.code === code;
