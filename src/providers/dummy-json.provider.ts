import {
  ExternalProductOffer,
  ExternalProductProvider,
  ExternalProductSearchParams,
} from "./external-product.provider";

interface DummyJsonSearchResponse {
  products?: DummyJsonProduct[];
}

interface DummyJsonProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  brand?: string;
  thumbnail?: string;
}

export class DummyJsonProvider implements ExternalProductProvider {
  async search(params: ExternalProductSearchParams): Promise<ExternalProductOffer[]> {
    const url = new URL("https://dummyjson.com/products/search");
    url.searchParams.set("q", params.query);
    url.searchParams.set("limit", String(params.limit));

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as DummyJsonSearchResponse;

    return (payload.products ?? []).map((item) => ({
      externalId: `dummyjson:${item.id}`,
      name: item.title,
      store: item.brand ?? "DummyJSON Store",
      category: item.category,
      currentPrice: item.price,
      currency: "USD",
      productUrl: `https://dummyjson.com/products/${item.id}`,
      imageUrl: item.thumbnail,
    }));
  }
}
