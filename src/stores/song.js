import { defineStore } from "pinia";

export const useSongStore = defineStore("song", {
  state: () => ({
    songData: {},
    lyricData: {
      author: [],
      lyric: [],
      translatedLyric: [],
    },
    isChanging: false,
  }),
  getters: {
    
  },
  actions: {
    /**
     * 获取歌曲信息
     */
    async fetchSongData() {
      try {
        const res = await fetch('http://localhost:9863/query');
        this.songData = await res.json();
      } catch (error) {
        this.songData = {};
        console.error(error);
      }
    },
    /**
     * 获取歌词信息
     */
    async getLyricData() {
      const authorRegex = /^{.*}$/gm;
      const lyricRegex = /^\[\d+:\d+\.\d+\].*$/gm;
      const lyricRegex2 = /^(\[\d+:\d+\.\d+\])(.*)$/;
      try {
        const res = await fetch("http://localhost:9863/api/lyric");
        const data = await res.json();
        this.lyricData.author = data.lrc?.match(authorRegex)?.map(i => JSON.parse(i)) || [];
        this.lyricData.lyric = data.lrc?.match(lyricRegex)?.map(i => i.match(lyricRegex2)) || [];
        if (data.hasTranslatedLyric) {
          this.lyricData.translatedLyric = data.translatedLyric?.match(lyricRegex)?.map(i => i.match(lyricRegex2)) || [];
        } else {
          this.lyricData.translatedLyric = [];
        }
      } catch (error) {
        this.lyricData = {};
        console.error(error);
      }
    },
    /**
     * 修改歌曲变更状态
     * @param {boolean} status 
     */
    setChangingStatus(status) {
      this.isChanging = status;
    },
    /**
     * 重置歌曲信息
     */
    resetSongData() {
      this.songData = {};
      this.lyricData = {
        author: [],
        lyric: [],
        translatedLyric: [],
      };
    }
  },
});
