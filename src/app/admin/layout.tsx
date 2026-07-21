import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-10 border-b border-black pb-6 flex items-baseline justify-between">
        <div className="flex items-baseline gap-8">
          <span className="text-lg font-extrabold tracking-tight">MONO Admin</span>
          <nav className="text-sm flex gap-5">
            <Link href="/admin" className="hover:underline">Dashboard</Link>
            <Link href="/admin/orders" className="hover:underline">Orders</Link>
            <Link href="/admin/products" className="hover:underline">Products</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {session?.user?.email && (
            <span className="text-neutral-400 text-xs">{session.user.email}</span>
          )}
          <LogoutButton
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />
          <Link href="/" className="hover:underline text-neutral-500">← Store</Link>
        </div>
      </header>
      {children}
    </div>
  );
}