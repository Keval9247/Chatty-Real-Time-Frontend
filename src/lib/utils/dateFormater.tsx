export const formatintoDDMMYYY = (dateString: Date) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).padStart(4, '0')

    return `${day}-${month}-${year}`;
}

export function formatMessageTime(date: Date) {
    const newData = new Date(date)
    const hours = String(newData.getHours()).padStart(2, "0");
    const minutes = String(newData.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;

}