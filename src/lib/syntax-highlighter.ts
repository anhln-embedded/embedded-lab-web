/**
 * Embedded-AIoT Lab - Token-Based Syntax Highlighter Engine
 * Hỗ trợ Dual-Theme (VS Code Dark+ & GitHub Light) cho C/C++, Python, Rust, Verilog, Bash.
 * Sử dụng cơ chế Tokenizer Lexer không bao giờ bị lỗi vỡ HTML hay lồng thẻ span.
 */

export interface HighlightToken {
  type:
    | "keyword"
    | "type"
    | "string"
    | "comment"
    | "number"
    | "function"
    | "preprocessor"
    | "macro"
    | "register"
    | "operator"
    | "punctuation"
    | "plain";
  text: string;
}

export type CodeTheme = "dark" | "light";

const escapeHtml = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Bảng màu VS Code Dark+
 */
const COLOR_MAP_DARK: Record<HighlightToken["type"], string> = {
  keyword: "#c586c0; font-weight: 600", // Tím
  type: "#4ec9b0; font-weight: 600", // Xanh ngọc
  function: "#dcdcaa; font-weight: 500", // Vàng
  string: "#ce9178", // Cam đất
  comment: "#6a9955; font-style: italic", // Xanh lá
  number: "#b5cea8", // Xanh nhạt
  preprocessor: "#c586c0; font-weight: 600", // Tím đậm
  macro: "#4fc1ff; font-weight: bold", // Xanh dương sáng
  register: "#4fc1ff; font-weight: 700", // Xanh dương đậm
  operator: "#d4d4d4",
  punctuation: "#808080",
  plain: "#e6edf3",
};

/**
 * Bảng màu GitHub Light / VS Code Light+ (Tương phản cao trên nền trắng)
 */
const COLOR_MAP_LIGHT: Record<HighlightToken["type"], string> = {
  keyword: "#cf222e; font-weight: 700", // Đỏ mận đậm
  type: "#0550ae; font-weight: 700", // Xanh dương đậm sắc nét
  function: "#8250df; font-weight: 600", // Tím hàm
  string: "#0a3069; font-weight: 500", // Xanh navy chuỗi
  comment: "#57606a; font-style: italic", // Xám ghi chú
  number: "#0969da; font-weight: 600", // Xanh số / hex
  preprocessor: "#cf222e; font-weight: 700", // Đỏ directive
  macro: "#953800; font-weight: bold", // Cam cháy hằng số
  register: "#116329; font-weight: bold", // Xanh lá đậm thanh ghi vi điều khiển
  operator: "#24292f",
  punctuation: "#57606a",
  plain: "#1f2328",
};

function renderTokensToHtml(tokens: HighlightToken[], theme: CodeTheme = "dark"): string {
  const colorMap = theme === "light" ? COLOR_MAP_LIGHT : COLOR_MAP_DARK;

  return tokens
    .map((t) => {
      const escaped = escapeHtml(t.text);
      if (t.type === "plain") return escaped;
      const style = colorMap[t.type] || "";
      return style ? `<span style="color: ${style};">${escaped}</span>` : escaped;
    })
    .join("");
}

// C/C++ Keywords & Types
const C_TYPES = new Set([
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
]);

const C_KEYWORDS = new Set([
  "if", "else", "switch", "case", "default", "break", "continue",
  "while", "do", "for", "goto", "return",
  "class", "namespace", "public", "private", "protected", "template", "typename",
  "new", "delete", "try", "catch", "throw", "virtual", "override", "final"
]);

const HARDWARE_REGISTERS = new Set([
  "RCC", "GPIOA", "GPIOB", "GPIOC", "GPIOD", "GPIOE", "GPIOF", "GPIOG",
  "USART1", "USART2", "USART3", "UART4", "UART5", "USART6",
  "SPI1", "SPI2", "SPI3", "I2C1", "I2C2", "I2C3",
  "TIM1", "TIM2", "TIM3", "TIM4", "TIM5", "TIM6", "TIM7", "TIM8",
  "NVIC", "SCB", "SysTick", "EXTI", "SYSCFG", "PWR", "FLASH", "ADC1", "ADC2", "DMA1", "DMA2",
  "GPIOA_ODR", "GPIOA_MODER", "GPIOA_IDR", "GPIOA_BSRR",
  "GPIOB_ODR", "GPIOB_MODER", "GPIOC_ODR", "GPIOC_MODER",
  "AHB1ENR", "APB1ENR", "APB2ENR", "CR1", "CR2", "SR", "DR"
]);

/**
 * Tokenizer chuyên sâu cho C / C++
 */
export function tokenizeCCppLine(line: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;
  const len = line.length;

  while (i < len) {
    // 1. Line comment //...
    if (line[i] === "/" && line[i + 1] === "/") {
      tokens.push({ type: "comment", text: line.slice(i) });
      break;
    }

    // 2. Preprocessor directive #include <...>, #define ...
    if (i === 0 || (tokens.length === 1 && tokens[0].text.trim() === "")) {
      if (line[i] === "#") {
        let directiveEnd = i + 1;
        while (directiveEnd < len && /[a-zA-Z0-9_]/.test(line[directiveEnd])) {
          directiveEnd++;
        }
        tokens.push({ type: "preprocessor", text: line.slice(i, directiveEnd) });
        i = directiveEnd;

        // Xử lý phần còn lại của dòng include / define
        while (i < len) {
          if (line[i] === "/" && line[i + 1] === "/") {
            tokens.push({ type: "comment", text: line.slice(i) });
            i = len;
            break;
          }
          if (line[i] === "<") {
            const closeAngle = line.indexOf(">", i);
            if (closeAngle !== -1) {
              tokens.push({ type: "string", text: line.slice(i, closeAngle + 1) });
              i = closeAngle + 1;
              continue;
            }
          }
          if (line[i] === '"') {
            let strEnd = i + 1;
            while (strEnd < len && line[strEnd] !== '"') strEnd++;
            if (strEnd < len) strEnd++;
            tokens.push({ type: "string", text: line.slice(i, strEnd) });
            i = strEnd;
            continue;
          }
          tokens.push({ type: "plain", text: line[i] });
          i++;
        }
        break;
      }
    }

    // 3. String literals "..." or '...'
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let strEnd = i + 1;
      while (strEnd < len) {
        if (line[strEnd] === "\\") {
          strEnd += 2;
          continue;
        }
        if (line[strEnd] === quote) {
          strEnd++;
          break;
        }
        strEnd++;
      }
      tokens.push({ type: "string", text: line.slice(i, strEnd) });
      i = strEnd;
      continue;
    }

    // 4. Hex numbers & regular numbers (0x40020014UL, 0b1010, 100UL, 3.14)
    if (
      /\d/.test(line[i]) ||
      (line[i] === "0" && (line[i + 1] === "x" || line[i + 1] === "X" || line[i + 1] === "b" || line[i + 1] === "B"))
    ) {
      let numEnd = i;
      while (numEnd < len && /[0-9a-fA-F_xXbBuUlLfF\.]/.test(line[numEnd])) {
        numEnd++;
      }
      tokens.push({ type: "number", text: line.slice(i, numEnd) });
      i = numEnd;
      continue;
    }

    // 5. Identifiers, Keywords, Types, Registers, Functions
    if (/[a-zA-Z_]/.test(line[i])) {
      let idEnd = i;
      while (idEnd < len && /[a-zA-Z0-9_]/.test(line[idEnd])) {
        idEnd++;
      }
      const word = line.slice(i, idEnd);

      // Kiểm tra có phải hàm (function call) không
      let isFunc = false;
      let nextCharIdx = idEnd;
      while (nextCharIdx < len && /\s/.test(line[nextCharIdx])) {
        nextCharIdx++;
      }
      if (nextCharIdx < len && line[nextCharIdx] === "(" && !C_KEYWORDS.has(word) && !C_TYPES.has(word)) {
        isFunc = true;
      }

      if (C_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", text: word });
      } else if (C_TYPES.has(word)) {
        tokens.push({ type: "type", text: word });
      } else if (HARDWARE_REGISTERS.has(word)) {
        tokens.push({ type: "register", text: word });
      } else if (isFunc) {
        tokens.push({ type: "function", text: word });
      } else if (word === word.toUpperCase() && word.length > 2 && /^[A-Z0-9_]+$/.test(word)) {
        tokens.push({ type: "macro", text: word });
      } else {
        tokens.push({ type: "plain", text: word });
      }

      i = idEnd;
      continue;
    }

    // 6. Operators & Punctuations
    if (/[+\-*/%=&|<>!^~?:;,.]/.test(line[i])) {
      tokens.push({ type: "operator", text: line[i] });
      i++;
      continue;
    }

    // 7. Brackets & Whitespaces
    tokens.push({ type: "plain", text: line[i] });
    i++;
  }

  return tokens;
}

export function highlightCCpp(code: string, theme: CodeTheme = "dark"): string {
  const lines = code.split("\n");
  return lines.map((l) => renderTokensToHtml(tokenizeCCppLine(l), theme)).join("\n");
}

export function highlightPython(code: string, theme: CodeTheme = "dark"): string {
  const lines = code.split("\n");
  const commentColor = theme === "light" ? "#57606a" : "#6a9955";
  return lines
    .map((line) => {
      if (line.trim().startsWith("#")) {
        return `<span style="color: ${commentColor}; font-style: italic;">${escapeHtml(line)}</span>`;
      }
      return renderTokensToHtml(tokenizeCCppLine(line), theme);
    })
    .join("\n");
}

export function highlightRust(code: string, theme: CodeTheme = "dark"): string {
  const lines = code.split("\n");
  return lines.map((l) => renderTokensToHtml(tokenizeCCppLine(l), theme)).join("\n");
}

export function highlightVerilog(code: string, theme: CodeTheme = "dark"): string {
  const lines = code.split("\n");
  return lines.map((l) => renderTokensToHtml(tokenizeCCppLine(l), theme)).join("\n");
}

export function highlightBash(code: string, theme: CodeTheme = "dark"): string {
  const lines = code.split("\n");
  const commentColor = theme === "light" ? "#57606a" : "#6a9955";
  return lines
    .map((line) => {
      if (line.trim().startsWith("#")) {
        return `<span style="color: ${commentColor}; font-style: italic;">${escapeHtml(line)}</span>`;
      }
      return renderTokensToHtml(tokenizeCCppLine(line), theme);
    })
    .join("\n");
}

/**
 * Universal Highlighter Dispatcher hỗ trợ Theme Dark / Light
 */
export function highlightCode(code: string, language: string = "c", theme: CodeTheme = "dark"): string {
  if (!code) return "";
  const lang = language.toLowerCase();
  if (lang === "c" || lang === "cpp" || lang === "h" || lang === "hpp") {
    return highlightCCpp(code, theme);
  }
  if (lang === "python" || lang === "py") {
    return highlightPython(code, theme);
  }
  if (lang === "rust" || lang === "rs") {
    return highlightRust(code, theme);
  }
  if (lang === "verilog" || lang === "sv" || lang === "systemverilog") {
    return highlightVerilog(code, theme);
  }
  if (lang === "bash" || lang === "sh" || lang === "shell" || lang === "makefile") {
    return highlightBash(code, theme);
  }
  return highlightCCpp(code, theme);
}
