import React, { useState } from 'react';
import Head from 'next/head';
import type {AppProps} from 'next/app';
import {CssBaseline, ThemeProvider} from '@mui/material';
import theme from '../lib/theme';
import type {EmotionCache} from "@emotion/cache";
import createEmotionCache from '../lib/create-emotion-cache';
import {CacheProvider} from '@emotion/react';
import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/router';
import { AuthProvider } from '../utils/AuthContext';

const clientSideEmotionCache = createEmotionCache();

type MyAppProps = AppProps & {
    emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
    const {Component, pageProps, emotionCache = clientSideEmotionCache} = props;
    // const router = useRouter();
    // const showSidebar = router.pathname !== '/login' && router.pathname !== '/register';

    return (
        <CacheProvider value={emotionCache}>
            <Head>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
            </Head>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <AuthProvider>
                    <Component {...pageProps} />
                </AuthProvider>
            </ThemeProvider>
        </CacheProvider>
    )
}
