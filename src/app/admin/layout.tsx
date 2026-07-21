import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
        <Link href="/" className="text-sm hover:underline text-neutral-500">← Store</Link>
      </header>
      {children}
    </div>
  );
}