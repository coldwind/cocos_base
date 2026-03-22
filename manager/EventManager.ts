import { _decorator, EventTarget } from "cc";
const { ccclass } = _decorator;

@ccclass("EventManager")
export class EventManager {
  // 只用 Cocos 官方 EventTarget，稳定无坑
  private eventTarget: EventTarget = new EventTarget();

  /**
   * 监听事件
   * @param key 事件名
   * @param cb 回调
   * @param target 绑定对象（用于自动销毁）
   */
  on<T = any>(key: string, cb: (data: T) => void, target?: any) {
    this.eventTarget.on(key, cb, target);
  }

  /**
   * 只监听一次
   */
  once<T = any>(key: string, cb: (data: T) => void, target?: any) {
    this.eventTarget.once(key, cb, target);
  }

  /**
   * 发射事件
   */
  emit<T = any>(key: string, data?: T): void {
    try {
      this.eventTarget.emit(key, data);
    } catch (e) {
      console.error("[Event] emit error:", e);
    }
  }

  /**
   * 取消监听（非常重要！防内存泄漏）
   */
  off<T = any>(key: string, cb: (data: T) => void, target?: any) {
    this.eventTarget.off(key, cb, target);
  }

  /**
   * 销毁 target 相关所有监听（页面销毁时调用）
   */
  targetOff(target: any) {
    this.eventTarget.targetOff(target);
  }
}

export const YEventHandle = new EventManager();
