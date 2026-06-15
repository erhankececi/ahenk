export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-page min-h-dvh px-4 py-6">
      <div className="lp-panel mx-auto min-h-[calc(100dvh-3rem)] max-w-2xl rounded-[2rem] p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
