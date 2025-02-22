import axios, { AxiosResponse } from "axios";
import config from "../config";

export async function getPlayer(id: string): Promise<AxiosResponse> {
    console.log("checking player: " + `${config.overworldApiUrl}/players/${id}`);
    return axios.get(`${config.overworldApiUrl}/players/${id}`);
}