import "../styles/globals.css";
import type {
  AppContext,
  AppInitialProps,
  AppLayoutProps,
  AppProps,
} from "next/app";
import { NextComponentType } from "next";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

const MyApp: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) => {
  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {getLayout(<Component {...pageProps} />)}
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default MyApp;
