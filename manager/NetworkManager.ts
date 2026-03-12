import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NetworkManager')
export class NetworkManager {

    private domain: string = "http://localhost/";

    private headers: [string, string][] = [];

    public setHeaders(headers: [string, string][]) {
        this.headers = headers;
    }

    public setDomain(domain: string) {
        let char = domain.substring(domain.length - 1);
        console.log("setDomain", char);
        if (char != "/") {
            domain += "/";
        }
        this.domain = domain;
    }

    public async post(path: string, data: any): Promise<any> {
        let protocol = path.substring(0, 7);
        if (protocol != "http://" && protocol != "https:/") {
            path = `${this.domain}${path}`;
        }

        return new Promise<any>((resolve, reject) => {
            try {
                this.req(path, "POST", data, (data, error) => {
                    if (error != null) {
                        console.log("post error", error);
                        return resolve(null);
                    } else {
                        let jData = JSON.parse(data);
                        return resolve(jData);
                    }
                });
            } catch (e) {
                console.log("post error", e);
            }
        });
    }

    public async get(path: string, data?: any): Promise<any> {
        let protocol = path.substring(0, 7);
        console.log("protocol", protocol);
        if (protocol != "http://" && protocol != "https:/") {
            path = `${this.domain}${path}`;
        }

        return new Promise<any>((resolve, reject) => {
            try {
                this.req(path, "GET", data, (data, error) => {

                    if (error != null) {
                        console.log("post error", error);
                        return resolve(null);
                    } else {
                        let jData = JSON.parse(data);
                        return resolve(jData);
                    }
                });
            } catch (e) {
                console.log("post error", e);
            }
        });
    }

    public req(url: string, method: string, data: any, cb: (data: any, error: any) => void) {
        try {
            //新建Http
            let xhr = new XMLHttpRequest();
            //接收数据
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
                    var response = xhr.responseText;
                    if (!response) {
                        cb("", "response not found");
                        return;
                    }

                    cb(response, null);
                } else if (xhr.readyState == 4 && xhr.status == 500) {
                    var response = xhr.responseText;
                    cb(response, null)
                }
            };
            //错误处理
            xhr.onerror = function (evt) {
                console.log("onerror", evt);

                cb(null, evt);
            }
            //初始化一个请求，GET方式，true异步请求
            xhr.open(method, url, true);
            let contentType = "";

            if (this.headers.length > 0) {
                for (let header of this.headers) {
                    if (header[0].toLowerCase() == "content-type") {
                        contentType = header[1].toLowerCase();
                    }
                    xhr.setRequestHeader(header[0], header[1]);
                }
            }
            if (contentType == "") {
                contentType = "application/x-www-form-urlencoded";
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }

            let params = [];
            let sendData = "";
            if (data) {
                if (contentType == "application/x-www-form-urlencoded") {
                    Object.keys(data).forEach((key) => {
                        let value = data[key]
                        // 如果值为undefined我们将其置空
                        if (typeof value === 'undefined') {
                            value = ''
                        }
                        // 对于需要编码的文本（比如说中文）我们要进行编码
                        params.push([key, encodeURIComponent(value)].join('='))
                    });
                    sendData = params.join('&');
                } else if (contentType == "application/json") {
                    sendData = JSON.stringify(data);
                }
            }

            //发送请求
            xhr.send(sendData);
        } catch (e) {
            console.log("req error");
        }
    }
}

export const YNetworkHandle = new NetworkManager();