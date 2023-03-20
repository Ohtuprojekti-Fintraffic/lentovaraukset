export class ApiError extends Error {
  constructor(response: Response) {
    super(`API call to ${response.url} failed with status code ${response.status}`);
    this.name = this.constructor.name;
  }
}

export const errorIfNotOk = (response: Response): void => {
  if (response.ok) {
    return;
  }
  throw new ApiError(response);
};
