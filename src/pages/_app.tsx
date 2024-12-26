import '@mantine/core/styles.css'; // Important for Mantine UI
import type { AppProps } from 'next/app';
import { MantineProvider, createTheme } from '@mantine/core';



const theme = createTheme({
  /** Put your Mantine theme overrides here. */
  primaryColor: 'violet',

});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme='dark' withGlobalStyles withNormalizeCSS>
      <Component {...pageProps} />
    </MantineProvider>
  );
}
