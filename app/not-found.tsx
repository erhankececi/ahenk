import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-extrabold tracking-tight">404</p>
      <p className="mt-3 text-lg text-muted">Aradığın sayfa bulunamadı.</p>
      <p className="text-sm text-muted">The page you are looking for could not be found.</p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:opacity-90"
      >
        Ana sayfa / Home
      </Link>
    </div>
  );
}
