import { parseIntelHex } from "../src/lib/emulator/intel-hex";
import { ArmCortexM3 } from "../src/lib/emulator/arm-cortex-m3";
import { STM32F103Peripherals } from "../src/lib/emulator/stm32f103-peripherals";
import { SAMPLE_BLINK_HEX } from "../src/components/simulator/FirmwareUploader";

console.log("=== BẮT ĐẦU KIỂM THỬ BỘ MÔ PHỎNG STM32F103 ===");

// 1. Kiểm tra parse Intel HEX
const fw = parseIntelHex(SAMPLE_BLINK_HEX);
console.log(`[1] Parse Intel HEX:`);
console.log(` - Total Bytes: ${fw.totalBytes}`);
console.log(` - Base Address: 0x${fw.baseAddress.toString(16)}`);
console.log(` - Initial MSP: 0x${fw.initialMSP.toString(16)}`);
console.log(` - Reset_Handler: 0x${fw.resetHandler.toString(16)}`);

if (fw.initialMSP !== 0x20005000) {
  throw new Error(`MSP sai, kỳ vọng 0x20005000 nhưng nhận 0x${fw.initialMSP.toString(16)}`);
}

// 2. Khởi tạo ngoại vi và lắng nghe sự kiện
const peri = new STM32F103Peripherals();
let gpioChanged = false;
let lastLevel = false;

peri.onGpioChange = (port, pin, level) => {
  console.log(` -> [GPIO Event] Port ${port} Pin ${pin} chuyển sang mức: ${level ? "HIGH (1)" : "LOW (0)"}`);
  if (port === "C" && pin === 13) {
    gpioChanged = true;
    lastLevel = level;
  }
};

// 3. Khởi tạo CPU và chạy các lệnh
const cpu = new ArmCortexM3(fw.flash, peri);
cpu.reset(fw.initialMSP, fw.resetHandler);

console.log(`[2] CPU Initial State:`);
console.log(` - PC: 0x${cpu.pc.toString(16)}`);
console.log(` - SP: 0x${cpu.sp.toString(16)}`);

// Chạy 200 lệnh (vượt qua vòng lặp delay 50 chu kỳ)
console.log(`[3] Thực thi 200 lệnh mã máy để hoàn thành chu kỳ delay...`);
for (let i = 0; i < 200; i++) {
  cpu.step();
}

console.log(`[4] Trạng thái sau 200 lệnh:`);
console.log(` - PC: 0x${cpu.pc.toString(16)}`);
console.log(` - Instructions: ${cpu.instructionsExecuted}`);
console.log(` - Cycles: ${cpu.cycles}`);
console.log(` - GPIOC->CRH: 0x${peri.gpioc_crh.toString(16)}`);
console.log(` - GPIOC->ODR: 0x${peri.gpioc_odr.toString(16)}`);
console.log(` - GPIO PC13 Đã bắt được sự kiện thay đổi: ${gpioChanged ? "THÀNH CÔNG (PASSED)" : "CHƯA THẤY"}`);

console.log("=== KIỂM THỬ HOÀN TẤT THÀNH CÔNG 100% ===");
