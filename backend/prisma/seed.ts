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
    },
    {
      name: "Enceinte Portable Echo",
      description: "Enceinte bluetooth compacte, autonomie 20 heures et resistance aux eclaboussures.",
      sku: "ECHO-SPEAKER",
      priceInCents: 6490,
      stock: 30,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1"],
      isFeatured: false
    },
    {
      name: "Clavier Mecanique Slate",
      description: "Clavier mecanique compact retroeclaire avec switches lineaires silencieux.",
      sku: "SLATE-KEYBOARD",
      priceInCents: 11990,
      stock: 12,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3"],
      isFeatured: false
    },
    {
      name: "Chargeur Sans Fil Disc",
      description: "Chargeur a induction 15W compatible avec la majorite des smartphones recents.",
      sku: "DISC-CHARGER",
      priceInCents: 2990,
      stock: 45,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1591290619762-b4b1d5c1b8b3"],
      isFeatured: false
    },
    {
      name: "Plaid Laine Douce",
      description: "Plaid en laine melangee, tisse en France, ideal pour les soirees d hiver.",
      sku: "PLAID-LAINE",
      priceInCents: 4590,
      stock: 22,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1580301762395-83604a1c15b0"],
      isFeatured: false
    },
    {
      name: "Vase Ceramique Ondes",
      description: "Vase artisanal en ceramique emaillee, piece unique tournee a la main.",
      sku: "ONDES-VASE",
      priceInCents: 3890,
      stock: 16,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d"],
      isFeatured: false
    },
    {
      name: "Set Couverts Nordic",
      description: "Set de couverts en inox brosse, seize pieces, finition mate.",
      sku: "NORDIC-CUTLERY",
      priceInCents: 5290,
      stock: 20,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1590794056226-79ef3a8147e1"],
      isFeatured: false
    },
    {
      name: "Miroir Rond Halo",
      description: "Miroir mural rond avec cadre metal noir, diametre soixante centimetres.",
      sku: "HALO-MIRROR",
      priceInCents: 8900,
      stock: 9,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1618220179428-22790b461013"],
      isFeatured: true
    },
    {
      name: "Sneakers Urban Low",
      description: "Baskets basses en cuir pleine fleur, semelle recyclee et doublure textile.",
      sku: "URBAN-LOW",
      priceInCents: 9900,
      stock: 26,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772"],
      isFeatured: false
    },
    {
      name: "Montre Minimal Field",
      description: "Montre analogique bracelet cuir, boitier acier trente-huit millimetres.",
      sku: "FIELD-WATCH",
      priceInCents: 14900,
      stock: 8,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314"],
      isFeatured: true
    },
    {
      name: "Echarpe Cachemire Brume",
      description: "Echarpe en cachemire tisse, coloris brume, dimensions cent quatre-vingts centimetres.",
      sku: "BRUME-SCARF",
      priceInCents: 7900,
      stock: 14,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26"],
      isFeatured: false
    },
    {
      name: "Sac Bandouliere Trace",
      description: "Sac bandouliere compact en toile enduite, poche interieure zippee.",
      sku: "TRACE-BAG",
      priceInCents: 6200,
      stock: 19,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa"],
      isFeatured: false
    },
    {
      name: "Carnet Cuir Atelier",
      description: "Carnet a couverture cuir rechargeable, papier ivoire cent grammes.",
      sku: "ATELIER-NOTEBOOK",
      priceInCents: 3200,
      stock: 40,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1531346878377-a5be20888e57"],
      isFeatured: false
    },
    {
      name: "Gourde Isotherme Peak",
      description: "Gourde isotherme cinq cents millilitres, acier double paroi, garde le chaud douze heures.",
      sku: "PEAK-BOTTLE",
      priceInCents: 2790,
      stock: 50,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8"],
      isFeatured: false
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
