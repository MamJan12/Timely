export const generateDeviceUUID = (): string => {
  const storedUuid = localStorage.getItem("device_uuid");
  if (storedUuid) return storedUuid;

  // Generate a simple UUID v4
  const newUuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );

  return newUuid;
};

export const getDeviceName = (): string => {
  const userAgent = navigator.userAgent;

  // Simple device detection
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return /iPhone/.test(userAgent)
      ? "iPhone"
      : /iPad/.test(userAgent)
      ? "iPad"
      : "iPod";
  }
  if (/Android/.test(userAgent)) return "Android Device";
  if (/Windows/.test(userAgent)) return "Windows PC";
  if (/Mac/.test(userAgent)) return "Mac";
  if (/Linux/.test(userAgent)) return "Linux PC";

  return "Web Browser";
};

export const getDevicePlatform = (): string => {
  const userAgent = navigator.userAgent;

  if (/iPhone|iPad|iPod/.test(userAgent)) return "iOS";
  if (/Android/.test(userAgent)) return "Android";
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Mac/.test(userAgent)) return "MacOS";
  if (/Linux/.test(userAgent)) return "Linux";

  return "Web";
};
