import axios, { AxiosResponse } from "axios";
import config from "../config";

export async function getCourse(id: number): Promise<AxiosResponse> {
    return axios.get(`${config.overworldApiUrl}/courses/${id}`);
}