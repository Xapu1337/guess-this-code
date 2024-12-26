import { useEffect, useRef, useState } from 'react';
import { Prism } from '@mantine/prism';
import {
  Button,
  Container,
  LoadingOverlay,
  Text,
  Title,
  Group,
  Stack,
  Alert,
  Transition,
} from '@mantine/core';
import { GistFetched } from '../../types/Gist';
import { Utils } from '../utils/utils';
import ErrorSection from '../components/ErrorSection';

const LOADING_MESSAGES = [
  'Fetching something interesting...',
  'Scouring GitHub for random Gists...',
  'Hang on, rummaging through Gists...',
  'One moment, preparing your puzzle...'
];

const CORRECT_FEEDBACK = [
  'Great job!',
  'You nailed it!',
  'Spot on!',
  'You’re unstoppable!',
  'Correct!',
];

const WRONG_FEEDBACK = [
  'Oops, not quite.',
  'Wrong guess!',
  'Oh no!',
  'Better luck next time.',
];

export default function HomePage() {
  const [gist, setGist] = useState<GistFetched | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; stack?: string } | null>(null);

  // Gameplay states
  const [score, setScore] = useState<number>(0);
  const [timer, setTimer] = useState<number>(30);
  const [lives, setLives] = useState<number>(3);
  const [streak, setStreak] = useState<number>(0);

  // Simple message feedback for correct/wrong guesses
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // For variety, randomly pick a loading message each time
  const [loadingMessage, setLoadingMessage] = useState<string>(
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  );

  // On mount, fetch our first gist
  useEffect(() => {
    fetchNewGist();
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer side effect
  useEffect(() => {
    if (!loading && gist) {
      // If we have a gist loaded, start/restart the timer
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimer(30);

      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Time's up: you lose a life, reset streak
            showFeedback(false);
            setLives((lv) => Math.max(lv - 1, 0));
            setStreak(0);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // fetch next gist automatically
            fetchNewGist();
            return 30; // reset the timer
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [loading, gist]);

  /**
   * Show a quick feedback message
   */
  function showFeedback(isCorrect: boolean) {
    const messagePool = isCorrect ? CORRECT_FEEDBACK : WRONG_FEEDBACK;
    const randomMsg = messagePool[Math.floor(Math.random() * messagePool.length)];
    setFeedbackMessage(randomMsg);
    setFeedbackType(isCorrect ? 'success' : 'error');

    // Hide after 1.5s
    setTimeout(() => {
      setFeedbackMessage(null);
      setFeedbackType(null);
    }, 1500);
  }

  /**
   * Attempt to fetch new Gists from GitHub
   */
  async function fetchNewGist(retryCount = 0): Promise<void> {
    setLoading(true);
    setLoadingMessage(
      LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
    );
    try {
      const gists = await Utils.getGists();
      // Filter out unwanted or invalid gists
      const validGists = Utils.filterGists(gists);

      // If after filtering we don't have enough gists, let's try again
      if (validGists.length < 6) {
        if (retryCount < 5) {
          // retry up to 5 times
          return fetchNewGist(retryCount + 1);
        }
        // If we still can’t get enough, show error
        throw new Error('Not enough valid Gists found after multiple retries.');
      }

      // We pick a random number of languages from 4–6
      const numberOfAnswers = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6

      const uniqueLanguages = Array.from(new Set(validGists.map((g) => g.language)));
      // Filter empty
      const filteredLanguages = uniqueLanguages.filter((lang) => lang !== '');
      if (filteredLanguages.length < numberOfAnswers) {
        if (retryCount < 5) {
          return fetchNewGist(retryCount + 1);
        }
        throw new Error('Not enough unique languages found.');
      }

      // Shuffle them and pick e.g. 4–6
      const selectedLangs = Utils.shuffle(filteredLanguages).slice(0, numberOfAnswers);

      // Find gists matching those languages
      const filteredForTheseLangs = validGists.filter((g) =>
        selectedLangs.includes(g.language)
      );

      // Pick a random gist among the filtered
      const finalGist =
        filteredForTheseLangs[Math.floor(Math.random() * filteredForTheseLangs.length)];

      // Now fetch its content
      const content = await Utils.fetchGistContent(finalGist);
      finalGist.content = content || 'No content found.';

      setGist(finalGist);
      setOptions(selectedLangs);
      setError(null);
    } catch (err: any) {
      // Common errors: 403 or 422
      // We can handle them by re-calling fetchNewGist() with a new random page
      if (err?.response?.status === 403 || err?.response?.status === 422) {
        if (retryCount < 5) {
          return fetchNewGist(retryCount + 1);
        }
      }
      console.error(err);
      setError({
        message: err?.message || 'Unknown error occurred',
        stack: err?.stack,
      });
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle user guess
   */
  function handleGuess(language: string) {
    if (!gist) return;

    // If correct
    if (language === gist.language) {
      // Score formula: leftover time * (streak + 1)
      // This ensures that each correct guess is more valuable if your streak is high
      showFeedback(true);
      setStreak((prev) => prev + 1);
      setScore((prev) => prev + timer * (streak + 1));
    } else {
      // Incorrect guess -> lose 1 life, reset streak
      showFeedback(false);
      setLives((prev) => Math.max(prev - 1, 0));
      setStreak(0);
    }

    // If we still have lives left, load a new gist
    if (lives > 1) {
      fetchNewGist();
    }
  }

  /**
   * Reset the entire game state
   */
  function handleReset() {
    // Full reset
    setScore(0);
    setStreak(0);
    setLives(3);
    fetchNewGist();
  }

  // If we encountered a fatal error, show the error overlay / dev mode screen
  if (error) {
    return <ErrorSection error={error} />;
  }

  // If lives are exhausted, show Game Over
  if (lives <= 0) {
    return (
      <Container>
        <Title order={1} p="center" mt="xl">
          Game Over
        </Title>
        <Text p="center" mt="md">
          Your final score was: <strong>{score}</strong>
        </Text>
        <Container mt="md" style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={handleReset}>Play Again</Button>
        </Container>
      </Container>
    );
  }

  return (
    <Container>
      {loading && (
        <>
          <LoadingOverlay visible />
          <Text p="center" mt="lg" w={500}>
            {loadingMessage}
          </Text>
        </>
      )}
      {!loading && gist && (
        <Stack mt="xl">
          {/* Show feedback alert */}
          <Transition
            mounted={!!feedbackMessage}
            transition="pop-top-right"
            duration={300}
            timingFunction="ease"
          >
            {(styles) => (
              <Alert
                style={{ ...styles, width: 'fit-content', margin: '0 auto' }}
                title={feedbackType === 'success' ? 'Correct!' : 'Wrong!'}
                color={feedbackType === 'success' ? 'green' : 'red'}
                variant="filled"
              >
                {feedbackMessage}
              </Alert>
            )}
          </Transition>

          <Group p="center">
            <Title order={2}>Guess the Language</Title>
          </Group>
          <Group p="center">
            <Text>Score: {score}</Text>
            <Text>Lives: {lives}</Text>
            <Text>Streak: {streak}</Text>
            <Text>Time Left: {timer}s</Text>
          </Group>

          <Group p="center" mt="md">
            {options.map((lang) => (
              <Button key={lang} onClick={() => handleGuess(lang)}>
                {lang}
              </Button>
            ))}
          </Group>

          <Container mt="lg">
            <Prism language="tsx" withLineNumbers style={{ margin: 'auto' }} color="dark" bg="dark">
              {gist.content}
            </Prism>
          </Container>

          <Container mt="lg" style={{ textAlign: 'center' }}>
            <Button variant="outline" color="red" onClick={handleReset}>
              Reset Game
            </Button>
          </Container>
        </Stack>
      )}
    </Container>
  );
}
