import { _decorator } from "cc";
import { YToastHandle } from "./ToastManager";
const { ccclass, property } = _decorator;

export interface ReqData {
  ok: boolean;
  res: any;
  err: Error;
}

export interface WSMessage {
  data: any;
  error?: Error;
  type: "message" | "error" | "close" | "open" | "retry";
}

export interface WSConnection {
  ws: WebSocket;
  close: () => void;
}

@ccclass("NetworkManager")
export class NetworkManager {
  private domain: string = "http://localhost/";
  private headers: [string, string][] = [];

  /** 设置请求头 */
  public setHeaders(headers: [string, string][]) {
    this.headers = [...headers];
  }

  /** 设置域名，自动补全末尾 / */
  public setDomain(domain: string) {
    if (!domain.endsWith("/")) {
      domain += "/";
    }
    this.domain = domain;
  }

  /** POST 请求 */
  public async post(path: string, data: any): Promise<ReqData> {
    const url = this.buildUrl(path);
    return this.requestPromise(url, "POST", data);
  }

  /** GET 请求 */
  public async get(path: string, data?: any): Promise<ReqData> {
    let url = this.buildUrl(path);
    if (data) {
      let params = [];
      for (let k in data) {
        params.push(`${k}=${data[k]}`);
      }
      url += "?" + params.join("&");
    }
    return this.requestPromise(url, "GET", null);
  }

  /** WebSocket 连接 */
  public connectWebSocket(
    wsUrl: string,
    callback: (msg: WSMessage) => void,
    retryCount: number = 0,
  ): WSConnection {
    let currentWs: WebSocket | null = null;
    let retriesLeft = retryCount;
    let isManualClose = false;

    const connect = () => {
      currentWs = new WebSocket(wsUrl);

      currentWs.onopen = () => {
        retriesLeft = retryCount;
        callback({ data: null, type: "open" });
      };

      currentWs.onmessage = (event) => {
        try {
          const data = event.data;
          const parsedData = typeof data === "string" ? JSON.parse(data) : data;
          callback({ data: parsedData, type: "message" });
        } catch (e) {
          callback({ data: event.data, type: "message" });
        }
      };

      currentWs.onerror = (event) => {
        const err = new Error("WebSocket 连接错误");
        console.error("WebSocket error:", event);
        callback({ data: null, error: err, type: "error" });
      };

      currentWs.onclose = (event) => {
        if (isManualClose) {
          const err = new Error(
            `WebSocket 连接关闭: code=${event.code}, reason=${event.reason}`,
          );
          callback({ data: null, error: err, type: "close" });
          return;
        }

        if (retriesLeft > 0) {
          retriesLeft--;
          const err = new Error(
            `WebSocket 连接断开，正在重试(${retryCount - retriesLeft}/${retryCount})`,
          );
          callback({ data: null, error: err, type: "retry" });
          setTimeout(connect, 1000);
        } else {
          const err = new Error(
            `WebSocket 连接关闭: code=${event.code}, reason=${event.reason}`,
          );
          callback({ data: null, error: err, type: "close" });
        }
      };
    };

    connect();

    return {
      ws: currentWs!,
      close: () => {
        isManualClose = true;
        if (currentWs) {
          currentWs.close();
        }
      },
    };
  }

  // ==============================================
  // 内部工具方法
  // ==============================================

  /** 构建最终请求 URL */
  private buildUrl(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return this.domain + path;
  }

  /**
   * 核心：将 XMLHttpRequest 包装为标准 Promise
   */
  private requestPromise(
    url: string,
    method: string,
    data: any,
  ): Promise<ReqData> {
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        // 挂载请求头
        let contentType = "";
        for (const [key, val] of this.headers) {
          if (key.toLowerCase() === "content-type") {
            contentType = val.toLowerCase();
          }
          xhr.setRequestHeader(key, val);
        }

        // 默认 Content-Type
        if (!contentType) {
          contentType = "application/x-www-form-urlencoded";
          xhr.setRequestHeader("Content-Type", contentType);
        }

        // 处理请求数据
        let sendData: string | FormData = "";
        if (data) {
          if (contentType === "application/x-www-form-urlencoded") {
            const params = new URLSearchParams();
            for (const key in data) {
              params.append(key, data[key] ?? "");
            }
            sendData = params.toString();
          } else if (contentType === "application/json") {
            sendData = JSON.stringify(data);
          }
        }

        // 请求完成
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = xhr.responseText;
              const json = res ? JSON.parse(res) : {};
              resolve({ ok: true, res: json, err: null });
            } catch (e) {
              YToastHandle.show("JSON 解析失败");
              resolve({ ok: false, res: null, err: e });
            }
          } else {
            YToastHandle.show("网络请求失败");
            const err = new Error(`请求失败 ${xhr.status}`);
            console.error(err.message);
            resolve({ ok: false, res: null, err: err });
          }
        };

        // 请求异常
        xhr.onerror = () => {
          const err = new Error("网络请求异常");
          console.error(err.message);
          reject(err);
        };

        // 超时
        xhr.ontimeout = () => {
          YToastHandle.show("请求超时");
          const err = new Error("请求超时");
          console.error(err.message);
          resolve({ ok: false, res: null, err: err });
        };

        // 发送
        xhr.send(sendData);
      } catch (e) {
        console.error("requestPromise 异常:", e);
        reject(e);
      }
    });
  }

  /** 废弃旧方法，保留兼容 */
}

export const YNetworkHandle = new NetworkManager();
