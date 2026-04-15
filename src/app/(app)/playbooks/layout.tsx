export default function PlaybooksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-6 max-w-7xl">
      {children}
    </div>
  );
}
