import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupBase')
export class PopupBase extends Component {
    protected popupInitData: any = null;

    public setInitData(data: any) {
        this.popupInitData = data;
    }

    public getInitData(): any {
        return this.popupInitData;
    }
}


