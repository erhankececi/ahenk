export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell px-4 py-6">
      <div className="mx-auto min-h-dvh max-w-6xl rounded-[2rem] border border-white/10 bg-black/15 p-4 shadow-[0_28px_90px_-54px_rgba(0,0,0,1)] backdrop-blur sm:p-6">
        {children}
      </div>
    </div>
  );
}
