export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[480px] flex-col justify-center px-4 py-14 sm:px-6">
      {children}
    </main>
  );
}
