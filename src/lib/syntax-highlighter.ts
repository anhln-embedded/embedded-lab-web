/**
 * Embedded-AIoT Lab - Syntax Highlighter Engine
 * Hỗ trợ syntax highlighting chuẩn TextMate/VS Code Dark+ cho các ngôn ngữ:
 * C, C++, Python, Rust, Verilog, Bash/Makefile, JSON, Assembly
 */

export interface HighlightToken {
  type: "keyword" | "type" | "string" | "comment" | "number" | "function" | "preprocessor" | "macro" | "operator" | "punctuation" | "register" | "plain";
  text: string;
}

export type SupportedLanguage = "c" | "cpp" | "python" | "rust" | "verilog" | "bash" | "json" | "asm";

// Bảng màu chuẩn VS Code Dark+ / JetBrains cho từng loại token
export const TOKEN_STYLES: Record<HighlightToken["type"], { light: string; dark: string; style?: string }> = {
  keyword: { light: "#8b5cf6", dark: "#c586c0", style: "font-weight: 600;" }, // tím keyword
  type: { light: "#0284c7", dark: "#4ec9b0", style: "font-weight: 600;" }, // xanh ngọc kiểu dữ liệu (uint32_t, void...)
  function: { light: "#d97706", dark: "#dcdcaa", style: "font-weight: 500;" }, // vàng hàm (printf, app_main...)
  string: { light: "#16a34a", dark: "#ce9178" }, // cam đất / xanh chuỗi ("...")
  comment: { light: "#64748b", dark: "#6a9955", style: "font-style: italic;" }, // xanh lá / xám ghi chú (// ...)
  number: { light: "#ea580c", dark: "#b5cea8" }, // xanh nhạt / cam số và hex (0x4002...)
  preprocessor: { light: "#9333ea", dark: "#9cdcfe", style: "font-weight: 600;" }, // #include, #define
  macro: { light: "#c026d3", dark: "#d16969", style: "font-weight: bold;" }, // CONSTANT_NAME
  register: { light: "#f05a28", dark: "#4fc1ff", style: "font-weight: 700;" }, // RCC, GPIOA, USART1
  operator: { light: "#0f172a", dark: "#d4d4d4" },
  punctuation: { light: "#64748b", dark: "#808080" },
  plain: { light: "#1e293b", dark: "#d4d4d4" },
};

/**
 * Phân tích và highlight mã nguồn C/C++ chuyên sâu cho Hệ thống Nhúng
 */
export function highlightCCpp(code: string): string {
  // 1. Thoát các ký tự HTML nguy hiểm
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = code.split("\n");
  const highlightedLines = lines.map((line) => {
    // Xử lý comment cả dòng
    if (line.trim().startsWith("//")) {
      return `<span style="color: #6a9955; font-style: italic;">${escapeHtml(line)}</span>`;
    }
    // Xử lý preprocessor directive (#include, #define, #pragma, #ifdef, #endif...)
    if (line.trim().startsWith("#")) {
      const match = line.match(/^(\s*#\w+)(.*)$/);
      if (match) {
        const prep = match[1];
        const rest = match[2];
        const highlightedRest = escapeHtml(rest)
          .replace(/(&lt;[\w\.\/]+&gt;)/g, '<span style="color: #ce9178;">$1</span>')
          .replace(/(".*?")/g, '<span style="color: #ce9178;">$1</span>');
        return `<span style="color: #c586c0; font-weight: 600;">${escapeHtml(prep)}</span>${highlightedRest}`;
      }
    }

    // Tokenize từng dòng code
    let processed = escapeHtml(line);

    // Chuỗi & Ký tự
    processed = processed.replace(/(".*?"|'.*?')/g, '<span style="color: #ce9178;">$1</span>');

    // Số Hex, Nhị phân và Thập phân (vd: 0x40021000, 0b1010, 100UL, 3.14)
    processed = processed.replace(
      /\b(0x[0-9a-fA-F]+[uUlL]*|0b[01]+|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?[uUlLfF]*)\b/g,
      '<span style="color: #b5cea8;">$1</span>'
    );

    // Kiểu dữ liệu Nhúng & C/C++ chuẩn
    const types = [
      "uint8_t", "uint16_t", "uint32_t", "uint64_t",
      "int8_t", "int16_t", "int32_t", "int64_t",
      "size_t", "ssize_t", "uintptr_t", "intptr_t",
      "void", "char", "short", "int", "long", "float", "double",
      "bool", "boolean", "true", "false",
      "volatile", "const", "static", "inline", "extern", "register", "auto", "restrict",
      "struct", "union", "enum", "typedef", "sizeof",
      "GPIO_TypeDef", "RCC_TypeDef", "USART_TypeDef", "SPI_TypeDef", "I2C_TypeDef", "TIM_TypeDef",
      "TaskHandle_t", "QueueHandle_t", "SemaphoreHandle_t", "BaseType_t", "TickType_t",
      "esp_err_t", "gpio_config_t", "gpio_num_t"
    ];
    const typeRegex = new RegExp(`\\b(${types.join("|")})\\b`, "g");
    processed = processed.replace(typeRegex, '<span style="color: #4ec9b0; font-weight: 600;">$1</span>');

    // Từ khóa điều khiển luồng (Control Flow)
    const keywords = [
      "if", "else", "switch", "case", "default", "break", "continue",
      "while", "do", "for", "goto", "return",
      "class", "namespace", "public", "private", "protected", "template", "typename",
      "new", "delete", "try", "catch", "throw", "virtual", "override", "final"
    ];
    const keywordRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    processed = processed.replace(keywordRegex, '<span style="color: #c586c0; font-weight: 600;">$1</span>');

    // Thanh ghi Vi điều khiển (Hardware Registers STM32 / ESP32)
    const registers = [
      "RCC", "GPIOA", "GPIOB", "GPIOC", "GPIOD", "GPIOE", "GPIOF", "GPIOG",
      "USART1", "USART2", "USART3", "UART4", "UART5", "USART6",
      "SPI1", "SPI2", "SPI3", "I2C1", "I2C2", "I2C3",
      "TIM1", "TIM2", "TIM3", "TIM4", "TIM5", "TIM6", "TIM7", "TIM8",
      "NVIC", "SCB", "SysTick", "EXTI", "SYSCFG", "PWR", "FLASH", "ADC1", "ADC2", "DMA1", "DMA2",
      "MODER", "OTYPER", "OSPEEDR", "PUPDR", "IDR", "ODR", "BSRR", "LCKR", "AFR",
      "CR1", "CR2", "CR3", "SR", "DR", "BRR", "AHB1ENR", "APB1ENR", "APB2ENR"
    ];
    const regRegex = new RegExp(`\\b(${registers.join("|")})\\b`, "g");
    processed = processed.replace(regRegex, '<span style="color: #4fc1ff; font-weight: 700;">$1</span>');

    // Tên hàm được gọi (Functions: abc(...))
    processed = processed.replace(
      /\b([a-zA-Z_]\w*)\s*(?=\()/g,
      '<span style="color: #dcdcaa;">$1</span>'
    );

    // Comment đuôi dòng (// ...)
    processed = processed.replace(
      /(\/\/[^<]*)$/,
      '<span style="color: #6a9955; font-style: italic;">$1</span>'
    );

    return processed;
  });

  return highlightedLines.join("\n");
}

/**
 * Phân tích và highlight Python (TinyML, Edge AI, Scripts)
 */
export function highlightPython(code: string): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = code.split("\n");
  const highlightedLines = lines.map((line) => {
    if (line.trim().startsWith("#")) {
      return `<span style="color: #6a9955; font-style: italic;">${escapeHtml(line)}</span>`;
    }

    let processed = escapeHtml(line);

    // Chuỗi ("..." hoặc '...')
    processed = processed.replace(/(".*?"|'.*?'|""".*?""")/g, '<span style="color: #ce9178;">$1</span>');

    // Số
    processed = processed.replace(/\b(\d+\.?\d*|0x[0-9a-fA-F]+)\b/g, '<span style="color: #b5cea8;">$1</span>');

    // Keywords
    const keywords = [
      "def", "class", "return", "import", "from", "as", "if", "elif", "else",
      "while", "for", "in", "try", "except", "finally", "with", "raise",
      "assert", "yield", "lambda", "global", "nonlocal", "pass", "break", "continue",
      "True", "False", "None", "async", "await"
    ];
    const kwRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    processed = processed.replace(kwRegex, '<span style="color: #c586c0; font-weight: 600;">$1</span>');

    // Built-in & Types
    const builtins = [
      "self", "print", "len", "range", "enumerate", "zip", "isinstance", "type",
      "int", "float", "str", "list", "dict", "set", "tuple", "bytearray", "bytes"
    ];
    const biRegex = new RegExp(`\\b(${builtins.join("|")})\\b`, "g");
    processed = processed.replace(biRegex, '<span style="color: #4ec9b0; font-weight: 600;">$1</span>');

    // Decorators (@...)
    processed = processed.replace(/(@\w+)/g, '<span style="color: #dcdcaa; font-weight: 600;">$1</span>');

    // Functions
    processed = processed.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span style="color: #dcdcaa;">$1</span>');

    // Comment đuôi dòng
    processed = processed.replace(/(#[^<]*)$/, '<span style="color: #6a9955; font-style: italic;">$1</span>');

    return processed;
  });

  return highlightedLines.join("\n");
}

/**
 * Phân tích và highlight Rust
 */
export function highlightRust(code: string): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = code.split("\n");
  const highlightedLines = lines.map((line) => {
    if (line.trim().startsWith("//")) {
      return `<span style="color: #6a9955; font-style: italic;">${escapeHtml(line)}</span>`;
    }

    let processed = escapeHtml(line);

    // Chuỗi
    processed = processed.replace(/(".*?"|'.*?')/g, '<span style="color: #ce9178;">$1</span>');

    // Số
    processed = processed.replace(/\b(0x[0-9a-fA-F]+|\d+(_\d+)*(u8|u16|u32|u64|usize|i8|i16|i32|i64|isize|f32|f64)?)\b/g, '<span style="color: #b5cea8;">$1</span>');

    // Keywords
    const keywords = [
      "fn", "let", "mut", "pub", "struct", "enum", "impl", "trait", "match", "use",
      "mod", "crate", "unsafe", "const", "static", "type", "where", "async", "await",
      "if", "else", "loop", "while", "for", "in", "return", "break", "continue", "move"
    ];
    const kwRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    processed = processed.replace(kwRegex, '<span style="color: #c586c0; font-weight: 600;">$1</span>');

    // Types
    const types = ["u8", "u16", "u32", "u64", "u128", "usize", "i8", "i16", "i32", "i64", "isize", "bool", "str", "String", "Option", "Result", "Some", "None", "Ok", "Err", "Vec"];
    const typeRegex = new RegExp(`\\b(${types.join("|")})\\b`, "g");
    processed = processed.replace(typeRegex, '<span style="color: #4ec9b0; font-weight: 600;">$1</span>');

    // Macros (println!, vec!...)
    processed = processed.replace(/(\b\w+!)/g, '<span style="color: #4fc1ff; font-weight: 600;">$1</span>');

    // Functions
    processed = processed.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, '<span style="color: #dcdcaa;">$1</span>');

    // Comments
    processed = processed.replace(/(\/\/[^<]*)$/, '<span style="color: #6a9955; font-style: italic;">$1</span>');

    return processed;
  });

  return highlightedLines.join("\n");
}

/**
 * Phân tích và highlight Verilog / SystemVerilog (FPGA / Digital Design)
 */
export function highlightVerilog(code: string): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = code.split("\n");
  const highlightedLines = lines.map((line) => {
    if (line.trim().startsWith("//")) {
      return `<span style="color: #6a9955; font-style: italic;">${escapeHtml(line)}</span>`;
    }

    let processed = escapeHtml(line);

    // Chuỗi
    processed = processed.replace(/(".*?")/g, '<span style="color: #ce9178;">$1</span>');

    // Verilog Numbers (vd: 8'hFF, 1'b0, 32'd100)
    processed = processed.replace(/\b(\d+'[bBoOdDhH][0-9a-fA-F_xXzZ]+|\d+)\b/g, '<span style="color: #b5cea8;">$1</span>');

    // Keywords
    const keywords = [
      "module", "endmodule", "input", "output", "inout", "wire", "reg", "logic",
      "always", "always_comb", "always_ff", "posedge", "negedge", "begin", "end",
      "assign", "if", "else", "case", "endcase", "parameter", "localparam",
      "initial", "generate", "endgenerate", "function", "endfunction", "task", "endtask"
    ];
    const kwRegex = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    processed = processed.replace(kwRegex, '<span style="color: #c586c0; font-weight: 600;">$1</span>');

    // Comments
    processed = processed.replace(/(\/\/[^<]*)$/, '<span style="color: #6a9955; font-style: italic;">$1</span>');

    return processed;
  });

  return highlightedLines.join("\n");
}

/**
 * Phân tích và highlight Bash / Makefile / Shell Script
 */
export function highlightBash(code: string): string {
  const escapeHtml = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = code.split("\n");
  const highlightedLines = lines.map((line) => {
    if (line.trim().startsWith("#")) {
      return `<span style="color: #6a9955; font-style: italic;">${escapeHtml(line)}</span>`;
    }

    let processed = escapeHtml(line);

    // Chuỗi
    processed = processed.replace(/(".*?"|'.*?')/g, '<span style="color: #ce9178;">$1</span>');

    // Commands phổ biến trong lập trình Nhúng
    const commands = [
      "make", "gcc", "arm-none-eabi-gcc", "arm-none-eabi-gdb", "openocd", "st-flash",
      "idf.py", "git", "echo", "cd", "mkdir", "rm", "cp", "mv", "chmod", "curl", "source"
    ];
    const cmdRegex = new RegExp(`\\b(${commands.join("|")})\\b`, "g");
    processed = processed.replace(cmdRegex, '<span style="color: #4ec9b0; font-weight: 600;">$1</span>');

    // Flags (-Wall, -O2, -g...)
    processed = processed.replace(/(\s-[a-zA-Z0-9_\-]+)/g, '<span style="color: #b5cea8;">$1</span>');

    // Variables ($VAR, ${VAR}, $@, $<)
    processed = processed.replace(/(\$[\w\(\)\{\}\@\<\^\?]+)/g, '<span style="color: #4fc1ff; font-weight: 600;">$1</span>');

    return processed;
  });

  return highlightedLines.join("\n");
}

/**
 * Universal Highlighter Dispatcher
 */
export function highlightCode(code: string, language: string = "c"): string {
  const lang = language.toLowerCase();
  if (lang === "c" || lang === "cpp" || lang === "h" || lang === "hpp") {
    return highlightCCpp(code);
  }
  if (lang === "python" || lang === "py") {
    return highlightPython(code);
  }
  if (lang === "rust" || lang === "rs") {
    return highlightRust(code);
  }
  if (lang === "verilog" || lang === "sv" || lang === "systemverilog") {
    return highlightVerilog(code);
  }
  if (lang === "bash" || lang === "sh" || lang === "shell" || lang === "makefile") {
    return highlightBash(code);
  }
  return highlightCCpp(code);
}
