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
  // forever?: boolean; // 是否只打开一个界面
  style?: PopupStyle;
  time?: number; // 响应时间
}

interface IYPopupItem {
  node: Node;
  maskBg: Node;
  content: Node;
}

@ccclass("PopupManager")
export class PopupManager {
  private static handle: PopupManager = new PopupManager();
  // private parentNode: Node = null;
  // private maskBg: Node = null;
  // private content: Node = null;
  // private forever: boolean = false;
  private pfb: Prefab = null;
  private pannelPool: IYPopupItem[] = [];

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

  public async initByPrefab(prefab: Prefab) {
    if (this.pfb == null) {
      this.pfb = prefab;
    }
  }

  private async getParentNode() {
    let parentNode = instantiate(this.pfb);
    let maskBg = find("mask", parentNode);
    // 默认将mask先隐藏
    maskBg.active = false;
    let content = find("content", parentNode);
    let root = find("/Canvas");
    root.addChild(parentNode);
    let parentContentSize = parentNode.getComponent(UITransform).contentSize;
    content.getComponent(UITransform).setContentSize(parentContentSize);
    this.pannelPool.push({
      node: parentNode,
      maskBg: maskBg,
      content: content,
    });
  }

  async open(bundle: string, path: string, data?: IYPopupOption) {
    try {
      await this.getParentNode();
      let currentNode = this.pannelPool[this.pannelPool.length - 1];

      let pfb = await YResHandle.loadPrefab(bundle, path);
      let node = instantiate(pfb);
      if (!node || !pfb) {
        return;
      }
      if (data) {
        if ("showMask" in data && data.showMask === false) {
          currentNode.maskBg.active = false;
        } else {
          currentNode.maskBg.active = true;
        }

        if ("data" in data) {
          let popupBase = node.getComponent(PopupBase);
          if (popupBase) {
            popupBase.setInitData(data.data);
          }
        }
      } else {
        currentNode.maskBg.active = true;
      }
      currentNode.content.addChild(node);
      currentNode.node.setSiblingIndex(128);

      if (data) {
        const t = data.time ?? 0.3;

        if ("style" in data) {
          let designWidth = view.getDesignResolutionSize().width;
          let contentWidth =
            currentNode.content.getComponent(UITransform).width;
          let designHeight = view.getDesignResolutionSize().height;
          let contentHeight =
            currentNode.content.getComponent(UITransform).height;

          switch (data.style) {
            case PopupStyle.None:
              currentNode.content.setScale(1, 1, 1);
              break;

            case PopupStyle.Scale:
              currentNode.content.setScale(0, 0, 0);
              if (!currentNode.content.getComponent(UIOpacity)) {
                currentNode.content.addComponent(UIOpacity);
              }
              currentNode.content.getComponent(UIOpacity).opacity = 0;
              let backInTween = tween(currentNode.content).to(t, {
                scale: new Vec3(1, 1, 1),
              });
              let opacityTween = tween(
                currentNode.content.getComponent(UIOpacity),
              ).to(t, { opacity: 255 });
              tween(currentNode.content)
                .parallel(backInTween, opacityTween)
                .start();
              break;

            case PopupStyle.Fade:
              let uiopacity = currentNode.content.getComponent(UIOpacity);
              if (!uiopacity) {
                uiopacity = currentNode.content.addComponent(UIOpacity);
              }
              tween(uiopacity).to(t, { opacity: 255 }).start();
              break;

            case PopupStyle.Left:
              let leftX = -(contentWidth / 2 + designWidth / 2);
              currentNode.content.setPosition(
                new Vec3(
                  leftX,
                  currentNode.content.position.y,
                  currentNode.content.position.z,
                ),
              );
              tween(currentNode.content)
                .to(t, {
                  position: new Vec3(0, 0, currentNode.content.position.z),
                })
                .start();
              break;

            case PopupStyle.Right:
              let rightX = contentWidth / 2 + designWidth / 2;
              currentNode.content.setPosition(
                new Vec3(
                  rightX,
                  currentNode.content.position.y,
                  currentNode.content.position.z,
                ),
              );
              tween(currentNode.content)
                .to(t, {
                  position: new Vec3(0, 0, currentNode.content.position.z),
                })
                .start();
              break;

            case PopupStyle.Top:
              let topY = contentHeight / 2 + designHeight / 2;
              currentNode.content.setPosition(
                new Vec3(
                  currentNode.content.position.x,
                  topY,
                  currentNode.content.position.z,
                ),
              );
              tween(currentNode.content)
                .to(t, {
                  position: new Vec3(0, 0, currentNode.content.position.z),
                })
                .start();
              break;

            case PopupStyle.Bottom:
              let bottomY = -(contentHeight / 2 + designHeight / 2);
              currentNode.content.setPosition(
                new Vec3(
                  currentNode.content.position.x,
                  bottomY,
                  currentNode.content.position.z,
                ),
              );
              tween(currentNode.content)
                .to(t, {
                  position: new Vec3(0, 0, currentNode.content.position.z),
                })
                .start();
              break;
          }
        } else {
          currentNode.content.setScale(1, 1, 1);
        }
      }
    } catch (e) {
      console.log("open error", e);
    }
  }

  close(data?: IYPopupOption) {
    let currentNode = this.pannelPool[this.pannelPool.length - 1];

    currentNode.maskBg.active = false;
    if (data) {
      const t = data.time ?? 0.3;

      if ("style" in data) {
        let designWidth = view.getDesignResolutionSize().width;
        let contentWidth = currentNode.content.getComponent(UITransform).width;
        let designHeight = view.getDesignResolutionSize().height;
        let contentHeight =
          currentNode.content.getComponent(UITransform).height;

        switch (data.style) {
          case PopupStyle.None:
            this.clean();
            break;

          case PopupStyle.Scale:
            tween(currentNode.content)
              .to(t, { scale: new Vec3(0, 0, 0) })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Fade:
            let uiopacity = currentNode.content.getComponent(UIOpacity);
            if (!uiopacity) {
              uiopacity = currentNode.content.addComponent(UIOpacity);
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
            tween(currentNode.content)
              .to(t, {
                position: new Vec3(leftX, 0, currentNode.content.position.z),
              })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Right:
            let rightX = contentWidth / 2 + designWidth / 2;
            tween(currentNode.content)
              .to(t, {
                position: new Vec3(rightX, 0, currentNode.content.position.z),
              })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Top:
            let topY = contentHeight / 2 + designHeight / 2;
            tween(currentNode.content)
              .to(t, {
                position: new Vec3(0, topY, currentNode.content.position.z),
              })
              .call(() => {
                this.clean();
              })
              .start();
            break;

          case PopupStyle.Bottom:
            let bottomY = -(contentHeight / 2 + designHeight / 2);
            tween(currentNode.content)
              .to(t, {
                position: new Vec3(0, bottomY, currentNode.content.position.z),
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
    let currentNode = this.pannelPool[this.pannelPool.length - 1];
    currentNode.node.destroy();
    this.pannelPool.pop();
  }
}

export const YPopupHandle = new PopupManager();
