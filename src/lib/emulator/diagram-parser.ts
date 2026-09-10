/**
 * Phân tích và quản lý sơ đồ mạch định dạng diagram.json (chuẩn tương thích Wokwi)
 */

export interface DiagramPart {
  type: string;
  id: string;
  top: number;
  left: number;
  attrs?: Record<string, any>;
}

export type DiagramConnection = [
  from: string, // ví dụ "bluepill:PC13"
  to: string, // ví dụ "led1:A"
  color: string, // ví dụ "green", "red", "black"
  instructions?: string[]
];

export interface DiagramSchema {
  version: number;
  author?: string;
  editor?: string;
  parts: DiagramPart[];
  connections: DiagramConnection[];
}

export const PRESET_DIAGRAMS: Record<string, DiagramSchema> = {
  default_stm32: {
    version: 1,
    author: "Embedded-AIoT Lab PTIT",
    editor: "wokwi",
    parts: [
      {
        type: "board-stm32-bluepill",
        id: "stm32",
        top: 0,
        left: 0,
        attrs: { builder: "platformio-stm32" },
      },
    ],
    connections: [],
  },

  blink_pc13: {
    version: 1,
    author: "Anderson Costa",
    editor: "wokwi",
    parts: [
      {
        type: "board-stm32-bluepill",
        id: "stm32",
        top: -39.76,
        left: -22.83,
        attrs: { builder: "platformio-stm32" },
      },
      {
        type: "wokwi-led",
        id: "led1",
        top: 140.4,
        left: 81,
        attrs: { color: "limegreen", flip: "1" },
      },
    ],
    connections: [
      ["stm32:A3", "$serialMonitor:TX", "green", []],
      ["stm32:A2", "$serialMonitor:RX", "green", []],
      ["led1:A", "stm32:C13", "green", ["v0"]],
      ["led1:C", "stm32:GND.1", "black", ["v37.5", "h-139.07", "v-38.4"]],
    ],
  },

  button_pc13: {
    version: 1,
    author: "Embedded-AIoT Lab PTIT",
    parts: [
      {
        type: "board-stm32-bluepill",
        id: "stm32",
        top: -39.76,
        left: -22.83,
        attrs: { builder: "platformio-stm32" },
      },
      {
        type: "wokwi-led",
        id: "led1",
        top: 140.4,
        left: 81,
        attrs: { color: "limegreen", flip: "1" },
      },
      {
        type: "wokwi-pushbutton",
        id: "btn1",
        top: 10,
        left: 100,
        attrs: { color: "red", label: "Button PB0" },
      },
    ],
    connections: [
      ["led1:A", "stm32:C13", "green", ["v0"]],
      ["led1:C", "stm32:GND.1", "black", ["v37.5", "h-139.07", "v-38.4"]],
      ["btn1:1.l", "stm32:B0", "orange", ["h-20", "v40"]],
      ["btn1:2.l", "stm32:GND.2", "black", ["h-20", "v-40"]],
    ],
  },

  stm32_oled: {
    version: 1,
    author: "Embedded-AIoT Lab PTIT",
    parts: [
      {
        type: "board-stm32-bluepill",
        id: "stm32",
        top: -39.76,
        left: -22.83,
        attrs: { builder: "platformio-stm32" },
      },
      {
        type: "wokwi-led",
        id: "led1",
        top: 140.4,
        left: 81,
        attrs: { color: "limegreen", flip: "1" },
      },
      {
        type: "wokwi-pushbutton",
        id: "btn1",
        top: 60,
        left: -120,
        attrs: { color: "green" },
      },
      {
        type: "board-ssd1306",
        id: "oled1",
        top: 140,
        left: -280,
        attrs: {},
      },
    ],
    connections: [
      ["stm32:A3", "$serialMonitor:TX", "green", []],
      ["stm32:A2", "$serialMonitor:RX", "green", []],
      ["led1:A", "stm32:C13", "green", ["v0"]],
      ["led1:C", "stm32:GND.1", "black", ["v37.5", "h-139.07", "v-38.4"]],
      ["btn1:1.l", "stm32:A0", "green", ["v0"]],
      ["btn1:2.l", "stm32:GND.2", "black", ["v0"]],
      ["oled1:VCC", "stm32:3V3", "red", ["v-20"]],
      ["oled1:GND", "stm32:GND.3", "black", ["v-10"]],
      ["oled1:SCL", "stm32:B6", "blue", ["v-30", "h40"]],
      ["oled1:SDA", "stm32:B7", "gold", ["v-40", "h50"]],
    ],
  },

  esp32_devkit: {
    version: 1,
    author: "Embedded-AIoT Lab PTIT",
    parts: [
      {
        type: "board-esp32-devkit-c-v4",
        id: "esp",
        top: 0,
        left: 0,
        attrs: { env: "arduino" },
      },
      {
        type: "wokwi-led",
        id: "led1",
        top: -60,
        left: 120,
        attrs: { color: "red" },
      },
      {
        type: "wokwi-pushbutton",
        id: "btn1",
        top: 80,
        left: 120,
        attrs: { color: "blue", label: "Button IO4" },
      },
    ],
    connections: [
      ["esp:TX", "$serialMonitor:RX", "", []],
      ["esp:RX", "$serialMonitor:TX", "", []],
      ["led1:A", "esp:2", "red", ["v0"]],
      ["led1:C", "esp:GND.1", "black", ["v20", "h-40"]],
      ["btn1:1.l", "esp:4", "orange", ["v0"]],
      ["btn1:2.l", "esp:GND.1", "black", ["v20", "h-40"]],
    ],
  },

  arduino_uno_lcd: {
    version: 1,
    author: "Embedded-AIoT Lab PTIT",
    parts: [
      {
        type: "wokwi-arduino-uno",
        id: "uno",
        top: 0,
        left: 0,
        attrs: {},
      },
      {
        type: "wokwi-lcd1602",
        id: "lcd1",
        top: -160,
        left: 0,
        attrs: { pins: "i2c" },
      },
    ],
    connections: [
      ["uno:A4", "lcd1:SDA", "gold", ["v-30"]],
      ["uno:A5", "lcd1:SCL", "blue", ["v-40"]],
      ["uno:5V", "lcd1:VCC", "red", ["v-50"]],
      ["uno:GND.1", "lcd1:GND", "black", ["v-60"]],
    ],
  },

  pico_rp2040: {
    version: 1,
    author: "Embedded-AIoT Lab PTIT",
    parts: [
      {
        type: "board-pi-pico",
        id: "pico",
        top: 0,
        left: 0,
        attrs: {},
      },
      {
        type: "wokwi-led",
        id: "led1",
        top: 30,
        left: 90,
        attrs: { color: "cyan" },
      },
    ],
    connections: [
      ["pico:GP25", "led1:A", "cyan", ["v0"]],
      ["pico:GND.1", "led1:C", "black", ["v20", "h-20"]],
    ],
  },
};

export function parseDiagram(jsonString: string): DiagramSchema {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.parts || !Array.isArray(parsed.parts)) {
      throw new Error("diagram.json thiếu trường 'parts' (danh sách linh kiện)");
    }
    if (!parsed.connections || !Array.isArray(parsed.connections)) {
      parsed.connections = [];
    }
    return parsed as DiagramSchema;
  } catch (err: any) {
    throw new Error(`Lỗi cú pháp diagram.json: ${err.message}`);
  }
}
