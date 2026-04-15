export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {children}
    </div>
  );
}
