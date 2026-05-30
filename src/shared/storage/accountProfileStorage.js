const ACCOUNT_PROFILE_KEY = "nativeplaces-account-profile";

const defaultProfile = {
    name: "Исследователь",
    status: "Дневник родных мест",
    avatar: "",
};

export function getAccountProfile() {
    try {
        const rawValue = localStorage.getItem(ACCOUNT_PROFILE_KEY);

        if (!rawValue) {
            return defaultProfile;
        }

        return {
            ...defaultProfile,
            ...JSON.parse(rawValue),
        };
    } catch {
        return defaultProfile;
    }
}

export function saveAccountProfile(profile) {
    const updatedProfile = {
        ...defaultProfile,
        ...profile,
    };

    localStorage.setItem(ACCOUNT_PROFILE_KEY, JSON.stringify(updatedProfile));

    return updatedProfile;
}