import type { AxiosRequestConfig } from 'axios'
import { httpClient } from './http-client'

/** Returns the JSON body as-is: the backend does not wrap responses in an envelope. */
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await httpClient.request<T>(config)
  return response.data
}

export const apiRequestVoid = async (config: AxiosRequestConfig): Promise<void> => {
  await httpClient.request(config)
}

/** For endpoints whose meaning depends on the status code (e.g. join: 200 vs 202). */
export const apiRequestWithStatus = async <T>(config: AxiosRequestConfig) => {
  const response = await httpClient.request<T>(config)
  return { data: response.data, status: response.status }
}
