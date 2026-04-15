export default function PlaybooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 max-w-6xl">
      {children}
    </div>
  );
}
