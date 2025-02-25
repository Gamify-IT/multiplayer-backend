import axios from "axios";
import { getCourse } from "../clients/course-client";
import { ConnectionData, CourseMember } from "../types";
import { getAvailableId } from "../utils/idGenerator";
import { getPlayer } from "../clients/player-client";

export const courses = new Map<number, Set<CourseMember>>();
export const pendingPlayers = new Map<number, number>();

export const processRequest = async (data: ConnectionData): Promise<{playerId: number}> => {
    if (!data.courseId || !data.playerId) {
        throw new Error("No courseId or playerId found in connection data");
    }
    // check in Overworld Backend if course and player actually do exist
    try {
        await getCourse(data.courseId);
        await getPlayer(data.playerId);
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                console.log("Course or player not found");
                throw new Error("Course or player not found");
            } else {
                console.error("Axios error occurred: ", error);
                throw new Error("Failed to fetch course or player");
            }
        } else {
            console.error("Unexpected error: ", error);
            throw new Error("Unexpected error while checking course");
        }
    }

    // create new course if its the first player
    if (!courses.has(data.courseId)) {
        courses.set(data.courseId, new Set());
    }

    // get unique id generation 
    try {
        const playerId: number = getAvailableId(data.courseId);
        const resData = {playerId};
        pendingPlayers.set(playerId, data.courseId);
        return resData;
    }
    catch (error) {
        console.error("Error while generating player ID: ", error);
        throw new Error("Error while generating player ID");
    }
};