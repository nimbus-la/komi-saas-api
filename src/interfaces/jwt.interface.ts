export interface JwtConfig {
    secret: string;
    accessTtlSeconds: number;
    refreshTtlDays: number;
}