import "./globals.css";
import AuthProvider from "./providers/AuthProvider";

export const metadata = {
  title: "ClubMint",
  description: "Monetize your community",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
