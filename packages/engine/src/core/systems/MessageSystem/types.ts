export interface EventPayloads {
  ENTITY_CREATED: { entityId: string; entityName: string };
  ENTITY_UPDATED: { entityId: string; changes: Record<string, any> };
  PLAYER_JOINED: { playerId: string; playerName: string };
  PLAYER_LEFT: { playerId: string };
}

export type EventType = keyof EventPayloads;

export enum EventPriority {
  LOW = 1,
  MEDIUM = 5,
  HIGH = 10,
}

export interface MessagingSystemConfig {
  messageLimits: {
    [priority in EventPriority]: number;
  };
}
