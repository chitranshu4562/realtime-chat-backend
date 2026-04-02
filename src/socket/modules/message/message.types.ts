export const MESSAGE_STATUS = {
    PENDING: "PENDING",
    READ: "READ"
} as const;

export type MessageStatusType = typeof MESSAGE_STATUS[keyof typeof MESSAGE_STATUS];