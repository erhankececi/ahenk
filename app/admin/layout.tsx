export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-dvh max-w-2xl">{children}</div>;
}
