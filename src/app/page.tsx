import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { Logo } from "@/components/logo";
import SiteNav from "@/components/site-nav";
import Link from "next/link";
import {
  SearchBar,
  ProductCard,
  SectionHeading,
  avgRatingOf,
  type Product,
} from "@/components/product-widgets";
import { Shield, Clock, Truck, Headphones, ArrowRight } from "lucide-react";

const ACCENT = "#0B4F3D";

export default async function HomePage() {
  const [categories, session] = await Promise.all([
    prisma.category.findMany({
      include: {
        products: {
          where: { active: true },
          include: { variants: true, reviews: true },
        },
      },
    }),
    auth(),
  ]);

  const allProducts = categories.flatMap((c) => c.products as Product[]);

  const featured = allProducts
    .filter((p) => p.reviews.length > 0)
    .sort((a, b) => {
      const ratingDiff = avgRatingOf(b.reviews) - avgRatingOf(a.reviews);
      return ratingDiff !== 0 ? ratingDiff : b.reviews.length - a.reviews.length;
    })
    .slice(0, 4);

  const valueProps = [
    { icon: Shield, label: "No card fees", detail: "Bank transfer only — no gateway markup on top." },
    { icon: Clock, label: "Confirmed by hand", detail: "A person checks every transfer, usually within hours." },
    { icon: Truck, label: "Nationwide delivery", detail: "24–48h in Lagos, 3–5 days elsewhere." },
    { icon: Headphones, label: "Direct support", detail: "An issue with an order goes straight to us, not a bot." },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <header className="border-b border-black pb-4 sm:pb-6 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <SearchBar />
            <SiteNav
              categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
              userEmail={session?.user?.email}
              logoutAction={logoutAction}
            />
          </div>
        </header>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-3 sm:mb-4" style={{ color: ACCENT }}>
              Personal care, done plainly
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight leading-[1.05]">
              Deodorants, perfumes,
              <br className="hidden sm:block" />
              and costumes —
              <br />
              <span style={{ color: ACCENT }}>no fuss.</span>
            </h1>
          </div>
          <div className="text-sm sm:text-base text-neutral-600 leading-relaxed space-y-6">
            <p>
              Everything you actually need, priced honestly, delivered without the
              markup. Pay by bank transfer — we confirm every order by hand, no
              middlemen taking a cut.
            </p>
            <Link
              href="#deodorants"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white px-6 py-3.5 hover:opacity-85 transition-opacity"
              style={{ backgroundColor: ACCENT }}
            >
              Start browsing
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-0 lg:divide-x lg:divide-neutral-800">
            {valueProps.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="lg:px-6 first:lg:pl-0 last:lg:pr-0 flex items-start gap-4 sm:gap-3">
                  <Icon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-widest font-medium mb-1">
                      <span style={{ color: "#4ADE80" }}>0{i + 1} — </span>
                      {item.label}
                    </p>
                    <p className="text-xs text-neutral-400 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {featured.length > 0 && (
          <section className="mb-16">
            <SectionHeading title="Most reordered" meta="Highest rated" viewMoreHref="/products" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {categories.map((category) => {
          const categoryProducts = category.products as Product[];
          const visibleProducts = categoryProducts.slice(0, 4);
          const hasMore = categoryProducts.length > 4;

          return (
            <section key={category.id} id={category.slug} className="mb-16 scroll-mt-8">
              <SectionHeading
                title={category.name}
                meta={`${category.products.length} item${category.products.length === 1 ? "" : "s"}`}
                viewMoreHref={hasMore ? `/products?category=${category.slug}` : undefined}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {category.products.length === 0 && (
                  <p className="text-sm text-neutral-400 col-span-full bg-white p-6 text-center">
                    No products available in this category yet.
                  </p>
                )}
              </div>
            </section>
          );
        })}

        <section className="mb-16 py-12 sm:py-16 border-y border-black">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight mb-8 sm:mb-10">
            How ordering works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {[
              { n: "01", title: "Pick what you need", body: "Browse deodorants, perfumes, and costumes — add whatever fits to your cart." },
              { n: "02", title: "Transfer to our account", body: "Checkout shows our bank details. Send the exact amount, then confirm you've paid." },
              { n: "03", title: "We confirm and ship", body: "A person checks the transfer against your order, usually within a few hours, then it goes out." },
            ].map((step) => (
              <div key={step.n} className="group">
                <p className="text-3xl sm:text-4xl font-serif font-semibold mb-3 transition-colors" style={{ color: ACCENT }}>
                  {step.n}
                </p>
                <p className="text-base font-medium mb-1.5">{step.title}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-8 sm:pt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: ACCENT }}>Shop</p>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <a href={`#${c.slug}`} className="hover:underline transition-colors">{c.name}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: ACCENT }}>Support</p>
            <ul className="space-y-2.5 text-neutral-700">
              <li><Link href="/orders" className="hover:underline transition-colors">Track an order</Link></li>
              <li>Delivery: 24–48h Lagos, 3–5 days elsewhere</li>
              <li>Payment confirmed manually, no automatic charges</li>
            </ul>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xs uppercase tracking-widest font-semibold mb-4" style={{ color: ACCENT }}>MONO</p>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
              Personal care sold plainly. No middlemen, no markup, no fuss.
            </p>
          </div>
        </footer>

        <div className="border-t border-black pt-6 mt-10 text-xs text-neutral-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} MONO. All rights reserved.</span>
          <span className="flex items-center gap-1">
            <span className="hidden sm:inline">Bank transfer checkout</span>
            <span className="sm:hidden">Bank transfer</span>
            <span>·</span>
            <span>confirmed manually</span>
          </span>
        </div>
      </div>
    </div>
  );
}