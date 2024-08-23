import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import Header from "@/src/components/Header";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Jobs Bored",
  description: "Tools to help you get a job in tech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center">
          <UserProvider>
            <Header />
            {children}
          </UserProvider>
        </main>
      </body>
    </html>
  );
}
