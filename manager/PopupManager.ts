import {
    _decorator,
    find,
    instantiate,
    Node,
    Prefab,
    tween,
    UIOpacity,
    UITransform,
    Vec3,
    view,
} from "cc";
import { PopupBase } from "./PopupBase";
import { YResHandle } from "./ResManager";
const { ccclass, property } = _decorator;

export enum PopupStyle {
  None,
  Scale,
  Fade,
  Left,
  Right,
  Top,
  Bottom,
}

interface IYPopupOption {
  showMask?: boolean; // 是否显示
  data?: any;
  forever?: boolean; // 是否只打开一个界面
  style?: PopupStyle;
  time?: number; // 响应时间
}

@ccclass("PopupManager")
export class PopupManager {
  private static handle: PopupManager = new PopupManager();
  private parentNode: Node = null;
  private maskBg: Node = null;
  private content: Node = null;
  private forever: boolean = false;
  private pfb: Prefab = null;

  public static inst(): PopupManager {
    if (PopupManager.handle == null) {
      this.handle = new PopupManager();
    }

    return this.handle;
  }

  // 初始化时指定该项目的弹窗基本结构prefab
  public async init(bundle: string, path: string) {
    if (this.pfb == null) {
      this.pfb = await YResHandle.loadPrefab(bundle, path);
    }
  }

  private async getParentNode() {
    if (this.parentNode == null || !this.parentNode.isValid) {
      this.parentNode = instantiate(this.pfb);
      this.maskBg = find("mask", this.parentNode);
      this.content = find("content", this.parentNode);
      console.log("content", this.content);
      let root = find("/Canvas");
      root.addChild(this.parentNode);
      let parentContentSize =
        this.parentNode.getComponent(UITransform).contentSize;
      this.content.getComponent(UITransform).setContentSize(parentContentSize);
    } else {
      this.parentNode.active = true;
    }
  }

  async open(bundle: string, path: string, data?: IYPopupOption) {
    try {
      if (this.forever) {
        return;
      }
      await this.getParentNode();

      let pfb = await YResHandle.loadPrefab(bundle, path);
      let node = instantiate(pfb);
      if (!node || !pfb) {
        return;
      }
      if (data) {
        if ("showMask" in data && data.showMask === false) {
          this.maskBg.active = false;
        } else {
          this.maskBg.active = true;
        }

        if ("data" in data) {
          let popupBase = node.getComponent(PopupBase);
          if (popupBase) {
            popupBase.setInitData(data.data);
          }
        }

        if ("forever" in data) {
          if (data.forever == true) {
            this.forever = true;
          }
        }
      } else {
        this.maskBg.active = true;
      }
      this.content.addChild(node);
      this.parentNode.setSiblingIndex(128);

      if (data) {
        let t = 0.3;
        if ("time" in data) {
          t = data.time;
        }

        if ("style" in data) {
          this.maskBg.active = false;
          let designWidth = view.getDesignResolutionSize().width;
          let contentWidth = this.content.getComponent(UITransform).width;
          let designHeight = view.getDesignResolutionSize().height;
          let contentHeight = this.content.getComponent(UITransform).height;

          switch (data.style) {
            case PopupStyle.None:
              this.content.setScale(1, 1, 1);
              break;

            case PopupStyle.Scale:
              this.content.setScale(0, 0, 0);
              if (!this.content.getComponent(UIOpacity)) {
                this.content.addComponent(UIOpacity);
              }
              this.content.getComponent(UIOpacity).opacity = 0;
              let backInTween = tween(this.content).to(t, {
                scale: new Vec3(1, 1, 1),
              });
              let opacityTween = tween(this.content.getComponent(UIOpacity)).to(
                t,
                { opacity: 255 },
              );
              tween(this.content).parallel(backInTween, opacityTween).start();
              break;

            case PopupStyle.Fade:
              let uiopacity = this.content.getComponent(UIOpacity);
              if (!uiopacity) {
                uiopacity = this.content.addComponent(UIOpacity);
              }
              tween(uiopacity).to(t, { opacity: 255 }).start();
              break;

            case PopupStyle.Left:
              let leftX = -(contentWidth / 2 + designWidth / 2);
              this.content.setPosition(
                new Vec3(
                  leftX,
                  this.content.position.y,
                  this.content.position.z,
                ),
              );
              tween(this.content)
                .to(t, {
                  position: new Vec3(0, 0, this.content.position.z),
                })
                .start();
              break;

            case PopupStyle.Right:
              let rightX = contentWidth / 2 + designWidth / 2;
              this.content.setPosition(
                new Vec3(
                  rightX,
                  this.content.position.y,
                  this.content.position.z,
                ),
              );
              tween(this.content)
                .to(t, {
                  position: new Vec3(0, 0, this.content.position.z),
                })
                .start();
              break;

            case PopupStyle.Top:
              let topY = contentHeight / 2 + designHeight / 2;
              this.content.setPosition(
                new Vec3(
                  this.content.position.x,
                  topY,
                  this.content.position.z,
                ),
              );
              tween(this.content)
                .to(t, {
                  position: new Vec3(0, 0, this.content.position.z),
                })
                .start();
              break;

            case PopupStyle.Bottom:
              let bottomY = -(contentHeight / 2 + designHeight / 2);
              this.content.setPosition(
                new Vec3(
                  this.content.position.x,
                  bottomY,
                  this.content.position.z,
                ),
              );
              tween(this.content)
                .to(t, {
                  position: new Vec3(0, 0, this.content.position.z),
                })
                .start();
              break;
          }
        } else {
          this.content.setScale(1, 1, 1);
        }
      }
    } catch (e) {
      console.log("open error", e);
    }
  }

  close(data?: IYPopupOption) {
    this.maskBg.active = false;
    if (data) {
      let t = 0.3;
      if ("time" in data) {
        t = data.time;
      }

      if ("style" in data) {
        let designWidth = view.getDesignResolutionSize().width;
        let contentWidth = this.content.getComponent(UITransform).width;
        let designHeight = view.getDesignResolutionSize().height;
        let contentHeight = this.content.getComponent(UITransform).height;

        switch (data.style) {
          case PopupStyle.None:
            this.clean();
            break;

          case PopupStyle.Scale:
            tween(this.content)
              .to(t, { scale: new Vec3(0, 0, 0) })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Fade:
            let uiopacity = this.content.getComponent(UIOpacity);
            if (!uiopacity) {
              uiopacity = this.content.addComponent(UIOpacity);
            }
            tween(uiopacity)
              .to(t, { opacity: 0 })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Left:
            let leftX = -(contentWidth / 2 + designWidth / 2);
            tween(this.content)
              .to(t, {
                position: new Vec3(leftX, 0, this.content.position.z),
              })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Right:
            let rightX = contentWidth / 2 + designWidth / 2;
            tween(this.content)
              .to(t, {
                position: new Vec3(rightX, 0, this.content.position.z),
              })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Top:
            let topY = contentHeight / 2 + designHeight / 2;
            tween(this.content)
              .to(t, {
                position: new Vec3(0, topY, this.content.position.z),
              })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Bottom:
            let bottomY = -(contentHeight / 2 + designHeight / 2);
            tween(this.content)
              .to(t, {
                position: new Vec3(0, bottomY, this.content.position.z),
              })
              .call(() => {
                this.clean();
              })
              .start();
            break;
        }
      } else {
        this.clean();
      }
    } else {
      this.clean();
    }
  }

  clean() {
    this.parentNode.active = false;
    this.maskBg.active = false;
    this.forever = false;
    this.content.removeAllChildren();
    this.content.setPosition(0, 0, 0);
  }
}

export const YPopupHandle = new PopupManager();
