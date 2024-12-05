import { Inter, Rubik, Raleway } from 'next/font/google'

import "./globals.css";
import { UserProvider } from "./context/UserContext";
import Header from "@/src/components/Header";
import styles from './Index.module.css'
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Jobs Bored",
  description: "Tools to help you get a job in tech",
};

const inter = Inter({
  subsets: ['latin'],
  variable:'--font-inter',
  display: 'swap',
})
 
const rubik = Rubik({
  subsets: ['latin'],
  variable:'--font-rubik',
  display: 'swap',
})

const raleway = Raleway({
  subsets: ['latin'],
  variable:'--font-raleway',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${rubik.variable} ${raleway.variable}`}>
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_PLACES_KEY}&libraries=places`}
          async
          defer
        />
      </head>
      <body className="bg-background text-foreground">
        <main className={`min-h-screen flex flex-col`}>
          <UserProvider>            
            {children}
          </UserProvider>
        </main>
      </body>
    </html>
  );
}
