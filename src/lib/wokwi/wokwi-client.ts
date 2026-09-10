// SPDX-License-Identifier: MIT
// Wokwi Client implementation for Wokwi Embed API

import { byteArrayToBase64, base64ToByteArray } from "./base64";
import { MessagePortTransport } from "./message-port-transport";

export interface IEventData {
  name: string;
  nanos: number;
  paused: boolean;
}

export interface SimStatusResult {
  running: boolean;
  nanos: number;
}

export class WokwiClient extends EventTarget {
  private lastId = 0;
  private pendingCommands = new Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void }
  >();

  constructor(public readonly transport: MessagePortTransport) {
    super();
    this.transport.onMessage = (message: any) => {
      this.processMessage(message);
    };
  }

  private processMessage(message: any): void {
    if (!message || typeof message !== "object") return;

    if (message.type === "hello") {
      this.dispatchEvent(new CustomEvent("wokwi:connected", { detail: message }));
      return;
    }

    if (message.type === "event") {
      const eventData: IEventData = {
        name: message.event,
        nanos: message.nanos,
        paused: message.paused,
      };
      this.dispatchEvent(
        new CustomEvent(message.event, {
          detail: { ...message.payload, ...eventData },
        })
      );
      return;
    }

    if (message.type === "response" && message.id) {
      const pending = this.pendingCommands.get(message.id);
      if (pending) {
        this.pendingCommands.delete(message.id);
        if (message.error) {
          pending.reject(new Error(message.result?.message || "Lỗi Wokwi API"));
        } else {
          pending.resolve(message.result);
        }
      }
    }
  }

  public sendCommand<T = any>(command: string, params: any = {}): Promise<T> {
    const id = `cmd_${++this.lastId}`;
    return new Promise<T>((resolve, reject) => {
      this.pendingCommands.set(id, { resolve, reject });
      this.transport.send({
        type: "command",
        command,
        params,
        id,
      });
    });
  }

  /**
   * Tải file lên môi trường giả lập (diagram.json, file code C/Python hoặc firmware .hex/.bin)
   */
  public async fileUpload(name: string, content: string | ArrayBuffer | Uint8Array): Promise<void> {
    if (typeof content === "string") {
      return this.sendCommand("file:upload", { name, text: content });
    } else {
      return this.sendCommand("file:upload", {
        name,
        binary: byteArrayToBase64(content),
      });
    }
  }

  /**
   * Tải file từ simulator về
   */
  public async fileDownload(name: string): Promise<string | Uint8Array> {
    const result = await this.sendCommand("file:download", { name });
    if (typeof result.text === "string") {
      return result.text;
    } else {
      return base64ToByteArray(result.binary);
    }
  }

  /**
   * Bắt đầu phiên mô phỏng với firmware chỉ định
   */
  public async simStart(params: { firmware: string; elf?: string }): Promise<void> {
    return this.sendCommand("sim:start", params);
  }

  public async simPause(): Promise<void> {
    return this.sendCommand("sim:pause");
  }

  public async simResume(pauseAfter?: number): Promise<void> {
    return this.sendCommand("sim:resume", { pauseAfter });
  }

  public async simRestart(opts: { pause?: boolean } = {}): Promise<void> {
    return this.sendCommand("sim:restart", opts);
  }

  public async simStatus(): Promise<SimStatusResult> {
    return this.sendCommand("sim:status");
  }

  /**
   * Đăng ký lắng nghe kênh dữ liệu Serial Monitor (UART)
   */
  public async serialMonitorListen(): Promise<void> {
    return this.sendCommand("serial-monitor:listen");
  }

  /**
   * Gửi dữ liệu bàn phím/ký tự vào UART của vi điều khiển
   */
  public async serialMonitorWrite(bytes: number[] | Uint8Array): Promise<void> {
    return this.sendCommand("serial-monitor:write", { bytes: Array.from(bytes) });
  }

  public async gpioList(): Promise<{ pins: string[] }> {
    return this.sendCommand("gpio:list");
  }

  public async gpioWrite(pin: string, value: boolean): Promise<void> {
    return this.sendCommand("gpio:write", { pin, value });
  }

  public async gpioRead(pin: string): Promise<{ value: boolean }> {
    return this.sendCommand("gpio:read", { pin });
  }
}
