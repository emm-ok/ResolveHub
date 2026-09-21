import { verifyWebhook } from "@clerk/express/webhooks";
import { handleClerkWebhook, } from "./clerk.webhook.service.js";
export async function clerkWebhook(req, res) {
    try {
        const event = await verifyWebhook(req);
        await handleClerkWebhook(event);
        return res.status(200).json({
            success: true,
        });
    }
    catch (error) {
        console.error("Clerk webhook error:", error);
        return res.status(400).json({
            success: false,
            message: "Invalid webhook",
        });
    }
}
//# sourceMappingURL=clerk.webhook.js.map