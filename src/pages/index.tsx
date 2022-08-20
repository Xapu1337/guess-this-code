import {
    Title,
    Text,
    Anchor,
    Container,
    Paper,
    Code,
    Button,
    Group,
    LoadingOverlay,
    createStyles,
    useMantineColorScheme, useMantineTheme, Center, Space, Divider,
} from '@mantine/core';
import { AppInitialProps } from 'next/app';
import { Prism } from '@mantine/prism';
import { useEffect, useState } from 'react';
import { randomUUID } from 'crypto';
import useSWRImmutable from 'swr/immutable';
import axios from 'axios';
import { mutate } from 'swr';
import { Gist, GistResult } from '../../types/Gist';
import { Utils } from '../utilities/utilities';

const useStyles = createStyles((theme) => ({
    wrapper: {
        margin: 'auto',
        width: '50%',
    },

    languageButtons: {
        ' & > *': {
            margin: theme.spacing.md,
        },
    },
}));

const fetcher = (url: string) => axios.get(url).then(res => res.data);
export default function Index() {
    const { classes } = useStyles();

    const { data, error, mutate } = useSWRImmutable<{ gists: GistResult[], correctIndex: number }>('/api/random-gist', fetcher);
    if (error) {
        return (
            <Center sx={{ height: '100vh' }}>
                <Text color="red" weight="bolder" sx={{ fontSize: '3rem' }}> ERROR! </Text>
                <Space />
                <Text variant="text">
                    We couldn't fetch the data... please again (if error persists try later, you likely got rate limited)!
                </Text>
            </Center>
        );
    }
    if (!data) return <p>Loading...</p>;

    const getButtons = data.gists.map(
        (value, index) => (
            <Button key={`${value.language}--${index}`}>
                {value.language}
            </Button>
        )
    );
    return (
        <>
            <Center>
                <Container className={classes.wrapper}>
                    <Paper
                      radius="md"
                      withBorder
                      p="lg"
                      sx={(theme) => ({
                            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
                            height: '75%',
                        })}
                    >
                        <Prism m="xl" language="tsx" noCopy>
                            { data.gists[data.correctIndex].content.replaceAll(Utils.C_STYLE_REGEX, '')}
                        </Prism>
                        <Group position="center" spacing="xl" grow className={classes.languageButtons}>
                            { getButtons }
                        </Group>
                        <Divider m="xl" />
                        <Center m="xl">
                            <Button onClick={() => mutate()}>
                                Refresh
                            </Button>
                        </Center>
                    </Paper>
                </Container>
            </Center>
        </>
    );
}

// export async function getServerSideProps() {
//     const res = await fetch(`https://api.github.com/gists/public?page=${Utils.getRandomNumber()}`, { headers: { Authorization: 'token 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' } });
//     console.log(res);
//     const json: Gist[] = await res.json();
//
//     const randomGists = await Utils.getRandomGist(json);
//     if (!randomGists?.originalGists || !Array.isArray(randomGists.filteredGists)) return { notFound: true };
//
//     const gistObjects = {
//         originalGists: await randomGists.originalGists,
//         fillerGists: randomGists.filteredGists.splice(1, 3),
//     };
//
//     // If gistObjects.fillerGists.length !== 3, then we need to fetch more gists. or if one is the same as the original gist, then we need to fetch more gists.
//     if (gistObjects.originalGists == null || gistObjects.fillerGists.length !== 3) {
//         console.log(gistObjects.originalGists == null, gistObjects.fillerGists.length !== 3, await randomGists.filteredGists.length);
//         // if (Utils.fetchCount <= 5) {
//         //     await getServerSideProps();
//         //     // eslint-disable-next-line no-plusplus
//         //     Utils.fetchCount++;
//         // }
//     } else {
//         Utils.fetchCount = 0;
//     }
//     return { props: { ...randomGists } };
// }
