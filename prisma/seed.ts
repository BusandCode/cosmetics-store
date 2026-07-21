// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertProduct(opts: {
  name: string;
  slug: string;
  description: string;
  categorySlug: string;
  variants: { label: string; sku: string; priceKobo: number; stock: number }[];
}) {
  const category = await prisma.category.findUniqueOrThrow({ where: { slug: opts.categorySlug } });
  await prisma.product.upsert({
    where: { slug: opts.slug },
    update: {},
    create: {
      name: opts.name,
      slug: opts.slug,
      description: opts.description,
      images: [],
      categoryId: category.id,
      variants: { create: opts.variants },
    },
  });
}

async function main() {
  await Promise.all(
    [
      { name: "Deodorants", slug: "deodorants" },
      { name: "Perfumes", slug: "perfumes" },
      { name: "Costumes", slug: "costumes" },
    ].map((c) => prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }))
  );

  // Deodorants
  await upsertProduct({
    name: "Fresh Guard Roll-On",
    slug: "fresh-guard-roll-on",
    description: "24-hour protection roll-on deodorant.",
    categorySlug: "deodorants",
    variants: [
      { label: "50ml", sku: "FGR-50", priceKobo: 150000, stock: 40 },
      { label: "100ml", sku: "FGR-100", priceKobo: 250000, stock: 25 },
    ],
  });
  await upsertProduct({
    name: "Arctic Chill Spray",
    slug: "arctic-chill-spray",
    description: "Cooling body spray with all-day freshness.",
    categorySlug: "deodorants",
    variants: [{ label: "150ml", sku: "ACS-150", priceKobo: 220000, stock: 30 }],
  });
  await upsertProduct({
    name: "Citrus Burst Deo Stick",
    slug: "citrus-burst-deo-stick",
    description: "Solid deodorant stick, citrus scent, no white marks.",
    categorySlug: "deodorants",
    variants: [{ label: "40g", sku: "CBD-40", priceKobo: 180000, stock: 0 }],
  });
  await upsertProduct({
    name: "Sensitive Skin Roll-On",
    slug: "sensitive-skin-roll-on",
    description: "Alcohol-free formula for sensitive skin.",
    categorySlug: "deodorants",
    variants: [{ label: "50ml", sku: "SSR-50", priceKobo: 200000, stock: 18 }],
  });

  // Perfumes
  await upsertProduct({
    name: "Velvet Noir Eau de Parfum",
    slug: "velvet-noir-eau-de-parfum",
    description: "Warm, woody evening scent.",
    categorySlug: "perfumes",
    variants: [
      { label: "30ml", sku: "VNP-30", priceKobo: 1800000, stock: 15 },
      { label: "50ml", sku: "VNP-50", priceKobo: 2800000, stock: 10 },
    ],
  });
  await upsertProduct({
    name: "Golden Amber",
    slug: "golden-amber",
    description: "Sweet amber and vanilla, long-lasting.",
    categorySlug: "perfumes",
    variants: [{ label: "50ml", sku: "GA-50", priceKobo: 3200000, stock: 8 }],
  });
  await upsertProduct({
    name: "Citrus Bloom",
    slug: "citrus-bloom",
    description: "Bright, fresh citrus and white florals.",
    categorySlug: "perfumes",
    variants: [
      { label: "30ml", sku: "CB-30", priceKobo: 1600000, stock: 20 },
      { label: "50ml", sku: "CB-50", priceKobo: 2400000, stock: 12 },
    ],
  });
  await upsertProduct({
    name: "Midnight Oud",
    slug: "midnight-oud",
    description: "Deep, smoky oud with a leather base note.",
    categorySlug: "perfumes",
    variants: [{ label: "50ml", sku: "MO-50", priceKobo: 4200000, stock: 5 }],
  });

  // Costumes
  await upsertProduct({
    name: "Classic Vampire Costume",
    slug: "classic-vampire-costume",
    description: "Full costume set with cape and collar.",
    categorySlug: "costumes",
    variants: [
      { label: "Medium", sku: "CVC-M", priceKobo: 1200000, stock: 8 },
      { label: "Large", sku: "CVC-L", priceKobo: 1200000, stock: 6 },
    ],
  });
  await upsertProduct({
    name: "Superhero Jumpsuit",
    slug: "superhero-jumpsuit",
    description: "Stretch jumpsuit with detachable cape.",
    categorySlug: "costumes",
    variants: [
      { label: "Small", sku: "SJ-S", priceKobo: 950000, stock: 10 },
      { label: "Medium", sku: "SJ-M", priceKobo: 950000, stock: 10 },
      { label: "Large", sku: "SJ-L", priceKobo: 950000, stock: 4 },
    ],
  });
  await upsertProduct({
    name: "Medieval Warrior Set",
    slug: "medieval-warrior-set",
    description: "Armor-look bodice with faux leather trim.",
    categorySlug: "costumes",
    variants: [{ label: "Medium", sku: "MWS-M", priceKobo: 1500000, stock: 3 }],
  });
  await upsertProduct({
    name: "Witch's Night Robe",
    slug: "witchs-night-robe",
    description: "Flowing robe with pointed hat included.",
    categorySlug: "costumes",
    variants: [{ label: "One size", sku: "WNR-OS", priceKobo: 1100000, stock: 14 }],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());