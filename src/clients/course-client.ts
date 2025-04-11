import axios, { AxiosResponse } from "axios";
import config from "../config";

//axios.defaults.withCredentials = true;

export async function getCourse(id: number): Promise<AxiosResponse> {
    console.log(`${config.overworldApiUrl}/courses/${id}`);
    return axios.get(`${config.overworldApiUrl}/courses/${id}`);
}