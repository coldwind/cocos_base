import { _decorator, Component, EventTarget, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('EventManager')
export class EventManager {
  private eventPool: Map<string, ((data: any) => void)[]> = new Map<string, ((data: any) => void)[]>();
  private eventTarget: EventTarget = new EventTarget();

  on(key: string, fn: (data) => void) {
    this.eventTarget.on(key, fn);
  }

  emit(key: string, args?: any): void {
    try {
      this.eventTarget.emit(key, args);
    } catch (e) {
      console.error("emit call error", e);
    }
  }
}

export const YEventHandle = new EventManager();