declare module 'uuid' {
    /**
     * Generate a RFC4122 v4 UUID
     */
    export function v4(): string;
    
    /**
     * Generate a RFC4122 v5 UUID
     * @param name - Value used to calculate the hash
     * @param namespace - Namespace UUID (often a domain or URL UUID)
     */
    export function v5(name: string, namespace: string): string;
    
    /**
     * Generate a RFC4122 v1 UUID (time-based)
     */
    export function v1(): string;
}
