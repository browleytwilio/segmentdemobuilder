export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 max-w-4xl">
      {children}
    </div>
  );
}
