import { apiClient } from "./apiClient";
import { getMediaUrl } from "./mediaUrl";

function mapMyPlaceFromApi(place) {
    return {
        id: place.id,
        title: place.title,
        slug: place.slug,
        description: place.short_description || "",
        shortDescription: place.short_description || "",
        image: getMediaUrl(place.cover_image),
        categoryTitle: place.category_title || "Без категории",
        categorySlug: place.category_code || "",
        typeTitle: place.type_title || "",
        typeSlug: place.type_code || "",
        address: place.address || "",
        status: place.status || "",
        publicationType: place.publication_type || "",
        isCommercial: Boolean(Number(place.is_commercial)),
        bookingType: place.booking_type || "",
        position:
            place.latitude && place.longitude
                ? [Number(place.latitude), Number(place.longitude)]
                : null,
        createdAt: place.created_at || "",
        updatedAt: place.updated_at || "",
    };
}

export const myPlacesApi = {
    async getMyPlaces() {
        const data = await apiClient.get("/my-places/index.php");

        return {
            places: Array.isArray(data.places)
                ? data.places.map(mapMyPlaceFromApi)
                : [],
        };
    },

    async createMyPlace({ title, categoryId, placeTypeId }) {
        return apiClient.post("/my-places/create.php", {
            title,
            category_id: categoryId,
            place_type_id: placeTypeId,
        });
    },

    async updateMyPlace({
        id,
        title,
        shortDescription,
        fullDescription,
        address,
        latitude,
        longitude,
        contactName,
        phone,
        telegram,
        email,
        website,
        bookingType,
        bookingUrl,
    }) {
        return apiClient.post("/my-places/update.php", {
            id,
            title,
            short_description: shortDescription,
            full_description: fullDescription,
            address,
            latitude,
            longitude,
            contact_name: contactName,
            phone,
            telegram,
            email,
            website,
            booking_type: bookingType,
            booking_url: bookingUrl,
        });
    },

    async deleteMyPlace(placeId) {
        return apiClient.post("/my-places/delete.php", {
            place_id: placeId,
        });
    },
};