export interface ExternalProductSearchParams {
    query: string;
    limit: number;
}

export interface ExternalProductOffer {
    externalId: string;
    name: string;
    store: string;
    category: string;
    currentPrice: number;
    currency: string;
    productUrl?: string;
    imageUrl?: string;
}

export interface ExternalProductProvider {
    search(params: ExternalProductSearchParams): Promise<ExternalProductOffer[]>;
}
