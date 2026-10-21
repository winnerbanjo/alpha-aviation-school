import type { AxiosError } from "axios";

/** Body of the API's JSON error responses. */
export interface ApiErrorBody {
  message?: string;
  [key: string]: unknown;
}

/**
 * Reads a caught value as an Axios error so its fields can be accessed with
 * types instead of `any`. Every field is optional, so call sites keep using
 * optional chaining and stay safe when the value is a plain Error.
 */
export const asApiError = (error: unknown) => error as Partial<AxiosError<ApiErrorBody>>;
