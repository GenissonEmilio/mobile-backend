import { Prisma, Product } from "@prisma/client";

import { prisma } from "../prisma/client";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";
import {
    ExternalProductOffer,
    ExternalProductProvider,
} from "../providers/external-product.provider";
import { MercadoLivreProvider } from "../providers/mercado-livre.provider";
import {
    ExternalProductSearchDto,
    ImportExternalProductsDto,
} from "../dtos/external-products.dto";

export class ExternalProductService {
    private provider: ExternalProductProvider;

    constructor(provider = ExternalProductService.createProvider()) {
        this.provider = provider;
    }

    private static createProvider(): ExternalProductProvider {
        if (env.EXTERNAL_PRODUCTS_PROVIDER === "mercadolivre") {
            return new MercadoLivreProvider();
        }

        throw new AppError("External products provider is not supported", 500);
    }

    private inferEmoji(product: ExternalProductOffer): string {
        const text = `${product.name} ${product.category}`.toLowerCase();

        if (text.includes("phone") || text.includes("iphone") || text.includes("galaxy")) {
            return "📱";
        }

        if (text.includes("notebook") || text.includes("macbook") || text.includes("dell")) {
            return "💻";
        }

        if (text.includes("fone") || text.includes("headphone") || text.includes("audio")) {
            return "🎧";
        }

        if (text.includes("playstation") || text.includes("xbox") || text.includes("nintendo")) {
            return "🎮";
        }

        return "🛒";
    }

    private buildProductData(
        product: ExternalProductOffer,
        category?: string
    ): Prisma.ProductCreateInput {
        return {
            name: product.name,
            store: product.store,
            category: category ?? product.category,
            currentPrice: product.currentPrice,
            previousPrice: product.currentPrice,
            emoji: this.inferEmoji(product),
            externalId: product.externalId,
        };
    }

    private async upsertExternalProduct(
        product: ExternalProductOffer,
        category?: string
    ): Promise<Product & { importedStatus: "created" | "updated" | "unchanged" }> {
        const existing = await prisma.product.findUnique({
            where: { externalId: product.externalId },
        });

        if (!existing) {
            const created = await prisma.product.create({
                data: this.buildProductData(product, category),
            });

            return { ...created, importedStatus: "created" };
        }

        const priceChanged = existing.currentPrice !== product.currentPrice;
        const productData = this.buildProductData(product, category);

        const updated = await prisma.$transaction(async (tx) => {
            if (priceChanged) {
                await tx.priceHistory.create({
                    data: {
                        productId: existing.id,
                        price: existing.currentPrice,
                    },
                });
            }

            return tx.product.update({
                where: { id: existing.id },
                data: {
                    name: productData.name,
                    store: productData.store,
                    category: productData.category,
                    currentPrice: product.currentPrice,
                    previousPrice: priceChanged
                        ? existing.currentPrice
                        : existing.previousPrice,
                    emoji: productData.emoji,
                },
            });
        });

        return {
            ...updated,
            importedStatus: priceChanged ? "updated" : "unchanged",
        };
    }

    async search(query: ExternalProductSearchDto) {
        return this.provider.search({
            query: query.q,
            limit: query.limit ?? 10,
        });
    }

    async importProducts(data: ImportExternalProductsDto) {
        const externalProducts = await this.provider.search({
            query: data.q,
            limit: data.limit ?? 10,
        });

        const importedProducts = [];

        for (const product of externalProducts) {
            importedProducts.push(
                await this.upsertExternalProduct(product, data.category)
            );
        }

        return {
            provider: env.EXTERNAL_PRODUCTS_PROVIDER,
            query: data.q,
            imported: importedProducts.length,
            created: importedProducts.filter((product) => product.importedStatus === "created")
                .length,
            updated: importedProducts.filter((product) => product.importedStatus === "updated")
                .length,
            unchanged: importedProducts.filter(
                (product) => product.importedStatus === "unchanged"
            ).length,
            products: importedProducts,
        };
    }
}
