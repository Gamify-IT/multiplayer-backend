import axios, { AxiosResponse } from "axios";
import config from "../config";

export async function getCourse(id: number): Promise<AxiosResponse> {
    console.log("checking course: " + `${config.overworldApiUrl}/courses/${id}`);
    return axios.get(`${config.overworldApiUrl}/courses/${id}`);
}