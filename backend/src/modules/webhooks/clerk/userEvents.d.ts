import type { WebhookEvent } from "@clerk/express";
export declare function handleUserCreated(event: WebhookEvent): Promise<void>;
export declare function handleUserUpdated(event: WebhookEvent): Promise<void>;
export declare function handleUserDeleted(event: Extract<WebhookEvent, {
    type: "user.deleted";
}>): Promise<void>;
//# sourceMappingURL=userEvents.d.ts.map