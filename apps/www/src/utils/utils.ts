const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) throw new Error("API base URL is not defined!");

export function urlHandler(path: string): string {
    return `${API_BASE}${path}`;
}

export function preferencesUrlHandler(): string {
    return `${API_BASE}/preferences-api`;
}

export function imagesUrlHandler(): string {
    return `${API_BASE}/product-image-api`;
}

export function getProductUrl(id: number | string): string {
    return `${API_BASE}/api/products/${id}`;
}

export function getSubpartLogUrl(manufacturerUrl: string): string {
    return `${API_BASE}/api/logs/`;
}