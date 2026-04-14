import {
  _decorator,
  find,
  instantiate,
  Label,
  Prefab,
  tween,
  UIOpacity,
  Vec3,
} from "cc";
import { YResHandle } from "./ResManager";
const { ccclass, property } = _decorator;

export enum ToastStyle {
  Vertical,
  Fade,
}

interface IYToastOption {
  style?: ToastStyle;
  time?: number; // 响应时间
}

@ccclass("ToastManager")
export class ToastManager {
  private static handle: ToastManager = new ToastManager();
  // private parentNode: Node = null;
  // private maskBg: Node = null;
  // private content: Node = null;
  // private forever: boolean = false;
  private pfb: Prefab = null;

  public static inst(): ToastManager {
    if (ToastManager.handle == null) {
      this.handle = new ToastManager();
    }

    return this.handle;
  }

  // 初始化时指定该项目的弹窗基本结构prefab
  public async init(bundle: string, path: string) {
    if (this.pfb == null) {
      this.pfb = await YResHandle.loadPrefab(bundle, path);
    }
  }

  public async initByPrefab(prefab: Prefab) {
    if (this.pfb == null) {
      this.pfb = prefab;
    }
  }

  async show(txt: string, data?: IYToastOption) {
    try {
      let toastNode = instantiate(this.pfb);
      let content = find("content", toastNode);
      let contentLabel = content.getComponent(Label);
      if (!contentLabel) {
        contentLabel = content.addComponent(Label);
      }
      contentLabel.string = txt;
      toastNode.active = false;

      let root = find("/Canvas");
      root.addChild(toastNode);

      let t = 1;
      if (data && "time" in data) {
        t = data.time;
      }

      if (data && "style" in data) {
        switch (data.style) {
          case ToastStyle.Vertical:
            toastNode.setPosition(0, -50, 0);
            toastNode.active = true;
            tween(toastNode)
              .to(t, {
                position: new Vec3(0, 50, 0),
              })
              .call(() => {
                root.removeChild(toastNode);
              })
              .start();
            break;

          case ToastStyle.Fade:
            let uiopacity = toastNode.getComponent(UIOpacity);
            if (!uiopacity) {
              uiopacity = toastNode.addComponent(UIOpacity);
            }
            tween(uiopacity)
              .to(t / 2, { opacity: 255 })
              .to(t / 2, { opacity: 0 })
              .call(() => {
                root.removeChild(toastNode);
              })
              .start();
            break;
        }
      } else {
        toastNode.setPosition(0, -50, 0);
        toastNode.active = true;
        tween(toastNode)
          .to(t, {
            position: new Vec3(0, 50, 0),
          })
          .call(() => {
            root.removeChild(toastNode);
          })
          .start();
      }
    } catch (e) {
      console.log("open error", e);
    }
  }
}

export const YToastHandle = new ToastManager();
