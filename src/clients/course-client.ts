import axios, { AxiosResponse } from "axios";
import config from "../config";

/**
 * Fetches a course by its ID from the overworld backend.
 * @param id the ID of the course to fetch
 * @param accessToken passed access token
 */
export async function getCourse(id: number, accessToken: string): Promise<AxiosResponse> {
    return axios.get(`${config.overworldApiUrl}/courses/${id}`, {
        headers:  {
            Cookie: `access_token=${accessToken}`,
        }
    });
}