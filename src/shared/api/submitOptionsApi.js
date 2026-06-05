import { apiClient } from "./apiClient";

export const submitOptionsApi = {
    getCreateOptions() {
        return apiClient.get("/places/create-options.php");
    },
};