export const getCoverUrl = (url) => {
  if (!url) return "";
  return process.env.NODE_ENV === "production" ? url.replace("https://y.qq.com", "https://qq-img-proxy.2381835193.workers.dev") : url.replace("https://y.qq.com", "/image");
};
