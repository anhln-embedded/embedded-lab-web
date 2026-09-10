/**
 * Quản lý các ngoại vi phần cứng MMIO của STM32F103 (Medium-density)
 * Hỗ trợ RCC, GPIOA, GPIOB, GPIOC, SysTick và USART1
 */

export type PortName = "A" | "B" | "C";

export interface GpioPinChangeCallback {
  (port: PortName, pin: number, level: boolean): void;
}

export interface SerialTxCallback {
  (char: string): void;
}

export class STM32F103Peripherals {
  // Callbacks
  public onGpioChange?: GpioPinChangeCallback;
  public onSerialTx?: SerialTxCallback;

  // RCC Registers (Base 0x40021000)
  public rcc_cr: number = 0x00000083; // HSI ON
  public rcc_cfgr: number = 0x00000000;
  public rcc_apb2enr: number = 0x00000000;
  public rcc_apb1enr: number = 0x00000000;

  // GPIO Port C (Base 0x40011000)
  public gpioc_crl: number = 0x44444444;
  public gpioc_crh: number = 0x44444444; // PC13 mặc định Floating Input (0x4)
  public gpioc_idr: number = 0x00002000; // Bit 13 mặc định HIGH (nút/pull-up)
  public gpioc_odr: number = 0x00002000;

  // GPIO Port A (Base 0x40010800)
  public gpioa_crl: number = 0x44444444;
  public gpioa_crh: number = 0x44444444;
  public gpioa_idr: number = 0x00000000;
  public gpioa_odr: number = 0x00000000;

  // GPIO Port B (Base 0x40010C00)
  public gpiob_crl: number = 0x44444444;
  public gpiob_crh: number = 0x44444444;
  public gpiob_idr: number = 0x00000000;
  public gpiob_odr: number = 0x00000000;

  // SysTick Registers (Base 0xE000E010)
  public systick_ctrl: number = 0;
  public systick_load: number = 0;
  public systick_val: number = 0;

  // USART1 Registers (Base 0x40013800)
  public usart1_sr: number = 0x000000C0; // TXE=1, TC=1 (luôn sẵn sàng nhận data)
  public usart1_dr: number = 0;
  public usart1_brr: number = 0;
  public usart1_cr1: number = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.rcc_apb2enr = 0;
    this.rcc_apb1enr = 0;

    this.gpioc_crl = 0x44444444;
    this.gpioc_crh = 0x44444444;
    this.gpioc_idr = 0x00002000;
    this.gpioc_odr = 0x00002000;

    this.gpioa_crl = 0x44444444;
    this.gpioa_crh = 0x44444444;
    this.gpioa_idr = 0;
    this.gpioa_odr = 0;

    this.gpiob_crl = 0x44444444;
    this.gpiob_crh = 0x44444444;
    this.gpiob_idr = 0;
    this.gpiob_odr = 0;

    this.systick_ctrl = 0;
    this.systick_load = 0;
    this.systick_val = 0;

    this.usart1_sr = 0x000000C0;
  }

  /**
   * Cập nhật trạng thái tín hiệu đầu vào cho chân Pin từ Web UI (ví dụ Nút nhấn)
   */
  public setPinInput(port: PortName, pin: number, level: boolean): void {
    if (port === "A") {
      if (level) this.gpioa_idr |= (1 << pin);
      else this.gpioa_idr &= ~(1 << pin);
    } else if (port === "B") {
      if (level) this.gpiob_idr |= (1 << pin);
      else this.gpiob_idr &= ~(1 << pin);
    } else if (port === "C") {
      if (level) this.gpioc_idr |= (1 << pin);
      else this.gpioc_idr &= ~(1 << pin);
    }
  }

  /**
   * Cập nhật SysTick theo chu kỳ lệnh ảo
   */
  public tickSysTick(cycles: number = 1): boolean {
    // Nếu SysTick ENABLE bit (bit 0) được bật
    if (this.systick_ctrl & 0x01) {
      if (this.systick_val <= cycles) {
        this.systick_val = this.systick_load;
        this.systick_ctrl |= (1 << 16); // Set COUNTFLAG
        // Trả về true nếu TICKINT (bit 1) được bật để báo kích hoạt ngắt SysTick
        return (this.systick_ctrl & 0x02) !== 0;
      } else {
        this.systick_val -= cycles;
      }
    }
    return false;
  }

  public isMmioAddress(addr: number): boolean {
    const a = addr >>> 0;
    return (
      (a >= 0x40000000 && a < 0x40030000) || // Peripherals
      (a >= 0xe000e000 && a < 0xe000f000) // System Control Space (SysTick, NVIC)
    );
  }

  public read32(addr: number): number {
    const a = addr >>> 0;

    // RCC
    if (a === 0x40021018) return this.rcc_apb2enr;
    if (a === 0x4002101c) return this.rcc_apb1enr;
    if (a === 0x40021000) return this.rcc_cr;
    if (a === 0x40021004) return this.rcc_cfgr;

    // GPIOC
    if (a === 0x40011000) return this.gpioc_crl;
    if (a === 0x40011004) return this.gpioc_crh;
    if (a === 0x40011008) return this.gpioc_idr;
    if (a === 0x4001100c) return this.gpioc_odr;

    // GPIOA
    if (a === 0x40010800) return this.gpioa_crl;
    if (a === 0x40010804) return this.gpioa_crh;
    if (a === 0x40010808) return this.gpioa_idr;
    if (a === 0x4001080c) return this.gpioa_odr;

    // GPIOB
    if (a === 0x40010c00) return this.gpiob_crl;
    if (a === 0x40010c04) return this.gpiob_crh;
    if (a === 0x40010c08) return this.gpiob_idr;
    if (a === 0x40010c0c) return this.gpiob_odr;

    // SysTick
    if (a === 0xe000e010) {
      const val = this.systick_ctrl;
      this.systick_ctrl &= ~(1 << 16); // Đọc CTRL sẽ clear COUNTFLAG
      return val;
    }
    if (a === 0xe000e014) return this.systick_load;
    if (a === 0xe000e018) return this.systick_val;

    // USART1
    if (a === 0x40013800) return this.usart1_sr;
    if (a === 0x40013804) return this.usart1_dr;
    if (a === 0x40013808) return this.usart1_brr;
    if (a === 0x4001380c) return this.usart1_cr1;

    return 0;
  }

  public write32(addr: number, val: number): void {
    const a = addr >>> 0;
    val = val >>> 0;

    // RCC
    if (a === 0x40021018) {
      this.rcc_apb2enr = val;
      return;
    }
    if (a === 0x4002101c) {
      this.rcc_apb1enr = val;
      return;
    }
    if (a === 0x40021000) {
      this.rcc_cr = val;
      return;
    }
    if (a === 0x40021004) {
      this.rcc_cfgr = val;
      return;
    }

    // GPIOC
    if (a === 0x40011000) {
      this.gpioc_crl = val;
      return;
    }
    if (a === 0x40011004) {
      this.gpioc_crh = val;
      return;
    }
    if (a === 0x4001100c) {
      // Ghi trực tiếp ODR
      const oldOdr = this.gpioc_odr;
      this.gpioc_odr = val;
      this.notifyGpioChanges("C", oldOdr, val);
      return;
    }
    if (a === 0x40011010) {
      // BSRR: 16 bit thấp SET (1), 16 bit cao RESET (0)
      const setBits = val & 0xffff;
      const resetBits = (val >>> 16) & 0xffff;
      const oldOdr = this.gpioc_odr;
      this.gpioc_odr = (this.gpioc_odr | setBits) & ~resetBits;
      this.notifyGpioChanges("C", oldOdr, this.gpioc_odr);
      return;
    }
    if (a === 0x40011014) {
      // BRR: 16 bit RESET (0)
      const resetBits = val & 0xffff;
      const oldOdr = this.gpioc_odr;
      this.gpioc_odr = this.gpioc_odr & ~resetBits;
      this.notifyGpioChanges("C", oldOdr, this.gpioc_odr);
      return;
    }

    // GPIOA
    if (a === 0x40010800) {
      this.gpioa_crl = val;
      return;
    }
    if (a === 0x40010804) {
      this.gpioa_crh = val;
      return;
    }
    if (a === 0x4001080c) {
      const oldOdr = this.gpioa_odr;
      this.gpioa_odr = val;
      this.notifyGpioChanges("A", oldOdr, val);
      return;
    }
    if (a === 0x40010810) {
      const setBits = val & 0xffff;
      const resetBits = (val >>> 16) & 0xffff;
      const oldOdr = this.gpioa_odr;
      this.gpioa_odr = (this.gpioa_odr | setBits) & ~resetBits;
      this.notifyGpioChanges("A", oldOdr, this.gpioa_odr);
      return;
    }
    if (a === 0x40010814) {
      const resetBits = val & 0xffff;
      const oldOdr = this.gpioa_odr;
      this.gpioa_odr = this.gpioa_odr & ~resetBits;
      this.notifyGpioChanges("A", oldOdr, this.gpioa_odr);
      return;
    }

    // GPIOB
    if (a === 0x40010c00) {
      this.gpiob_crl = val;
      return;
    }
    if (a === 0x40010c04) {
      this.gpiob_crh = val;
      return;
    }
    if (a === 0x40010c0c) {
      const oldOdr = this.gpiob_odr;
      this.gpiob_odr = val;
      this.notifyGpioChanges("B", oldOdr, val);
      return;
    }
    if (a === 0x40010c10) {
      const setBits = val & 0xffff;
      const resetBits = (val >>> 16) & 0xffff;
      const oldOdr = this.gpiob_odr;
      this.gpiob_odr = (this.gpiob_odr | setBits) & ~resetBits;
      // Khi IPU (Input Pull-up), SPL set ODR bit = 1 để kích hoạt pull-up resistor
      this.gpiob_idr |= setBits;
      this.gpiob_idr &= ~resetBits;
      this.notifyGpioChanges("B", oldOdr, this.gpiob_odr);
      return;
    }
    if (a === 0x40010c14) {
      const resetBits = val & 0xffff;
      const oldOdr = this.gpiob_odr;
      this.gpiob_odr = this.gpiob_odr & ~resetBits;
      this.gpiob_idr &= ~resetBits;
      this.notifyGpioChanges("B", oldOdr, this.gpiob_odr);
      return;
    }

    // SysTick
    if (a === 0xe000e010) {
      this.systick_ctrl = val;
      return;
    }
    if (a === 0xe000e014) {
      this.systick_load = val & 0x00ffffff;
      return;
    }
    if (a === 0xe000e018) {
      this.systick_val = 0; // Ghi bất kỳ giá trị nào vào VAL sẽ reset về 0
      return;
    }

    // USART1
    if (a === 0x40013804) {
      // Ghi ký tự vào DR
      const byteChar = String.fromCharCode(val & 0xff);
      this.usart1_dr = val & 0x1ff;
      if (this.onSerialTx) {
        this.onSerialTx(byteChar);
      }
      return;
    }
    if (a === 0x40013808) {
      this.usart1_brr = val;
      return;
    }
    if (a === 0x4001380c) {
      this.usart1_cr1 = val;
      return;
    }
  }

  private notifyGpioChanges(port: PortName, oldOdr: number, newOdr: number): void {
    if (!this.onGpioChange) return;
    const diff = (oldOdr ^ newOdr) >>> 0;
    for (let pin = 0; pin < 16; pin++) {
      if (diff & (1 << pin)) {
        const level = (newOdr & (1 << pin)) !== 0;
        this.onGpioChange(port, pin, level);
      }
    }
  }
}
