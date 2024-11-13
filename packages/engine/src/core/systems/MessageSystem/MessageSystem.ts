import { BaseSystem } from "../BaseSystem";
import { SubscriptionEventMessage } from "./SubscriptionEventMessage";

// MessagingSystem.ts
import {
  EventType,
  EventPayloads,
  EventPriority,
  MessagingSystemConfig,
} from "./types";

type MessageHandler<K extends EventType> = (
  message: SubscriptionEventMessage<EventPayloads[K]>,
) => void;

interface Subscription<K extends EventType> {
  handler: MessageHandler<K>;
  context?: any;
  once: boolean;
}

interface QueuedMessage<K extends EventType> {
  type: K;
  payload: SubscriptionEventMessage<EventPayloads[K]>;
  priority: EventPriority;
}

const defaultMessagingConfig: MessagingSystemConfig = {
  messageLimits: {
    [EventPriority.HIGH]: 300,
    [EventPriority.MEDIUM]: 100,
    [EventPriority.LOW]: 50,
  },
};

export class MessagingSystem extends BaseSystem {
  #messageQueue: QueuedMessage<any>[];
  #subscriptions: Map<EventType, Subscription<any>[]>;
  #config: MessagingSystemConfig;
  #perTurnMessageCount: Map<EventPriority, number>;

  constructor(config?: MessagingSystemConfig) {
    super();

    this.#messageQueue = [];

    this.#subscriptions = new Map();

    this.#config = config || defaultMessagingConfig;

    this.#perTurnMessageCount = new Map<EventPriority, number>([
      [EventPriority.HIGH, 0],
      [EventPriority.MEDIUM, 0],
      [EventPriority.LOW, 0],
    ]);
  }

  public init(): void {}

  public sendMessage<K extends EventType>(
    type: K,
    payload: SubscriptionEventMessage<EventPayloads[K]>,
    priority: EventPriority,
    immediate: boolean = false,
  ): void {
    if (immediate) {
      this.dispatchMessage({ type, payload, priority });
    } else {
      const message: QueuedMessage<K> = { type, payload, priority };
      this.enqueueMessage(message);
    }
  }

  public on<K extends EventType>(
    type: K,
    handler: MessageHandler<K>,
    context?: any,
  ): void {
    this.addSubscription(type, handler, context, false);
  }

  public once<K extends EventType>(
    type: K,
    handler: MessageHandler<K>,
    context?: any,
  ): void {
    this.addSubscription(type, handler, context, true);
  }

  public off<K extends EventType>(type: K, handler: MessageHandler<K>): void {
    const subs = this.#subscriptions.get(type);
    if (subs) {
      this.#subscriptions.set(
        type,
        subs.filter((sub) => sub.handler !== handler),
      );
    }
  }

  /**
   * Processes messages per frame, adhering to the per-turn message limits.
   * Should be called during the application's update loop every frame.
   */
  public processMessagesPerFrame(): void {
    // Reset per-turn message counts at the beginning of each frame/turn
    this.resetPerTurnMessageCount();

    // Sort messages by priority (highest first)
    this.#messageQueue.sort((a, b) => b.priority - a.priority);

    // Process messages up to the limit per priority
    for (const priority of [
      EventPriority.HIGH,
      EventPriority.MEDIUM,
      EventPriority.LOW,
    ]) {
      let messagesToProcess =
        this.#config.messageLimits[priority] -
        this.#perTurnMessageCount.get(priority)!;

      const messagesOfPriority = this.#messageQueue
        .filter((msg) => msg.priority === priority)
        .slice(0, messagesToProcess);

      for (const message of messagesOfPriority) {
        this.dispatchMessage(message);
        this.#perTurnMessageCount.set(
          priority,
          this.#perTurnMessageCount.get(priority)! + 1,
        );

        // Remove the message from the queue
        this.#messageQueue.splice(this.#messageQueue.indexOf(message), 1);

        // Update messagesToProcess
        messagesToProcess--;
        if (messagesToProcess <= 0) {
          break;
        }
      }
    }
  }

  /**
   * Should be called at the end of each turn to reset per-turn message counts.
   */
  public endTurn(): void {
    this.resetPerTurnMessageCount();
  }

  private resetPerTurnMessageCount(): void {
    this.#perTurnMessageCount.set(EventPriority.HIGH, 0);
    this.#perTurnMessageCount.set(EventPriority.MEDIUM, 0);
    this.#perTurnMessageCount.set(EventPriority.LOW, 0);
  }

  private enqueueMessage<K extends EventType>(message: QueuedMessage<K>): void {
    this.#messageQueue.push(message);
  }

  private addSubscription<K extends EventType>(
    type: K,
    handler: MessageHandler<K>,
    context: any,
    once: boolean,
  ): void {
    const subs = this.#subscriptions.get(type) || [];
    subs.push({ handler, context, once });
    this.#subscriptions.set(type, subs);
  }

  private dispatchMessage<K extends EventType>(
    message: QueuedMessage<K>,
  ): void {
    const subs = this.#subscriptions.get(message.type);
    if (subs) {
      for (let i = 0; i < subs.length; i++) {
        const sub = subs[i]!;
        const { handler, context, once } = sub;

        try {
          handler.call(context, message.payload);
        } catch (error) {
          console.error(`Error in handler for event ${message.type}:`, error);
        }

        if (
          message.payload.isHandled() &&
          message.payload.shouldStopPropagation()
        ) {
          if (once) subs.splice(i, 1);
          break;
        }

        if (once) {
          subs.splice(i, 1);
          i--; // Adjust index after removal
        }
      }
    }
  }
}
