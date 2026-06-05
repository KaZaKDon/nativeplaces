import { apiClient } from "./apiClient";

export const profileApi = {
    getProfile() {
        return apiClient.get("/profile/index.php");
    },

    updateProfile({ firstName, profileStatus, phone, telegram }) {
        return apiClient.post("/profile/update.php", {
            first_name: firstName,
            profile_status: profileStatus,
            phone,
            telegram,
        });
    },

    uploadAvatar(file) {
        const formData = new FormData();

        formData.append("avatar", file);

        return apiClient.postForm("/profile/avatar.php", formData);
    },
};