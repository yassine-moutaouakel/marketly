import { PrismaClient, ProductStatus, Role, ShopStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

const hash = (value: string) => bcrypt.hash(value, 10);

async function main() {
  const adminPassword = await hash("Admin123!");
  const sellerPassword = await hash("Seller123!");
  const buyerPassword = await hash("Buyer123!");

  const [admin, seller, buyer] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@marketly.dev" },
      update: {
        firstName: "Alice",
        lastName: "Admin",
        role: Role.ADMIN,
        password: adminPassword
      },
      create: {
        email: "admin@marketly.dev",
        firstName: "Alice",
        lastName: "Admin",
        role: Role.ADMIN,
        password: adminPassword,
        cart: {
          create: {}
        }
      }
    }),
    prisma.user.upsert({
      where: { email: "seller@marketly.dev" },
      update: {
        firstName: "Sam",
        lastName: "Seller",
        role: Role.SELLER,
        password: sellerPassword
      },
      create: {
        email: "seller@marketly.dev",
        firstName: "Sam",
        lastName: "Seller",
        role: Role.SELLER,
        password: sellerPassword,
        cart: {
          create: {}
        }
      }
    }),
    prisma.user.upsert({
      where: { email: "buyer@marketly.dev" },
      update: {
        firstName: "Bianca",
        lastName: "Buyer",
        role: Role.BUYER,
        password: buyerPassword
      },
      create: {
        email: "buyer@marketly.dev",
        firstName: "Bianca",
        lastName: "Buyer",
        role: Role.BUYER,
        password: buyerPassword,
        cart: {
          create: {}
        }
      }
    })
  ]);

  await prisma.address.upsert({
    where: { id: "seed-buyer-address" },
    update: {
      userId: buyer.id,
      label: "Domicile",
      line1: "12 rue du Commerce",
      city: "Paris",
      postalCode: "75010",
      country: "France",
      isDefault: true
    },
    create: {
      id: "seed-buyer-address",
      userId: buyer.id,
      label: "Domicile",
      line1: "12 rue du Commerce",
      city: "Paris",
      postalCode: "75010",
      country: "France",
      isDefault: true
    }
  });

  const categories = await Promise.all(
    [
      {
        name: "Electronique",
        description: "Accessoires, audio, objets connectes"
      },
      {
        name: "Maison",
        description: "Decoration et art de vivre"
      },
      {
        name: "Mode",
        description: "Vetements et accessoires"
      }
    ].map((category) =>
      prisma.category.upsert({
        where: { slug: slugify(category.name) },
        update: category,
        create: {
          ...category,
          slug: slugify(category.name)
        }
      })
    )
  );

  const shop = await prisma.shop.upsert({
    where: { ownerId: seller.id },
    update: {
      name: "Studio Marketly",
      slug: "studio-marketly",
      description: "Boutique de demonstration pour les evaluations Bloc 02",
      logoUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      bannerUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
      status: ShopStatus.APPROVED
    },
    create: {
      ownerId: seller.id,
      name: "Studio Marketly",
      slug: "studio-marketly",
      description: "Boutique de demonstration pour les evaluations Bloc 02",
      logoUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
      bannerUrl: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
      status: ShopStatus.APPROVED
    }
  });

  const productSeeds = [
    {
      name: "Casque Bluetooth Nova",
      description: "Casque circum-aural sans fil avec reduction de bruit.",
      sku: "NOVA-HEADSET",
      priceInCents: 8990,
      stock: 24,
      categoryId: categories[0].id,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd"
      ],
      isFeatured: true
    },
    {
      name: "Lampe Atelier",
      description: "Lampe design en metal brosse pour bureau ou salon.",
      sku: "ATELIER-LAMP",
      priceInCents: 5990,
      stock: 15,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"],
      isFeatured: false
    },
    {
      name: "Sac Weekender Canvas",
      description: "Sac robuste pour escapade urbaine ou weekend.",
      sku: "WEEKENDER-CANVAS",
      priceInCents: 7490,
      stock: 18,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
      isFeatured: true
    }
  ];

  for (const productSeed of productSeeds) {
    const product = await prisma.product.upsert({
      where: { slug: slugify(productSeed.name) },
      update: {
        shopId: shop.id,
        categoryId: productSeed.categoryId,
        name: productSeed.name,
        description: productSeed.description,
        sku: productSeed.sku,
        priceInCents: productSeed.priceInCents,
        stock: productSeed.stock,
        isFeatured: productSeed.isFeatured,
        status: ProductStatus.PUBLISHED
      },
      create: {
        shopId: shop.id,
        categoryId: productSeed.categoryId,
        name: productSeed.name,
        description: productSeed.description,
        sku: productSeed.sku,
        priceInCents: productSeed.priceInCents,
        stock: productSeed.stock,
        isFeatured: productSeed.isFeatured,
        slug: slugify(productSeed.name),
        status: ProductStatus.PUBLISHED
      }
    });

    await prisma.productImage.deleteMany({
      where: {
        productId: product.id
      }
    });

    await prisma.productImage.createMany({
      data: productSeed.images.map((image, index) => ({
        productId: product.id,
        url: image,
        alt: productSeed.name,
        sortOrder: index
      }))
    });
  }

  console.log("Seed complete:");
  console.log("admin@marketly.dev / Admin123!");
  console.log("seller@marketly.dev / Seller123!");
  console.log("buyer@marketly.dev / Buyer123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
