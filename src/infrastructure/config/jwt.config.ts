import { registerAs } from "@nestjs/config";

import { JwtConfig } from "@/interfaces";
import { DEFAULT_ACCESS_TTL_SECONDS, DEFAULT_SESSION_TTL_DAYS } from "@/utils";


export default registerAs(
    'jwt',
    (): JwtConfig => ({
        secret: process.env['JWT_SECRET'] ?? '',
        accessTtlSeconds: parseInt(process.env['JWT_ACCESS_TTL'] ?? String(DEFAULT_ACCESS_TTL_SECONDS), 10),
        refreshTtlDays: parseInt(process.env['JWT_REFRESH_TTL_DAYS'] ?? String(DEFAULT_SESSION_TTL_DAYS), 10)
    })
);