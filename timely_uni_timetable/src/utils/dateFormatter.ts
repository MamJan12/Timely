export const formatDate = (
  dateString: string,
  options?: {
    format?: "short" | "long" | "numeric";
    separator?: string;
    capitalizeMonth?: boolean;
  }
): string => {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const day = date.getDate();
  const monthNames = {
    short: [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ],
    long: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  };

  const format = options?.format || "short";
  const separator = options?.separator || " ";
  const capitalizeMonth = options?.capitalizeMonth || false;

  const monthIndex = date.getMonth();
  let month =
    format === "long"
      ? monthNames.long[monthIndex]
      : monthNames.short[monthIndex];

  if (format === "short" && capitalizeMonth) {
    month = month.charAt(0).toUpperCase() + month.slice(1);
  }

  const year = date.getFullYear();

  return `${day}${separator}${month}${separator}${year}`;
};

// Usage examples:
// formatDate("2025-12-09T10:13:20.000000Z") // "9 dec 2025"
// formatDate("2025-12-09T10:13:20.000000Z", { capitalizeMonth: true }) // "9 Dec 2025"
// formatDate("2025-12-09T10:13:20.000000Z", { format: 'long' }) // "9 December 2025"
// formatDate("2025-12-09T10:13:20.000000Z", { separator: '/' }) // "9/dec/2025"
