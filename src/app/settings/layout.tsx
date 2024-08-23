// layout.tsx
import Script from 'next/script';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section>{children}</section>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_PLACES_KEY}&libraries=places`}
        strategy="afterInteractive"
      />
    </>
  );
}
