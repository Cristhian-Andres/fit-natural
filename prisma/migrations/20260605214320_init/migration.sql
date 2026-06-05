-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "emoji" VARCHAR(10) NOT NULL DEFAULT '🌿',
    "description" TEXT NOT NULL,
    "flavors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "imageBlur" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "productId" TEXT NOT NULL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "variants" ADD CONSTRAINT "variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
