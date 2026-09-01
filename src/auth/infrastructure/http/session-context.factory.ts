import { Request } from "express";
import { SessionContext } from "../../application";


const sanitizeUserAgent = (raw: unknown): string | null => {
    if (typeof raw !== 'string') return null;

    const trimmed = raw.trim();

    return trimmed.length === 0
        ? null
        : trimmed.slice(0, 512);
}


export const buildSessionContext = (req: Request): SessionContext => ({
    ipAddress: req.ip ?? null,
    userAgent: sanitizeUserAgent(req.headers['user-agent']),
})