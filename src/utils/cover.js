export const getCoverUrl = (url) => {
  if (!url) return '';
  if (url.includes('y.qq.com')) {
    return url.replace('https://y.qq.com/', '/qq-proxy/');
  } else if (url.includes('p3.music.126.net')) {
    return url.replace('http://p3.music.126.net/', '/netease-proxy/');
  } else if (url.includes('imge.kugou.com')) {
    return url.replace('http://imge.kugou.com/', '/kugou-proxy/');
  } else if (url.includes('img2.kuwo.cn')) {
    return url.replace('https://img2.kuwo.cn/', '/kuwo-proxy/');
  } else if (url.includes('p1.music.126.net')) {
    return url.replace('https://p1.music.126.net/', '/p1-proxy/');
  } else if (url.includes('p2.music.126.net')) {
    return url.replace('https://p2.music.126.net/', '/p2-proxy/');
  }
  return url;
}