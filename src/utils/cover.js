export const getCoverUrl = (url) => {
  if (!url) return "";
  return process.env.NODE_ENV === "production" ? url : url.replace("https://y.qq.com", "/image");
};
