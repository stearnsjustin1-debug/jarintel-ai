import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Default SEO */}
        <meta name="description" content="AI-powered tools built for law enforcement. Generate performance reviews, crime intelligence briefings, and FTO daily observation reports in minutes." />
        <meta name="keywords" content="law enforcement AI, police performance review, FTO daily observation report, crime intelligence briefing, law enforcement software" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.jarintel.ai" />

        {/* Open Graph */}
        <meta property="og:title" content="JAR Intelligence — AI Tools for Law Enforcement" />
        <meta property="og:description" content="AI-powered tools built for law enforcement. Generate performance reviews, crime intelligence briefings, and FTO daily observation reports in minutes." />
        <meta property="og:image" content="https://www.jarintel.ai/og-image.png" />
        <meta property="og:url" content="https://www.jarintel.ai" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JAR Intelligence — AI Tools for Law Enforcement" />
        <meta name="twitter:description" content="AI-powered tools built for law enforcement. Generate performance reviews, crime intelligence briefings, and FTO daily observation reports in minutes." />
        <meta name="twitter:image" content="https://www.jarintel.ai/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
