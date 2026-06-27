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
  private queryCandidates(query: string): string[] {
    const normalizedQuery = query.trim().toLowerCase();
    const candidates = [normalizedQuery];

    const synonyms: Record<string, string[]> = {
      notebook: ["laptop"],
      notebooks: ["laptop"],
      computador: ["laptop"],
      computadores: ["laptop"],
      celular: ["phone", "smartphone"],
      celulares: ["phone", "smartphone"],
      smartphone: ["phone"],
      smartphones: ["phone"],
      iphone: ["iphone", "phone"],
      fone: ["headphones", "earphones"],
      fones: ["headphones", "earphones"],
      headset: ["headphones"],
      audio: ["headphones"],
      áudio: ["headphones"],
    };

    for (const [term, replacements] of Object.entries(synonyms)) {
      if (normalizedQuery.includes(term)) {
        candidates.push(...replacements);
      }
    }

    return Array.from(new Set(candidates.filter(Boolean)));
  }

  private demoProducts(query: string, limit: number): ExternalProductOffer[] {
    const normalizedQuery = query.trim().toLowerCase();

    const catalog: ExternalProductOffer[] = [
      {
        externalId: "demo:notebook:lenovo-ideapad-3",
        name: "Notebook Lenovo IdeaPad 3 Ryzen 5 8GB SSD 256GB",
        store: "Demo Store",
        category: "notebooks",
        currentPrice: 2499.9,
        currency: "BRL",
        productUrl: "https://example.com/notebook-lenovo-ideapad-3",
      },
      {
        externalId: "demo:notebook:dell-inspiron-15",
        name: "Notebook Dell Inspiron 15 Intel i5 8GB SSD 512GB",
        store: "Tech Demo",
        category: "notebooks",
        currentPrice: 3199.9,
        currency: "BRL",
        productUrl: "https://example.com/notebook-dell-inspiron-15",
      },
      {
        externalId: "demo:notebook:samsung-book",
        name: "Notebook Samsung Book Intel i3 4GB SSD 256GB",
        store: "Compare Demo",
        category: "notebooks",
        currentPrice: 2199.9,
        currency: "BRL",
        productUrl: "https://example.com/notebook-samsung-book",
      },
      {
        externalId: "demo:iphone:15-128gb",
        name: "Apple iPhone 15 128GB",
        store: "Demo Store",
        category: "smartphones",
        currentPrice: 4299.9,
        currency: "BRL",
        productUrl: "https://example.com/iphone-15",
      },
      {
        externalId: "demo:fone:bluetooth",
        name: "Fone Bluetooth com Cancelamento de Ruido",
        store: "Audio Demo",
        category: "audio",
        currentPrice: 299.9,
        currency: "BRL",
        productUrl: "https://example.com/fone-bluetooth",
      },
      {
        externalId: "demo:ps5:slim",
        name: "PlayStation 5 Slim Edição Digital",
        store: "Games Demo",
        category: "games",
        currentPrice: 3499.9,
        currency: "BRL",
        productUrl: "https://example.com/playstation-5-slim",
      },
    ];

    const matches = catalog.filter((product) => {
      const searchableText = `${product.name} ${product.category}`.toLowerCase();
      return normalizedQuery
        .split(/\s+/)
        .filter(Boolean)
        .some((term) => searchableText.includes(term));
    });

    return (matches.length > 0 ? matches : catalog).slice(0, limit);
  }

  private async searchDummyJson(
    query: string,
    limit: number
  ): Promise<ExternalProductOffer[]> {
    const url = new URL("https://dummyjson.com/products/search");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as DummyJsonSearchResponse;
    const products = payload.products ?? [];

    return products.map((item) => ({
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

  async search(params: ExternalProductSearchParams): Promise<ExternalProductOffer[]> {
    try {
      for (const query of this.queryCandidates(params.query)) {
        const products = await this.searchDummyJson(query, params.limit);
        if (products.length > 0) return products;
      }

      return this.demoProducts(params.query, params.limit);
    } catch {
      return this.demoProducts(params.query, params.limit);
    }
  }
}
