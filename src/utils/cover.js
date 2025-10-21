export const getCoverUrl = (url) => {
  if (!url) return '';
  if (process.env.NODE_ENV === 'development') {
    if (url.includes('y.qq.com')) {
      return url.replace('https://y.qq.com/', '/qq-proxy');
    } else if (url.includes('p3.music.126.net')) {
      return url.replace('http://p3.music.126.net/', '/netease-proxy');
    }
    return url;
  } else {
    return url;
  }
}