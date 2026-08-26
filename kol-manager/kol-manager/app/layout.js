import "./globals.css";

export const metadata = {
  title: "KOL Manager",
  description: "Database KOL, rate card, pipeline, dan performa campaign.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
