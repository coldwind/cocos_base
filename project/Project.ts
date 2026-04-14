import { _decorator, CCObject, Component, Enum, Prefab } from "cc";
import { YAudioHandle } from "../manager/AudioManager";
import { YPopupHandle } from "../manager/PopupManager";
import { YToastHandle } from "../manager/ToastManager";
import { Env, ProjectCfg } from "./ProjectCfg";
const { ccclass, property } = _decorator;

Enum(Env);

// 定义可序列化的环境配置类
@ccclass("EnvConfig")
class EnvConfig extends CCObject {
  @property({
    type: Env,
    displayName: "环境",
    tooltip: "环境",
  })
  env: Env = Env.DEV;

  @property({
    type: String,
    displayName: "HTTP接口",
    tooltip: "HTTP接口",
  })
  httpApi: string = "";

  @property({
    type: String,
    displayName: "WS接口",
    tooltip: "WS接口",
  })
  wsApi: string = "";
}

@ccclass("Project")
export class Project extends Component {
  @property({
    type: Env,
    displayName: "环境",
    tooltip: "环境",
  })
  env: Env = Env.DEV;

  @property({
    type: String,
    displayName: "版本号",
    tooltip: "版本号",
  })
  version: string = "1.0.0";

  @property({
    type: String,
    displayName: "游戏名称",
    tooltip: "游戏名称",
  })
  gameName: string = "游戏名称";

  @property({
    type: String,
    displayName: "语言",
    tooltip: "语言",
  })
  lang: string = "zh";

  @property({
    type: Prefab,
    displayName: "Popup Prefab",
    tooltip: "Popup Prefab",
  })
  popupPrefab: Prefab = null;

  @property({
    type: Prefab,
    displayName: "Toast Prefab",
    tooltip: "Toast Prefab",
  })
  toastPrefab: Prefab = null;

  @property({
    type: [EnvConfig],
    displayName: "环境接口",
    tooltip: "环境接口",
  })
  envApi: EnvConfig[] = [];

  async start() {
    ProjectCfg.env = this.env;
    ProjectCfg.version = this.version;
    ProjectCfg.gameName = this.gameName;
    ProjectCfg.lang = this.lang;
    ProjectCfg.httpApi =
      this.envApi.find((item) => item.env === this.env)?.httpApi || "";
    ProjectCfg.wsApi =
      this.envApi.find((item) => item.env === this.env)?.wsApi || "";

    // 初始化音频管理器
    YAudioHandle.init();

    // 初始化Popup管理器
    if (this.popupPrefab) {
      YPopupHandle.initByPrefab(this.popupPrefab);
    }

    // 初始化Toast管理器
    if (this.toastPrefab) {
      YToastHandle.initByPrefab(this.toastPrefab);
    }
  }
}
