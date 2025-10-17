export const getCoverUrl = (url) => {
  if (!url) return '';
  if (process.env.NODE_ENV === 'development') {
    return url.replace('https://y.qq.com/', '/image-proxy');
  } else {
    return url;
  }
}