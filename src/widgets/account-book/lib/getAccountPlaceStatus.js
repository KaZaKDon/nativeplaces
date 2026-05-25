const STATUS_LABELS = {
    draft: "Локально добавлено",
    local: "Локально добавлено",
    pending: "На проверке",
    published: "Опубликовано",
};

export function getAccountPlaceStatus(status) {
    return STATUS_LABELS[status] ?? "Локально добавлено";
}