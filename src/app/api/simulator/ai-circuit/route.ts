import { NextRequest, NextResponse } from "next/server";
import { DiagramSchema } from "@/lib/emulator/diagram-parser";

const NINEROUTER_API_BASE_URL = process.env.NINEROUTER_API_BASE_URL;
const NINEROUTER_API_KEY = process.env.NINEROUTER_API_KEY;
const NINEROUTER_MODEL = process.env.NINEROUTER_MODEL || "Kiro";

const SYSTEM_PROMPT = `Bạn là kỹ sư phần cứng chuyên gia thiết kế mạch điện tử cho hệ thống Wokwi Simulator.
Nhiệm vụ của bạn là nhận mô tả yêu cầu bằng ngôn ngữ tự nhiên và thiết kế sơ đồ mạch hoàn chỉnh dưới dạng Wokwi \`diagram.json\`.

TUYỆT ĐỐI TUÂN THỦ CÁC QUY CHUẨN SAU:

0. NGUYÊN TẮC HIỂU NGỮ CẢNH VÀ KẾ THỪA TRẠNG THÁI MẠCH (Context Awareness):
- Bạn luôn được cung cấp thông tin [TRẠNG THÁI MẠCH HIỆN TẠI TRÊN BÀN MÔ PHỎNG].
- Nếu mạch hiện tại ĐÃ CÓ vi điều khiển (ví dụ "board-stm32-bluepill" ID "stm32" tại top: 0, left: 0), BẮT BUỘC PHẢI TẬN DỤNG vi điều khiển này, TUYỆT ĐỐI KHÔNG TẠO THÊM vi điều khiển thứ 2 trùng lặp (không tạo thêm board stm32 khác).
- Khi người dùng yêu cầu "thêm", "gắn", "nối" (ví dụ: "thêm 1 nút bấm", "thêm 1 led", "thêm màn hình OLED"), bạn PHẢI:
  * Giữ nguyên toàn bộ vi điều khiển, các linh kiện và dây nối đang có trong sơ đồ hiện tại.
  * Bổ sung linh kiện mới và nối dây mới vào các chân GPIO còn trống của vi điều khiển hiện có.
- Khi người dùng yêu cầu "xóa", "bỏ" linh kiện (ví dụ: "xóa led", "bỏ nút nhấn"), bạn chỉ loại bỏ linh kiện đó cùng các dây nối liên quan của nó, giữ nguyên các phần còn lại.
- Chỉ khi người dùng yêu cầu "làm lại từ đầu", "reset", "tạo mạch mới hoàn toàn", hoặc đổi sang dòng vi điều khiển khác (ví dụ từ STM32 sang ESP32), bạn mới thay thế toàn bộ sơ đồ mạch.

1. CƠ SỞ DỮ LIỆU LINH KIỆN VÀ CHÂN TÍN HIỆU:
- STM32 Blue Pill: "board-stm32-bluepill". Chân: "C13".."C15", "A0".."A15", "B0".."B15", "3.3", "5V", "GND.1".."GND.4". (Bắt buộc attrs: { "builder": "platformio-stm32" })
- ESP32 DevKit v4: "board-esp32-devkit-c-v4". Chân: "3V3", "GND.1", "GND.2", "5V", "21" (SDA), "22" (SCL), "2", "4", "16", "17", "18", "19", "23"...
- Arduino Uno R3: "wokwi-arduino-uno". Chân: "5V", "3.3V", "GND.1", "GND.2", "A4" (SDA), "A5" (SCL), "13".."2".
- Đèn LED: "wokwi-led". Chân: "A" (Anode), "C" (Cathode). attrs: { "color": "red"|"green"|"blue"|"yellow" }
- Điện trở: "wokwi-resistor". Chân: "1", "2". attrs: { "value": "330"|"1000"|"10000" }
- Nút bấm: "wokwi-pushbutton". Chân: "1.l", "2.l" (bên trái), "1.r", "2.r" (bên phải). attrs: { "color": "green"|"red" }
- Màn hình I2C (OLED/LCD): "board-ssd1306" hoặc "wokwi-lcd1602". Chân: "VCC", "GND", "SCL", "SDA".

2. QUY TẮC TỌA ĐỘ VÀ BỐ CỤC KHÔNG GIAN (SMART LAYOUT):
- Căn lưới (Grid Snap): Tất cả giá trị "top" và "left" BẮT BUỘC phải là bội số của 10 (vd: 0, 10, -20, 150).
- Vi điều khiển trung tâm: Luôn đặt tại { "top": 0, "left": 0 }.
- Phân luồng không gian (Không chồng chéo):
  * Cụm đầu ra (LED, Relay): Đặt bên trái. Ngoại vi ở left: -220 đến -180. Trở hạn dòng ở left: -100.
  * Cụm đầu vào (Nút nhấn, Biến trở): Đặt bên phải. Khoảng left: 120 đến 180.
  * Màn hình / Module lớn: Đặt phía trên đỉnh (top: -200 đến -150).
- Khoảng cách an toàn: Khi xếp nhiều LED/Nút nhấn thành cột, giá trị "top" của mỗi linh kiện phải cách nhau tối thiểu 40px đến 50px.

3. QUY TẮC ĐI DÂY NÂNG CAO (ADVANCED ROUTING):
- Quy tắc Cùng Phía (Port-Side Affinity): 
  * Linh kiện nằm bên trái (left < 0) BẮT BUỘC nối vào các chân ở cạnh trái của board.
  * Linh kiện nằm bên phải (left > 0) BẮT BUỘC nối vào các chân ở cạnh phải của board.
  * Tuyệt đối không kéo dây vắt ngang qua thân vi điều khiển.
- QUY TẮC MẠCH KÍN BẮT BUỘC (Circuit Loop Integrity):
  * Mọi linh kiện thụ động (Nút bấm, LED, Còi Buzzer) BẮT BUỘC PHẢI CÓ ĐỦ 2 DÂY KẾT NỐI KHÉP KÍN:
    - Nút bấm (Pushbutton): BẮT BUỘC ĐỦ 2 DÂY (1 chân nối GPIO tín hiệu, 1 chân nối GND của MCU). TUYỆT ĐỐI KHÔNG ĐƯỢC CHỈ NỐI 1 DÂY LƠ LỬNG!
    - Đèn LED: BẮT BUỘC ĐỦ 2 DÂY (Anode qua trở vào GPIO, Cathode về GND).
    - Còi Buzzer: BẮT BUỘC ĐỦ 2 DÂY (chân 1 vào GPIO, chân 2 vào GND).
- QUY TẮC CHỐNG VẮT CHÉO DÂY (Spatial Pin Matching): 
  * Khi kết nối linh kiện có nhiều chân (đặc biệt là Nút nhấn), BẮT BUỘC phải map đúng chiều không gian.
  * Chân nằm phía trên của linh kiện (VD: "1.l" của pushbutton) PHẢI nối với các chân nằm phía trên của MCU (VD: GND.3, GND.4, 3.3V, hoặc GND.2).
  * Chân nằm phía dưới của linh kiện (VD: "2.l" của pushbutton) PHẢI nối với các chân nằm phía dưới của MCU (VD: B0, B1, A7).
  * Nếu MCU và linh kiện bị ngược chiều cao, BẮT BUỘC phải tráo đổi chân logic của linh kiện (ví dụ: dùng 2.l cho tín hiệu, 1.l cho GND) để hai đường dây đi song song và không bao giờ cắt nhau.
  * Hướng thoát dây: Dây ở trên hất lên ("v-20"), dây ở dưới hất xuống ("v20") để tạo độ mở thông thoáng.
- Gom Bus bằng Bước Nhảy (Stepped Bus Offsets): 
  * Khi nhiều dây song song đi vào vi điều khiển, dùng mảng định hướng theo bậc thang để tránh đè dây.
  * Cú pháp: "v" (dọc), "h" (ngang). Số dương đi xuống/phải, số âm đi lên/trái. 
  * Ví dụ 4 dây tín hiệu rẽ vào board: Dây 1 ["h10", "v-20"], Dây 2 ["h10", "v-30"], Dây 3 ["h10", "v-40"].
- Nối tiếp đất chùm (Daisy-Chain GND): Nối chân GND của linh kiện 1 sang linh kiện 2, 2 sang 3... và chỉ kéo 1 dây duy nhất từ linh kiện cuối về GND của MCU.
- Quy chuẩn màu dây: VCC/3.3V/5V dùng "red"; GND dùng "black"; SCL dùng "blue"; SDA dùng "gold"; Dây tín hiệu GPIO dùng "green", "purple", "cyan", "limegreen".

4. VÍ DỤ ĐẦU RA KỲ VỌNG:
\`\`\`json
{
  "explanation": "Mạch STM32 với nút bấm và LED. Cấu trúc không gian: LED bên trái, Nút nhấn bên phải. Nút nhấn đủ 2 dây khép kín (1 dây GPIO, 1 dây GND) không vắt chéo.",
  "diagram": {
    "version": 1,
    "parts": [
      { "type": "board-stm32-bluepill", "id": "stm32", "top": 0, "left": 0, "attrs": { "builder": "platformio-stm32" } },
      { "type": "wokwi-led", "id": "led1", "top": -40, "left": -200, "attrs": { "color": "red" } },
      { "type": "wokwi-resistor", "id": "r1", "top": -40, "left": -100, "attrs": { "value": "330" } },
      { "type": "wokwi-pushbutton", "id": "btn1", "top": -40, "left": 140, "attrs": { "color": "green" } }
    ],
    "connections": [
      [ "led1:A", "r1:1", "red", [ "v0" ] ],
      [ "r1:2", "stm32:B12", "green", [ "h10", "v-20" ] ],
      [ "led1:C", "stm32:GND.1", "black", [ "v30", "h160", "v-30" ] ],
      [ "btn1:1.l", "stm32:GND.2", "black", [ "h-20", "v-20" ] ],
      [ "btn1:2.l", "stm32:B0", "blue", [ "h-20", "v20" ] ]
    ]
  }
}
\`\`\`

CHÚ Ý QUAN TRỌNG: Đầu ra của bạn BẮT BUỘC chỉ là một khối JSON duy nhất đúng định dạng { "explanation": "...", "diagram": { ... } }. Không chứa bất kỳ văn bản, định dạng markdown thừa hay lời chào hỏi nào nằm ngoài khối JSON này.
`;

function formatCurrentDiagramContext(diagram?: DiagramSchema | null): string {
  if (!diagram || !Array.isArray(diagram.parts) || diagram.parts.length === 0) {
    return "[TRẠNG THÁI MẠCH HIỆN TẠI TRÊN BÀN MÔ PHỎNG]:\n* Mạch hiện tại đang trống (chưa có linh kiện nào).";
  }

  const partsList = diagram.parts
    .map(
      (p) =>
        `- Linh kiện [ID: "${p.id}"]: Loại "${p.type}", Tọa độ { top: ${p.top}, left: ${p.left} }${
          p.attrs && Object.keys(p.attrs).length > 0 ? `, Thuộc tính: ${JSON.stringify(p.attrs)}` : ""
        }`
    )
    .join("\n");

  const connectionsList =
    Array.isArray(diagram.connections) && diagram.connections.length > 0
      ? diagram.connections
          .map(
            (c) =>
              `- Nối: "${c[0]}" -> "${c[1]}", Màu "${c[2] || "green"}"${
                c[3] && c[3].length > 0 ? `, Lộ trình: [${c[3].map((s) => `"${s}"`).join(", ")}]` : ""
              }`
          )
          .join("\n")
      : "Chưa có dây nối nào (các linh kiện chưa được nối dây).";

  return `[TRẠNG THÁI MẠCH HIỆN TẠI TRÊN BÀN MÔ PHỎNG]:
* Linh kiện hiện có (${diagram.parts.length} linh kiện):
${partsList}

* Dây nối hiện có (${diagram.connections?.length || 0} dây):
${connectionsList}`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, history, currentDiagram, user } = await req.json();

    // 1. Kiểm tra yêu cầu đăng nhập tài khoản
    if (!user || !user.email) {
      return NextResponse.json(
        {
          error:
            "Yêu cầu đăng nhập tài khoản để sử dụng tính năng Trợ lý AI thiết kế mạch. Bạn vẫn có thể dùng tab Code diagram.json bình thường.",
        },
        { status: 401 }
      );
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Vui lòng cung cấp nội dung yêu cầu tạo mạch" },
        { status: 400 }
      );
    }

    if (!NINEROUTER_API_BASE_URL || !NINEROUTER_API_KEY) {
      console.error(
        "Thiếu biến môi trường NINEROUTER_API_BASE_URL hoặc NINEROUTER_API_KEY trong file .env"
      );
      return NextResponse.json(
        {
          error:
            "Hệ thống chưa được cấu hình biến môi trường NINEROUTER_API_KEY. Vui lòng kiểm tra file .env.",
        },
        { status: 500 }
      );
    }

    // Xây dựng messages gửi đến 9Router Kiro
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Bổ sung lịch sử trò chuyện gần nhất (nếu có)
    if (Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-4);
      for (const h of recentHistory) {
        if (h.sender === "user") {
          messages.push({ role: "user", content: h.text });
        } else if (h.sender === "ai") {
          messages.push({ role: "assistant", content: h.text });
        }
      }
    }

    // Định dạng ngữ cảnh mạch hiện tại
    const contextDescription = formatCurrentDiagramContext(currentDiagram);

    // Bổ sung prompt ngầm hướng dẫn AI đi dây thông minh và tôn trọng ngữ cảnh
    const promptWithLayoutRules = `${contextDescription}

[YÊU CẦU CỦA NGƯỜI DÙNG]:
${prompt}

[QUY TẮC BẮT BUỘC KHI XỬ LÝ]:
1. Context Retention: Nếu mạch hiện tại đã có MCU (như "board-stm32-bluepill" ID "stm32" ở top: 0, left: 0), BẮT BUỘC GIỮ NGUYÊN MCU NÀY, tuyệt đối không tạo thêm MCU thứ hai trùng lặp.
2. Incremental Modification: Nếu người dùng yêu cầu thêm linh kiện (ví dụ "thêm nút bấm", "thêm led", "thêm oled"), bạn PHẢI GIỮ LẠI toàn bộ các linh kiện và dây nối đang có, chỉ bổ sung linh kiện mới và nối dây vào MCU hiện tại.
3. Circuit Loop Integrity: Mọi nút bấm BẮT BUỘC PHẢI CÓ ĐỦ 2 DÂY (1 dây GPIO, 1 dây GND của MCU). Tuyệt đối không để nút chỉ có 1 dây lơ lửng!
4. Port-Side Affinity & Spatial Pin Matching: Linh kiện bên trái nối chân bên trái MCU, linh kiện bên phải nối chân bên phải MCU. Dây nút nhấn trên hất lên (v-20) vào GND, dây dưới hất xuống (v20) vào GPIO để không cắt chéo.
5. Stepped Bus Offsets & Tọa độ cách xa nhau tối thiểu 70px-100px, không chồng đè.`;

    messages.push({ role: "user", content: promptWithLayoutRules });

    // Gọi 9Router OpenAI-compatible API
    const res = await fetch(`${NINEROUTER_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NINEROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NINEROUTER_MODEL,
        messages,
        temperature: 0.2,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("AI API error:", res.status, errText);
      return NextResponse.json(
        { error: `Dịch vụ AI trả về mã lỗi ${res.status}: ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    let rawContent = data.choices?.[0]?.message?.content || "";

    // Loại bỏ tag <thinking>...</thinking> nếu có từ mô hình AI
    rawContent = rawContent.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim();

    // Tìm và bóc tách khối JSON từ phản hồi của model
    let parsedJson: { explanation?: string; diagram?: DiagramSchema } | null = null;

    // 1. Thử parse trực tiếp toàn bộ content
    try {
      parsedJson = JSON.parse(rawContent);
    } catch {
      // 2. Thử bóc tách từ ```json ... ``` hoặc khối { ... }
      const jsonMatch =
        rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
        rawContent.match(/(\{[\s\S]*\})/);

      if (jsonMatch && jsonMatch[1]) {
        try {
          parsedJson = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.warn("Không thể parse regex json:", e);
        }
      }
    }

    if (!parsedJson || !parsedJson.diagram) {
      return NextResponse.json(
        {
          explanation: rawContent || "AI đã phân tích nhưng không xuất được sơ đồ hợp lệ.",
          diagram: null,
          raw: rawContent,
        },
        { status: 200 }
      );
    }

    // Hậu xử lý: Chống chồng lấn và tự động bổ sung dây còn thiếu
    const sanitizedDiagram = sanitizeDiagramLayout(parsedJson.diagram);

    return NextResponse.json({
      explanation: parsedJson.explanation || "Sơ đồ mạch được tạo bởi Trợ lý AI",
      diagram: sanitizedDiagram,
    });
  } catch (error: any) {
    console.error("Lỗi xử lý AI Circuit Route:", error);
    return NextResponse.json(
      { error: "Lỗi kết nối tới dịch vụ AI: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}

// Thuật toán hậu xử lý: Tự động tách va chạm tọa độ và bổ sung dây còn thiếu (bù GND cho Nút bấm / LED)
function sanitizeDiagramLayout(diagram: DiagramSchema): DiagramSchema {
  if (!diagram.parts || !Array.isArray(diagram.parts)) return diagram;

  const parts = [...diagram.parts];
  const connections: any[] = Array.isArray(diagram.connections) ? [...diagram.connections] : [];
  const occupiedPositions: Array<{ id: string; top: number; left: number }> = [];

  let mcuId = "stm32";
  let mcuType = "board-stm32-bluepill";

  // Tìm MCU chính trong mạch
  for (const part of parts) {
    if (
      part.type.includes("board-stm32") ||
      part.type.includes("board-esp32") ||
      part.type.includes("arduino-uno") ||
      part.type.includes("board-pi-pico")
    ) {
      mcuId = part.id;
      mcuType = part.type;
      break;
    }
  }

  // 1. Chống chồng lấn tọa độ
  for (let i = 0; i < parts.length; i++) {
    const part = { ...parts[i] };
    let top = Number(part.top) || 0;
    let left = Number(part.left) || 0;

    const isMainMcu = part.id === mcuId;

    if (!isMainMcu) {
      for (const pos of occupiedPositions) {
        const dist = Math.hypot(top - pos.top, left - pos.left);
        if (dist < 60) {
          if (Math.abs(top - pos.top) < 40) {
            top = pos.top + 75;
          }
          if (Math.abs(left - pos.left) < 40) {
            left = pos.left + (left >= 0 ? 80 : -80);
          }
        }
      }
    }

    part.top = top;
    part.left = left;
    parts[i] = part;
    occupiedPositions.push({ id: part.id, top, left });
  }

  // 2. Tự động kiểm tra và bù dây GND nếu Nút bấm hoặc LED bị thiếu kết nối
  for (const part of parts) {
    // Kiểm tra Nút bấm
    if (part.type.includes("pushbutton")) {
      const btnConnections = connections.filter(
        (c) => c[0]?.startsWith(`${part.id}:`) || c[1]?.startsWith(`${part.id}:`)
      );

      // Nếu nút bấm chỉ có 1 dây duy nhất -> Bù ngay dây thứ 2 nối GND!
      if (btnConnections.length === 1) {
        const existingPin = btnConnections[0][0]?.startsWith(`${part.id}:`)
          ? btnConnections[0][0].split(":")[1]
          : btnConnections[0][1].split(":")[1];

        // Nếu chân đã nối là 2.l -> chân còn lại là 1.l
        const freePin = existingPin.includes("2") ? "1.l" : "2.l";
        const gndTarget = mcuType.includes("stm32")
          ? `${mcuId}:GND.2`
          : mcuType.includes("esp32")
          ? `${mcuId}:GND.1`
          : `${mcuId}:GND.1`;

        connections.push([
          `${part.id}:${freePin}`,
          gndTarget,
          "black",
          [freePin === "1.l" ? "v-20" : "v20", "h-20"],
        ]);
      }
    }

    // Kiểm tra LED
    if (part.type === "wokwi-led") {
      const ledConnections = connections.filter(
        (c) => c[0]?.startsWith(`${part.id}:`) || c[1]?.startsWith(`${part.id}:`)
      );

      // Nếu LED chỉ có 1 kết nối (chưa có Cathode về GND)
      const hasCathode = connections.some(
        (c) => c[0] === `${part.id}:C` || c[1] === `${part.id}:C`
      );

      if (!hasCathode && ledConnections.length > 0) {
        const gndTarget = `${mcuId}:GND.1`;
        connections.push([
          `${part.id}:C`,
          gndTarget,
          "black",
          ["v30", "h120", "v-30"],
        ]);
      }
    }
  }

  return {
    ...diagram,
    parts,
    connections,
  };
}
