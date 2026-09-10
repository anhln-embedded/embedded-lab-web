/**
 * Bộ giải mã định dạng file Intel HEX chuẩn (sử dụng bởi Keil C, GCC-ARM, IAR)
 * Dành riêng cho vi điều khiển STM32 (Base Flash: 0x08000000)
 */

export interface ParsedHexResult {
  flash: Uint8Array; // 128KB Flash Buffer (0x08000000 - 0x0801FFFF)
  baseAddress: number;
  minAddress: number;
  maxAddress: number;
  totalBytes: number;
  initialMSP: number; // Main Stack Pointer khởi tạo (đọc từ 0x08000000)
  resetHandler: number; // Vector Reset_Handler (đọc từ 0x08000004)
  entryAddress: number;
}

export function parseIntelHex(hexContent: string, flashSize: number = 128 * 1024): ParsedHexResult {
  const flash = new Uint8Array(flashSize);
  const STM32_FLASH_BASE = 0x08000000;
  
  let upperAddress = 0;
  let minAddress = Infinity;
  let maxAddress = 0;
  let totalBytes = 0;
  let entryAddress = 0;

  const lines = hexContent.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex].trim();
    if (!rawLine.startsWith(":")) continue;

    const byteCount = parseInt(rawLine.substring(1, 3), 16);
    const addressOffset = parseInt(rawLine.substring(3, 7), 16);
    const recordType = parseInt(rawLine.substring(7, 9), 16);
    const dataHex = rawLine.substring(9, 9 + byteCount * 2);
    const checksum = parseInt(rawLine.substring(9 + byteCount * 2, 11 + byteCount * 2), 16);

    // Xác thực checksum
    let sum = byteCount + (addressOffset >> 8) + (addressOffset & 0xff) + recordType;
    for (let i = 0; i < byteCount; i++) {
      sum += parseInt(dataHex.substring(i * 2, i * 2 + 2), 16);
    }
    if (((~sum + 1) & 0xff) !== checksum) {
      console.warn(`[IntelHexParser] Checksum cảnh báo ở dòng ${lineIndex + 1}`);
    }

    if (recordType === 0x00) {
      // Data Record
      const fullAddress = upperAddress | addressOffset;
      const flashOffset = fullAddress - STM32_FLASH_BASE;

      for (let i = 0; i < byteCount; i++) {
        const byteVal = parseInt(dataHex.substring(i * 2, i * 2 + 2), 16);
        if (flashOffset + i >= 0 && flashOffset + i < flashSize) {
          flash[flashOffset + i] = byteVal;
          const currentAddr = fullAddress + i;
          if (currentAddr < minAddress) minAddress = currentAddr;
          if (currentAddr > maxAddress) maxAddress = currentAddr;
          totalBytes++;
        }
      }
    } else if (recordType === 0x01) {
      // End of File Record
      break;
    } else if (recordType === 0x02) {
      // Extended Segment Address Record (x16)
      upperAddress = parseInt(dataHex, 16) << 4;
    } else if (recordType === 0x04) {
      // Extended Linear Address Record (x65536) -> Thường là 0x0800 để thành 0x08000000
      upperAddress = parseInt(dataHex, 16) << 16;
    } else if (recordType === 0x05) {
      // Start Linear Address Record
      entryAddress = parseInt(dataHex, 16);
    }
  }

  // Đọc MSP và Reset_Handler từ Vector Table ở địa chỉ 0x08000000
  const initialMSP =
    flash[0] | (flash[1] << 8) | (flash[2] << 16) | (flash[3] << 24);

  const resetHandler =
    flash[4] | (flash[5] << 8) | (flash[6] << 16) | (flash[7] << 24);

  return {
    flash,
    baseAddress: STM32_FLASH_BASE,
    minAddress: minAddress === Infinity ? STM32_FLASH_BASE : minAddress,
    maxAddress,
    totalBytes,
    initialMSP: initialMSP >>> 0,
    resetHandler: resetHandler >>> 0,
    entryAddress: entryAddress || resetHandler,
  };
}
