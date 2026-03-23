import { _decorator, Component } from "cc";
import { YPopupHandle } from "./PopupManager";
const { ccclass, property } = _decorator;

@ccclass("PopupBase")
export class PopupBase extends Component {
  protected popupInitData: any = null;

  public setInitData(data: any) {
    this.popupInitData = data;
  }

  public getInitData(): any {
    return this.popupInitData;
  }

  public onClickClose() {
    YPopupHandle.close();
  }
}
