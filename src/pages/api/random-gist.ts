import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { Utils } from '../../utilities/utilities';
import { GistResult } from '../../../types/Gist';

export default async (req: NextApiRequest, res: NextApiResponse<{ gists: GistResult[], correctIndex: number }>) => {
    console.log('do');
    const data = await Utils.fetcher(`https://api.github.com/gists/public?per_page=10&page=${Utils.getRandomNumber()}`);
    console.log(data);
    while (data.length <= 4) {
        console.log('do again');
        const newData = await Utils.fetcher(`https://api.github.com/gists/public?per_page=3&page=${Utils.getRandomNumber()}`);
        data.push(...newData);
        console.log(data);
    }
    const gistObjectArray: GistResult[] = [];
    for (let i = 0; i < data.length; i++) {
        console.log('do again 2');
        const gistJson = data[i];
        const firstFile = gistJson.files[Object.keys(gistJson.files)[0]];
        if (firstFile === undefined) continue;

        const { language } = firstFile;
        if (Utils.isValidLanguage(language)) {
            const gistObject: GistResult = { language: '', content: '' };
            gistObject.content = await Utils.fetcher(firstFile.raw_url);
            gistObject.content = gistObject.content.replaceAll(Utils.C_STYLE_REGEX, '');
            gistObject.language = language;
            gistObjectArray.push(gistObject);
            console.log(gistObjectArray);
            console.log('gistObjectArray.length');
        }
    }

    if (gistObjectArray.length !== 0) {
        console.log('do again 3');
        const correctIndex = Utils.getRandomNumber(0, 3);
        const randomAnswers: GistResult[] = [];
        while (randomAnswers.length !== 4) {
            console.log('do again 4');
            const randomAns = gistObjectArray[Utils.getRandomNumber(0, gistObjectArray.length - 1)];
            if (!randomAnswers.includes(randomAns) && randomAns !== gistObjectArray[correctIndex]) {
                console.log('do again 5');
                randomAnswers.push(randomAns);
            }
        }

        randomAnswers[correctIndex] = gistObjectArray[correctIndex];
        res.status(200).json({ gists: randomAnswers, correctIndex });
    }
    console.log('do again 6');
    res.status(500).end('Not enough gists found');
};
