import axios, { AxiosResponse } from "axios";
import config from "../config";

//axios.defaults.withCredentials = true;

export async function getPlayer(id: string): Promise<AxiosResponse> {
    console.log(`${config.overworldApiUrl}/players/${id}`);
    return axios.get(`${config.overworldApiUrl}/players/${id}`);
}