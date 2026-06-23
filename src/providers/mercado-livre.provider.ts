import { AppError } from "../errors/AppError";
import { env } from "../config/env";
import {
    ExternalProductOffer,
    ExternalProductProvider,
    ExternalProductSearchParams,
} from "./external-product.provider";

interface MercadoLivreSearchResponse {
    results?: MercadoLivreItem[];
}

interface MercadoLivreItem {
    id: string;
    title: string;
    price: number;
    currency_id: string;
    category_id: string;
    permalink?: string;
    thumbnail?: string;
    seller?: {
        nickname?: string;
    };
}

export class MercadoLivreProvider implements ExternalProductProvider {
    async search(params: ExternalProductSearchParams): Promise<ExternalProductOffer[]> {
        const url = new URL(
            `/sites/${env.MERCADO_LIVRE_SITE_ID}/search`,
            env.MERCADO_LIVRE_API_BASE_URL
        );

        url.searchParams.set("q", params.query);
        url.searchParams.set("limit", String(params.limit));

        const response = await fetch(url, {
            headers: {
                Accept: "application/json",
                "User-Agent": "mobile-price-comparator-api/1.0",
            },
        });

        if (!response.ok) {
            throw new AppError(
                `External product provider failed with status ${response.status}`,
                502
            );
        }

        const payload = (await response.json()) as MercadoLivreSearchResponse;

        return (payload.results ?? []).map((item) => ({
            externalId: `mercadolivre:${item.id}`,
            name: item.title,
            store: item.seller?.nickname ?? "Mercado Livre",
            category: item.category_id,
            currentPrice: item.price,
            currency: item.currency_id,
            productUrl: item.permalink,
            imageUrl: item.thumbnail,
        }));
    }
}
