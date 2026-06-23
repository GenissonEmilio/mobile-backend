import { Prisma, Product } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../errors/AppError";
import { ProductListDto } from "../dtos/product-list.dto";
import {
    CreateProductDto,
    PriceHistoryQueryDto,
    ProductSearchDto,
    ProductTrendingDto,
    RecordPriceSnapshotDto,
    UpdateProductDto,
} from "../dtos/product.dto";

export interface ProductListQuery {
    name?: string;
    store?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
}

export class ProductService {
    private calcularVariation(current: number, previous: number | null): number {
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    }

    private normalizeProductKey(product: Pick<Product, "name" | "category">): string {
        return `${product.name.trim().toLowerCase()}::${product.category.trim().toLowerCase()}`;
    }

    private getStoreInitials(store: string): string {
        return store
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 3)
            .toUpperCase();
    }

    private groupProductsByCatalog(products: Product[]): Product[][] {
        const groups = new Map<string, Product[]>();

        for (const product of products) {
            const key = this.normalizeProductKey(product);
            const currentGroup = groups.get(key) ?? [];
            currentGroup.push(product);
            groups.set(key, currentGroup);
        }

        return Array.from(groups.values());
    }

    private getCheapestProduct(products: Product[]): Product {
        return products.reduce((cheapest, product) =>
            product.currentPrice < cheapest.currentPrice ? product : cheapest
        );
    }

    private toProductSummary(products: Product[]) {
        const cheapest = this.getCheapestProduct(products);
        const prices = products.map((product) => product.currentPrice);
        const stores = products.map((product) => product.store);
        const variationPercentage = this.calcularVariation(
            cheapest.currentPrice,
            cheapest.previousPrice
        );

        return {
            id: cheapest.id,
            name: cheapest.name,
            store: cheapest.store,
            category: cheapest.category,
            currentPrice: cheapest.currentPrice,
            previousPrice: cheapest.previousPrice,
            emoji: cheapest.emoji,
            externalId: cheapest.externalId,
            updatedAt: cheapest.updatedAt,
            variationPercentage,
            offersCount: products.length,
            stores,
            lowestPrice: Math.min(...prices),
            highestPrice: Math.max(...prices),
            averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        };
    }

    private toOffer(product: Product) {
        return {
            id: product.id,
            storeName: product.store,
            storeInitials: this.getStoreInitials(product.store),
            price: product.currentPrice,
            previousPrice: product.previousPrice,
            variationPercentage: this.calcularVariation(
                product.currentPrice,
                product.previousPrice
            ),
            externalId: product.externalId,
            updatedAt: product.updatedAt,
        };
    }

    private buildSearchWhere(query: ProductSearchDto): Prisma.ProductWhereInput {
        const { q, store, category, minPrice, maxPrice } = query;

        return {
            ...(q && {
                OR: [
                    { name: { contains: q } },
                    { store: { contains: q } },
                    { category: { contains: q } },
                ],
            }),
            ...(store && { store: { contains: store } }),
            ...(category && { category: { contains: category } }),
            ...((minPrice !== undefined || maxPrice !== undefined) && {
                currentPrice: {
                    ...(minPrice !== undefined && { gte: minPrice }),
                    ...(maxPrice !== undefined && { lte: maxPrice }),
                },
            }),
        };
    }


    async list(query: ProductListDto) {
        const { name, store, category, minPrice, maxPrice } = query;

        const where: Prisma.ProductWhereInput = {
            ...(name && { name: { contains: name } }),
            ...(store && { store: { contains: store } }),
            ...(category && { category: { contains: category } }),
            ...((minPrice !== undefined || maxPrice !== undefined) && {
                currentPrice: {
                    ...(minPrice !== undefined && { gte: minPrice }),
                    ...(maxPrice !== undefined && { lte: maxPrice }),
                },
            }),
        };

        const products = await prisma.product.findMany({
            where,
            orderBy: { updatedAt: "desc" },
        });

        return products.map((product) => ({
            ...product,
            variationPercentage: this.calcularVariation(
                product.currentPrice,
                product.previousPrice
            )
        }));
    }

    async search(query: ProductSearchDto) {
        const products = await prisma.product.findMany({
            where: this.buildSearchWhere(query),
            orderBy: [
                { currentPrice: "asc" },
                { updatedAt: "desc" },
            ],
        });

        return this.groupProductsByCatalog(products)
            .map((group) => this.toProductSummary(group))
            .sort((a, b) => a.currentPrice - b.currentPrice)
            .slice(0, query.limit ?? 20);
    }

    async trending(query: ProductTrendingDto) {
        const products = await prisma.product.findMany({
            orderBy: { updatedAt: "desc" },
            take: 200,
        });

        return this.groupProductsByCatalog(products)
            .map((group) => {
                const summary = this.toProductSummary(group);
                const isPriceDown = summary.variationPercentage < 0;

                return {
                    ...summary,
                    trendScore: Math.abs(summary.variationPercentage),
                    badge:
                        summary.variationPercentage === 0
                            ? "Monitorado"
                            : `${isPriceDown ? "-" : "+"}${Math.abs(
                                  summary.variationPercentage
                              ).toFixed(1)}%`,
                    badgeType:
                        summary.variationPercentage === 0
                            ? "stable"
                            : isPriceDown
                              ? "down"
                              : "up",
                };
            })
            .sort((a, b) => {
                if (b.trendScore !== a.trendScore) {
                    return b.trendScore - a.trendScore;
                }

                return b.updatedAt.getTime() - a.updatedAt.getTime();
            })
            .slice(0, query.limit ?? 10);
    }

    async findOffers(id: number) {
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        const offers = await prisma.product.findMany({
            where: {
                name: product.name,
                category: product.category,
            },
            orderBy: [
                { currentPrice: "asc" },
                { updatedAt: "desc" },
            ],
        });

        const cheapest = this.getCheapestProduct(offers);

        return {
            product: this.toProductSummary(offers),
            cheapestOfferId: cheapest.id,
            offers: offers.map((offer) => ({
                ...this.toOffer(offer),
                isCheapest: offer.id === cheapest.id,
            })),
        };
    }

    async findPriceHistory(id: number, query: PriceHistoryQueryDto) {
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        const since = new Date();
        since.setDate(since.getDate() - (query.days ?? 90));

        const relatedOffers = await prisma.product.findMany({
            where: {
                name: product.name,
                category: product.category,
            },
            select: { id: true },
        });

        const relatedProductIds = relatedOffers.map((offer) => offer.id);
        const history = await prisma.priceHistory.findMany({
            where: {
                productId: { in: relatedProductIds },
                createdAt: { gte: since },
            },
            include: { product: true },
            orderBy: { createdAt: "asc" },
        });

        return history.map((entry) => ({
            id: entry.id,
            productId: entry.productId,
            storeName: entry.product.store,
            price: entry.price,
            createdAt: entry.createdAt,
        }));
    }

    async recordPriceSnapshot(id: number, data: RecordPriceSnapshotDto) {
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        if (data.price === product.currentPrice && data.externalId === undefined) {
            return {
                ...product,
                variationPercentage: this.calcularVariation(
                    product.currentPrice,
                    product.previousPrice
                ),
                changed: false,
            };
        }

        const updatedProduct = await prisma.$transaction(async (tx) => {
            if (data.price !== product.currentPrice) {
                await tx.priceHistory.create({
                    data: {
                        productId: id,
                        price: product.currentPrice,
                    },
                });
            }

            return tx.product.update({
                where: { id },
                data: {
                    currentPrice: data.price,
                    previousPrice:
                        data.price !== product.currentPrice
                            ? product.currentPrice
                            : product.previousPrice,
                    ...(data.externalId !== undefined && { externalId: data.externalId }),
                },
            });
        });

        return {
            ...updatedProduct,
            variationPercentage: this.calcularVariation(
                updatedProduct.currentPrice,
                updatedProduct.previousPrice
            ),
            changed: data.price !== product.currentPrice,
        };
    }

    
    async findById(id: number) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                priceHistory: { orderBy: { createdAt: "desc" } }
            }
        });

        if (!product) {
            throw new AppError("Product not found", 404);
        }

        return {
            ...product,
            variationPercentage: this.calcularVariation(product.currentPrice, product.previousPrice),
        }
    }

    async create(data: CreateProductDto) {
        return prisma.product.create({
            data: {
                ...data,
                previousPrice: data.currentPrice,
            },
        });
    }

    async update(id: number, data: UpdateProductDto) {
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
        throw new AppError("Produto não encontrado", 404);
        }

        const updateData: Prisma.ProductUpdateInput = { ...data };

        if (data.currentPrice !== undefined && data.currentPrice !== product.currentPrice) {
        updateData.previousPrice = product.currentPrice;
        
        await prisma.priceHistory.create({
            data: {
            productId: id,
            price: product.currentPrice
            }
        });
        }

        const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        });

        return {
        ...updatedProduct,
        variationPercentage: this.calcularVariation(updatedProduct.currentPrice, updatedProduct.previousPrice),
        };
    }

    async delete(id: number) {
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
        throw new AppError("Produto não encontrado", 404);
        }

        return prisma.product.delete({ where: { id } });
    }

}

export const productService = new ProductService();
