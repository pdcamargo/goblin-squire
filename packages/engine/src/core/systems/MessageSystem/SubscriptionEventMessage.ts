// SubscriptionEventMessage.ts
interface MarkAsHandledProps {
  stopPropagation?: boolean;
}

export class SubscriptionEventMessage<T = any> {
  public readonly owner?: any;
  public readonly data?: T;
  public readonly createdAt: Date;
  private handled: boolean;
  private stopPropagationFlag: boolean;

  constructor(owner?: any, data?: T) {
    this.owner = owner;
    this.data = data;
    this.createdAt = new Date();
    this.handled = false;
    this.stopPropagationFlag = false;
  }

  public isHandled(): boolean {
    return this.handled;
  }

  public markAsHandled(props?: MarkAsHandledProps): void {
    this.handled = true;
    if (props?.stopPropagation) {
      this.stopPropagationFlag = true;
    }
  }

  public shouldStopPropagation(): boolean {
    return this.stopPropagationFlag;
  }
}
