import { Prisma } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../errors/AppError";
import { ProductListDto } from "../dtos/product-list.dto";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";

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