interface Serializable {
    toObject?: () => Record<string, unknown>;
}

/**
 * Attaches a minimal `_links` block to a single-resource response.
 * Accepts Mongoose documents (converted via `toObject()`) or plain objects.
 */
export function withLinks<T extends Serializable>(resource: T, links: Record<string, string>) {
    const plain = typeof resource.toObject === "function" ? resource.toObject() : resource;
    return { ...plain, _links: links };
}
