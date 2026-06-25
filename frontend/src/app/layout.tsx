import "./globals.css";

export const metadata = {
  title: "Signal Clone",
  description: "End-to-end encrypted messenger clone",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}