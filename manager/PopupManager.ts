import { _decorator, Color, Component, find, instantiate, Node, Prefab, Sprite, tween, UIOpacity, UITransform, Vec3, Widget } from 'cc';
import { YResHandle } from './ResManager';
import { PopupBase } from './PopupBase';
const { ccclass, property } = _decorator;

interface IYPopupOption {
    showMask?: boolean;
    data?: any;
    forever?: boolean;
}

@ccclass('PopupManager')
export class PopupManager extends Component {

    private parentNode: Node = null;
    private maskBg: Node = null;
    private content: Node = null;
    private forever: boolean = false;
    private pfb: Prefab = null;

    private async Init(bundle:string, path:string) {
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
            let parentContentSize = this.parentNode.getComponent(UITransform).contentSize;
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
            this.content.setScale(0.8, 0.8, 0.8);
            this.content.addChild(node);
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
                    this.forever = data.forever;
                }
            } else {
                this.maskBg.active = true;
            }
            this.parentNode.setSiblingIndex(128);
            tween(this.content).to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: "backIn" }).start();
        } catch (e) {
            console.log("open error", e);
        }

    }

    close() {
        this.parentNode.active = false;
        this.maskBg.active = false;
        this.forever = false;
        this.content.removeAllChildren();
    }
}

export const YPopupHandle = new PopupManager();