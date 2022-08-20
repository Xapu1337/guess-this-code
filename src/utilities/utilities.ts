import axios from 'axios';
import { Gist, GistResult } from '../../types/Gist';

export const Utils = {
    fetcher: (url: string) => axios.get(url).then(res => res.data),
    fetchCount: 0,
    C_STYLE_REGEX: /\/\*[\s\S]*?\*\/|\/\/.*/mg,
    IGNORED_LANGUAGES: [
    'Markdown',
    'JSON',
    'Text',
    'Ignore List',
    'XML',
    'Jupyter Notebook',
    'CSV',
    'Maven POM',
    'YAML',
    'AutoHotkey',
    'TSV',
    'reStructuredText',
    'VCL',
    'Diff',
    'TeX',
    'TOML',
    'Windows Registry Entries',
    'SVG',
    'Ballerina',
    'Org',
    ],
    filterGists: async (gists: Gist[]) => {
        const gistObjectArray: GistResult[] = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < gists.length; i++) {
            const gistJson = gists[i];
            const firstFile = gistJson.files[Object.keys(gistJson.files)[0]];
            // eslint-disable-next-line no-continue
            if (firstFile === undefined) continue;

            const { language } = firstFile;
            if (Utils.isValidLanguage(language)) {
                const gistObject: GistResult = { language: '', content: '' };
                // eslint-disable-next-line no-await-in-loop
                gistObject.content = await Utils.fetcher(firstFile.raw_url);
                gistObject.content = gistObject.content.replaceAll(Utils.C_STYLE_REGEX, '');
                gistObject.language = language;
                gistObjectArray.push(gistObject);
            }
        }

        if (gistObjectArray.length !== 0) {
            return gistObjectArray;
        }
        return null;
    },

    isValidLanguage: (language: string) => {
        if (!language) return false;

        return !Utils.IGNORED_LANGUAGES.includes(language);
    },

    getRandomNumber: (min: number = 0, max: number = 100) => Math.floor(Math.random() * (max - min + 1)) + min,

    getGists: async (): Promise<Gist[]> => new Promise(async (resolve, reject) => {
        const data = await Utils.fetcher(`https://api.github.com/gists/public?per_page=10&page=${Utils.getRandomNumber()}`);
        while (data.length <= 4) {
            const newData = await Utils.fetcher(`https://api.github.com/gists/public?per_page=3&page=${Utils.getRandomNumber()}`);
            data.push(...newData);
        }
        resolve(data);
    }),

    getRandomGist: async (gists?: Gist[]): Promise<Promise<{ gists: GistResult[], correctIndex: number }> | string> => {
        const convertedGists = await Utils.filterGists(gists ?? await Utils.getGists());
        if (convertedGists === null || convertedGists.length === 0 || convertedGists.length < 3) {
            console.log(convertedGists);
            return 'Not enough gists found';
        }
        const randomGist = convertedGists[Utils.getRandomNumber(0, convertedGists.length - 1)];
        const randomAnswers: GistResult[] = [];
        while (randomAnswers.length !== 4) {
            const randomAns = convertedGists[Utils.getRandomNumber(0, convertedGists.length - 1)];
            if (!randomAnswers.includes(randomAns) && randomAns !== randomGist) {
                randomAnswers.push(randomAns);
            }
        }

        randomAnswers[Utils.getRandomNumber(0, 3)] = randomGist;

        return { gists: randomAnswers, correctIndex: randomAnswers.indexOf(randomGist) };
    },
};
