import axios from "axios";
import { getCourse } from "../clients/course-client";
import { ConnectionData } from "../types";
import { getId } from "../utils/idGenerator";
import { getPlayer } from "../clients/player-client";
import { courses, knownClients, pendingClients } from "../data/data";

/**
 * Processes a connection request from a client.
 * @param data received client data
 * @returns course-unique id
 */
export const processRequest = async (data: ConnectionData): Promise<{ clientId: number }> => {
    const courseId = data.courseId;
    const playerId = data.playerId;
    const clientId = data.clientId !== undefined || data.clientId !== 0 ? Number(data.clientId) : undefined;

    if (!courseId || !playerId) {
        throw new Error("No course id or player id found in connection data");
    }
    // check if course and player actually do exist
    try {
        await getCourse(courseId);
        await getPlayer(playerId);
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error("Course or player not found");
            } else {
                throw new Error("Failed to fetch course or player" + error);
            }
        } else {
            throw new Error("Unexpected error while checking course");
        }
    }

    // create new course if its the first player
    if (!courses.has(courseId)) {
        courses.set(courseId, new Set());
    }

    // reconnection of already known client
    if (clientId !== undefined && knownClients.has(clientId)) {
        return { clientId: clientId }
    }
    // unknown client
    else {
        // generate unique client id
        try {
            const id = getId();
            pendingClients.set(id, courseId);
            knownClients.set(id, courseId);
            return { clientId: id };
        }
        catch (error) {
            throw new Error("Error while generating unique id");
        }
    }
};