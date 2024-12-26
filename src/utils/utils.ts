import axios, { AxiosResponse } from 'axios';
import { Gist, GistFetched, GistFile } from '../../types/Gist';

export const Utils = {
  IGNORED_LANGUAGES: [
    'markdown',
    'json',
    'text',
    'ignore list',
    'xml',
    'jupyter notebook',
    'csv',
    'maven pom',
    'yaml',
    'autohotkey',
    'tsv',
    'restructuredtext',
    'vcl',
    'diff',
    'tex',
    'toml',
    'windows registry entries',
    'svg',
    'ballerina',
    'org',
  ],

  // Basic fetcher using axios
  fetcher: async (url: string) => {
    const res: AxiosResponse = await axios.get(url);
    return res.data;
  },

  // Validate if language is not in the ignored list
  isValidLanguage: (language: string): boolean => {
    if (!language) return false;
    return !Utils.IGNORED_LANGUAGES.includes(language.trim().toLowerCase());
  },

  // Shuffle an array in place
  shuffle: <T>(array: T[]): T[] => {
    let currentIndex = array.length;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  },

  // Get random number in a certain range
  getRandomNumber: (min: number = 1, max: number = 30): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Filter out gists that do not meet the criteria
  filterGists: (gists: Gist[]): GistFetched[] => {
    return gists
      .map((gist) => {
        const fileKeys = Object.keys(gist.files);
        const firstFileKey = fileKeys[0];
        if (!firstFileKey) return null;

        const file: GistFile = gist.files[firstFileKey];
        if (!file || !file.language) return null;

        const language = file.language.trim().toLowerCase();
        if (!Utils.isValidLanguage(language)) return null;

        return {
          ...gist,
          content: '',
          language,
        };
      })
      .filter(Boolean) as GistFetched[];
  },

  // Get random page of public gists from GitHub
  getGists: async (): Promise<Gist[]> => {
    const page = Utils.getRandomNumber(1, 30);
    // Attempt to fetch 100 gists. GitHub allows up to 100 per page.
    const url = `https://api.github.com/gists/public?per_page=100&page=${page}`;
    const data: Gist[] = await Utils.fetcher(url);
    return data;
  },

  // Fetch the raw content of the first file in the gist
  fetchGistContent: async (gist: GistFetched): Promise<string> => {
    // We'll always fetch the first file's content
    const firstFile = gist.files[Object.keys(gist.files)[0]];
    const rawContent = await axios.get(firstFile.raw_url);
    return rawContent.data || '';
  },
};
