import { handleUserCreated, handleUserDeleted, handleUserUpdated } from "./userEvents.js";
export async function handleClerkWebhook(event) {
    switch (event.type) {
        case "user.created":
            await handleUserCreated(event);
            break;
        case "user.updated":
            await handleUserUpdated(event);
            break;
        case "user.deleted":
            await handleUserDeleted(event);
            break;
        default:
            console.log(`Unhandled Clerk event: ${event.type}`);
    }
}
//# sourceMappingURL=clerk.webhook.service.js.map