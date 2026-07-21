import { prisma } from "@/lib/prisma";
import { auth, signOut } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { CartBadge } from "@/components/cart-badge"
import { placeholderImage } from "@/lib/product-image";
import Link from "next/link";
import Image from "next/image";
// import LogoutButton from "@/components/logout-button";
import SiteNav from "@/components/site-nav";


export default async function HomePage() {
  const [categories, session] = await Promise.all([
    prisma.category.findMany({
      include: { products: { where: { active: true }, include: { variants: true } } },
    }),
    auth(),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-10 border-b border-black pb-6 flex items-center justify-between">
        <Logo />
        <SiteNav
          categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
          userEmail={session?.user?.email}
          logoutAction={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        />
      </header>

      <section className="mb-16 py-16 border-b border-black grid sm:grid-cols-2 gap-8 items-end">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
            Personal care, done plainly
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05]">
            Deodorants, perfumes,
            <br />
            and costumes —
            <br />
            no fuss.
          </h1>
        </div>
        <div className="text-sm text-neutral-600 leading-relaxed sm:pb-2">
          <p>
            Everything you actually need, priced honestly, delivered without the
            markup. Pay by bank transfer — we confirm every order by hand, no
            middlemen taking a cut.
          </p>
        </div>
      </section>

      {categories.map((category) => (
        <section key={category.id} id={category.slug} className="mb-16 scroll-mt-8">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest">
              {category.name}
            </h2>
            <span className="text-xs text-neutral-400">
              {category.products.length} item{category.products.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-black border border-black">
            {category.products.map((product) => {
              const lowestPrice = Math.min(...product.variants.map((v) => v.priceKobo));
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
              const imgSrc = product.images[0] || placeholderImage(product.slug);
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white p-4 flex flex-col"
                >
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden mb-3">
                    <Image
                      src={imgSrc}
                      alt={product.name}
                      fill
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    {totalStock === 0 && (
                      <span className="absolute top-2 left-2 bg-black text-white text-[10px] uppercase tracking-widest px-2 py-1">
                        Sold out
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-sm text-neutral-500">
                    from ₦{(lowestPrice / 100).toLocaleString()}
                  </p>
                </Link>
              );
            })}
            {category.products.length === 0 && (
              <p className="text-sm text-neutral-400 col-span-full bg-white p-4">
                No products yet.
              </p>
            )}
          </div>
        </section>
      ))}

      <footer className="border-t border-black pt-6 mt-4 text-xs text-neutral-500 flex justify-between">
        <span>© {new Date().getFullYear()} MONO</span>
        <span>Bank transfer checkout · confirmed manually</span>
      </footer>
    </div>
  );
}