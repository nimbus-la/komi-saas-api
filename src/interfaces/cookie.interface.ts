/**
 * A qué peticiones adjunta el navegador la cookie de sesión.
 *
 * - 'lax': same-site. El front y la API comparten dominio registrable, por
 *   ejemplo restaurante-a.komi.com contra api.komi.com. Es el caso sano.
 * - 'none': cross-site. Front y API en dominios distintos, como un
 *   *.vercel.app hablando con un *.up.railway.app. Exige `secure`.
 * - 'strict': ni siquiera viaja al llegar desde un enlace externo. Para esta
 *   cookie sobra, pero se admite porque no cuesta nada.
 */
export type CookieSameSite = 'lax' | 'strict' | 'none';


export interface CookieConfig {
    secure: boolean;
    sameSite: CookieSameSite;
    domain: string | undefined;
}
