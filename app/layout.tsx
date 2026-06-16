import type { Metadata } from "next";
import { Castoro, Mulish } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

// Meta (Facebook) Pixel — hardcoded per client request.
const META_PIXEL_ID = "1309943261329384";

const castoro = Castoro({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-castoro",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Is Endolift right for you? · MEDfacials, Truro",
  description:
    "A 60-second suitability guide for Endolift — Cornwall's certified non-surgical skin-tightening treatment with Dr Joe Stolte at MEDfacials, Truro.",
  openGraph: {
    title: "Discover if Endolift is right for you · MEDfacials",
    description:
      "Take the 60-second Endolift suitability analysis with Cornwall's only certified Endolift provider.",
    url: SITE_URL,
    siteName: "MEDfacials",
    locale: "en_GB",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${castoro.variable} ${mulish.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Meta Pixel base code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
