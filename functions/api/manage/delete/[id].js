import { jsonResponse } from "../../../utils/http.js";
import { getMetadata } from "../../../utils/metadata.js";
import { deleteShortLink } from "../../../utils/shortlink.js";

export async function onRequest(context) {
    const { env, params } = context;

    const metadata = await getMetadata(env, params.id);
    await env.img_url.delete(params.id);

    if (metadata?.shortId) {
        await deleteShortLink(env, metadata.shortId);
    }

    // Physical deletion from Cloudflare R2 if using R2 storage
    if (env.img_r2 && (params.id.startsWith("r2-") || metadata?.provider === "r2")) {
        try {
            await env.img_r2.delete(params.id);
        } catch (e) {
            console.error("Failed to delete object from R2:", e);
        }
    }

    return jsonResponse(params.id);
}
