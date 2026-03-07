export const formatBirthTime = (timeString: string | undefined | null): string => {
    if (!timeString) return '';

    // Handle ISO datetime strings like "2000-01-01T12:30:00.000Z"
    if (timeString.includes('T')) {
        try {
            // Create a date object. If it's a UTC timezone string, we might want to extract the HH:mm from the Date object 
            // securely or just extract it from the string itself assuming it's already in the correct user localized offset.
            // Usually "2000-01-01T14:30:00.000Z" is UTC, but the backend sends this representing the actual local time 
            // selected by user (e.g. they typed 14:30, backend saved 2000-01-01 14:30:00 UTC).
            // The safest string extraction without timezone shift is splitting.
            const timePart = timeString.split('T')[1];
            const [hour, minute] = timePart.split(':');
            return `${hour}:${minute}`;
        } catch (e) {
            return timeString; // fallback
        }
    }

    // Handle plain time strings like "12:30:00.000" or "12:30"
    try {
        const [hour, minute] = timeString.split(':');
        return `${hour}:${minute}`;
    } catch (e) {
        return timeString; // fallback
    }
};
