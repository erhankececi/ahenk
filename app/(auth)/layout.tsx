export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-page min-h-dvh">
      <div className="mx-auto min-h-dvh max-w-md">{children}</div>
    </div>
  );
}
