// SPDX-License-Identifier: MIT
// MessagePort Transport wrapper for bidirectional postMessage communication with Wokwi

export class MessagePortTransport {
  public onMessage: (message: any) => void = () => {};

  constructor(public readonly port: MessagePort) {
    this.port.onmessage = (event: MessageEvent) => {
      this.onMessage(event.data);
    };
    this.port.start();
  }

  public send(message: any): void {
    this.port.postMessage(message);
  }

  public close(): void {
    this.port.close();
  }
}
