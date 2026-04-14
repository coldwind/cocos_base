export enum Env {
  DEV = "DEV",
  TEST = "TEST",
  PROD = "PROD",
}

export interface IProjectCfg {
  /**
   * 环境
   */
  env: Env;
  /**
   * 版本号
   */
  version: string;
  /**
   * 游戏名称
   */
  gameName: string;
  /**
   * 语言
   */
  lang: string;

  /**
   * HTTP接口
   */
  httpApi: string;

  /**
   * WS接口
   */
  wsApi: string;
}

export const ProjectCfg: IProjectCfg = {
  env: Env.DEV,
  version: "1.0.0",
  gameName: "游戏名称",
  lang: "zh",
  httpApi: "http://localhost:8820",
  wsApi: "ws://localhost:8821",
};

export class ProjectCfgClass {
  get httpApi() {
    return ProjectCfg.httpApi;
  }

  get wsApi() {
    return ProjectCfg.wsApi;
  }

  get env() {
    return ProjectCfg.env;
  }

  get version() {
    return ProjectCfg.version;
  }

  get gameName() {
    return ProjectCfg.gameName;
  }

  get lang() {
    return ProjectCfg.lang;
  }
}

export const YProjCfg = new ProjectCfgClass();
