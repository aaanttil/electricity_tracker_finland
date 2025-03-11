import '../styles/globals.css'; // Import global styles
import Navbar from '../components/Layout'; // Navbar for all pages
import Script from 'next/script'; // Import Script for Google Analytics


function MyApp({ Component, pageProps }) {
  const measurementId = process.env.NEXT_PUBLIC_MEASUREMENT_ID; // Read the tracking ID from the environment variable

  return (
    <>
      {/* Google Analytics */}
      {measurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}');
            `}
          </Script>
        </>
      )}

      <Navbar />
      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default MyApp;
