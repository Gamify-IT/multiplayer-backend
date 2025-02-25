import axios, { AxiosResponse } from "axios";
import config from "../config";

export async function getPlayer(id: string): Promise<AxiosResponse> {
    return axios.get(`${config.overworldApiUrl}/players/${id}`);
}