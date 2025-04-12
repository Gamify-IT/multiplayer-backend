import axios, { AxiosResponse } from "axios";
import config from "../config";

/**
 * Fetches a player by its ID from the overworld backend.
 * @param id the ID of the course to fetch
 * @param accessToken passed access token
 */
export async function getPlayer(id: string, accessToken: string): Promise<AxiosResponse> {
    return axios.get(`${config.overworldApiUrl}/players/${id}`, {
        headers:  {
            Cookie: `access_token=${accessToken}`,
        }
    });
}