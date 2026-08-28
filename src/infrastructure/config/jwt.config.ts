import { JwtConfig } from "@/interfaces";
import { registerAs } from "@nestjs/config";


export default registerAs(
    'jwt',
    (): JwtConfig => ({
        secret: process.env['JWT_SECRET'] ?? '',
        accessTtlSeconds: parseInt(process.env['JWT_ACCESS_TTL'] ?? '900', 10)
    })
);