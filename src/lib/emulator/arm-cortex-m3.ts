/**
 * Lõi giả lập vi xử lý ARM Cortex-M3 (ARMv7-M)
 * Chuyên biệt cho vi điều khiển STM32F103 (Thumb / Thumb-2 instructions)
 */

import { STM32F103Peripherals } from "./stm32f103-peripherals";

export interface CpuState {
  r: number[]; // R0 - R12
  sp: number; // R13 (SP / MSP)
  lr: number; // R14 (LR)
  pc: number; // R15 (PC)
  xpsr: number;
  flags: { n: boolean; z: boolean; c: boolean; v: boolean };
  cycles: number;
  instructionsExecuted: number;
  halted: boolean;
}

export class ArmCortexM3 {
  // Thanh ghi
  public r = new Uint32Array(13); // R0 - R12
  public sp: number = 0x20005000; // R13
  public lr: number = 0xffffffff; // R14
  public pc: number = 0x08000000; // R15
  public xpsr: number = 0x01000000; // T-bit = 1 (Thumb mode)

  // Cờ trạng thái (Flags)
  public flagN: boolean = false; // Negative
  public flagZ: boolean = false; // Zero
  public flagC: boolean = false; // Carry
  public flagV: boolean = false; // Overflow

  // Bộ nhớ
  public flash: Uint8Array; // 128KB Flash (Base 0x08000000)
  public ram = new Uint8Array(20 * 1024); // 20KB SRAM (Base 0x20000000)
  public peripherals: STM32F103Peripherals;

  // Thống kê
  public cycles: number = 0;
  public instructionsExecuted: number = 0;
  public halted: boolean = false;

  private readonly FLASH_BASE = 0x08000000;
  private readonly FLASH_SIZE = 128 * 1024;
  private readonly RAM_BASE = 0x20000000;
  private readonly RAM_SIZE = 20 * 1024;

  constructor(flash: Uint8Array, peripherals: STM32F103Peripherals) {
    this.flash = flash;
    this.peripherals = peripherals;
  }

  public reset(initialMSP?: number, resetHandler?: number): void {
    this.r.fill(0);
    this.lr = 0xffffffff;
    this.xpsr = 0x01000000;
    this.flagN = false;
    this.flagZ = false;
    this.flagC = false;
    this.flagV = false;
    this.cycles = 0;
    this.instructionsExecuted = 0;
    this.halted = false;
    this.ram.fill(0);
    this.peripherals.reset();

    if (initialMSP !== undefined && resetHandler !== undefined) {
      this.sp = initialMSP >>> 0;
      this.pc = (resetHandler & ~1) >>> 0; // Xóa bit 0 Thumb
    } else {
      this.sp = this.read32(this.FLASH_BASE) >>> 0;
      this.pc = (this.read32(this.FLASH_BASE + 4) & ~1) >>> 0;
    }
  }

  // --- BỘ NHỚ (MEMORY ACCESS) ---

  public read8(addr: number): number {
    const a = addr >>> 0;
    if (a >= this.FLASH_BASE && a < this.FLASH_BASE + this.FLASH_SIZE) {
      return this.flash[a - this.FLASH_BASE];
    }
    if (a >= this.RAM_BASE && a < this.RAM_BASE + this.RAM_SIZE) {
      return this.ram[a - this.RAM_BASE];
    }
    if (this.peripherals.isMmioAddress(a)) {
      return (this.peripherals.read32(a & ~3) >>> ((a & 3) * 8)) & 0xff;
    }
    return 0;
  }

  public read16(addr: number): number {
    return this.read8(addr) | (this.read8(addr + 1) << 8);
  }

  public read32(addr: number): number {
    const a = addr >>> 0;
    if (this.peripherals.isMmioAddress(a)) {
      return this.peripherals.read32(a);
    }
    return (
      this.read8(a) |
      (this.read8(a + 1) << 8) |
      (this.read8(a + 2) << 16) |
      (this.read8(a + 3) << 24)
    ) >>> 0;
  }

  public write8(addr: number, val: number): void {
    const a = addr >>> 0;
    val = val & 0xff;
    if (a >= this.RAM_BASE && a < this.RAM_BASE + this.RAM_SIZE) {
      this.ram[a - this.RAM_BASE] = val;
    } else if (this.peripherals.isMmioAddress(a)) {
      // MMIO thường xử lý 32-bit
      const aligned = a & ~3;
      const shift = (a & 3) * 8;
      let cur = this.peripherals.read32(aligned);
      cur = (cur & ~(0xff << shift)) | (val << shift);
      this.peripherals.write32(aligned, cur);
    }
  }

  public write16(addr: number, val: number): void {
    this.write8(addr, val & 0xff);
    this.write8(addr + 1, (val >> 8) & 0xff);
  }

  public write32(addr: number, val: number): void {
    const a = addr >>> 0;
    val = val >>> 0;
    if (this.peripherals.isMmioAddress(a)) {
      this.peripherals.write32(a, val);
      return;
    }
    if (a >= this.RAM_BASE && a < this.RAM_BASE + this.RAM_SIZE) {
      const off = a - this.RAM_BASE;
      this.ram[off] = val & 0xff;
      this.ram[off + 1] = (val >> 8) & 0xff;
      this.ram[off + 2] = (val >> 16) & 0xff;
      this.ram[off + 3] = (val >> 24) & 0xff;
    }
  }

  public getReg(reg: number): number {
    if (reg >= 0 && reg <= 12) return this.r[reg];
    if (reg === 13) return this.sp;
    if (reg === 14) return this.lr;
    if (reg === 15) return this.pc;
    return 0;
  }

  public setReg(reg: number, val: number): void {
    val = val >>> 0;
    if (reg >= 0 && reg <= 12) this.r[reg] = val;
    else if (reg === 13) this.sp = val;
    else if (reg === 14) this.lr = val;
    else if (reg === 15) this.pc = val;
  }

  // Cập nhật cờ Zero và Negative
  private updateNZ(val: number): void {
    const v = val >>> 0;
    this.flagZ = v === 0;
    this.flagN = (v & 0x80000000) !== 0;
  }

  // --- THỰC THI LỆNH (FETCH - DECODE - EXECUTE) ---

  public step(): number {
    if (this.halted) return 0;

    const op1 = this.read16(this.pc);
    this.pc = (this.pc + 2) >>> 0;
    this.instructionsExecuted++;
    this.cycles += 1;
    this.peripherals.tickSysTick(1);

    // 1. NOP
    if (op1 === 0xbf00) {
      return 1;
    }

    // 1.1 LSLS Rd, Rm, #imm5 (0x0000 | (imm5 << 6) | (rm << 3) | rd)
    if ((op1 & 0xf800) === 0x0000) {
      const imm5 = (op1 >> 6) & 0x1f;
      const rm = (op1 >> 3) & 7;
      const rd = op1 & 7;
      const val = this.getReg(rm);
      const res = (val << imm5) >>> 0;
      this.setReg(rd, res);
      this.updateNZ(res);
      if (imm5 > 0) this.flagC = ((val >> (32 - imm5)) & 1) !== 0;
      return 1;
    }

    // 1.2 LSRS Rd, Rm, #imm5 (0x0800)
    if ((op1 & 0xf800) === 0x0800) {
      const imm5 = (op1 >> 6) & 0x1f;
      const rm = (op1 >> 3) & 7;
      const rd = op1 & 7;
      const val = this.getReg(rm);
      const shift = imm5 === 0 ? 32 : imm5;
      const res = (val >>> shift) >>> 0;
      this.setReg(rd, res);
      this.updateNZ(res);
      return 1;
    }

    // 1.3 Data-processing register (0x4000)
    if ((op1 & 0xfc00) === 0x4000) {
      const subOp = (op1 >> 6) & 0x0f;
      const rm = (op1 >> 3) & 7;
      const rd = op1 & 7;
      const valD = this.getReg(rd);
      const valM = this.getReg(rm);
      let res = valD;

      if (subOp === 0x0) res = (valD & valM) >>> 0; // ANDS
      else if (subOp === 0x1) res = (valD ^ valM) >>> 0; // EORS
      else if (subOp === 0xc) res = (valD | valM) >>> 0; // ORRS
      else if (subOp === 0xe) res = (valD & ~valM) >>> 0; // BICS
      else if (subOp === 0xf) res = (~valM) >>> 0; // MVNS

      this.setReg(rd, res);
      this.updateNZ(res);
      return 1;
    }

    // 2. LDR Rd, [PC, #imm] (0x4800 | (rd << 8) | imm8)
    if ((op1 & 0xf800) === 0x4800) {
      const rd = (op1 >> 8) & 7;
      const imm8 = op1 & 0xff;
      const targetAddr = ((this.pc + 2) & ~3) + imm8 * 4;
      this.setReg(rd, this.read32(targetAddr));
      return 2;
    }

    // 3. MOV / MOVS Rd, #imm8 (0x2000 | (rd << 8) | imm8)
    if ((op1 & 0xf800) === 0x2000) {
      const rd = (op1 >> 8) & 7;
      const imm8 = op1 & 0xff;
      this.setReg(rd, imm8);
      this.updateNZ(imm8);
      return 1;
    }

    // 4. CMP Rn, #imm8 (0x2800 | (rn << 8) | imm8)
    if ((op1 & 0xf800) === 0x2800) {
      const rn = (op1 >> 8) & 7;
      const imm8 = op1 & 0xff;
      const val = this.getReg(rn);
      const res = (val - imm8) >>> 0;
      this.updateNZ(res);
      this.flagC = val >= imm8;
      return 1;
    }

    // 5. ADD Rd, #imm8 (0x3000 | (rd << 8) | imm8)
    if ((op1 & 0xf800) === 0x3000) {
      const rd = (op1 >> 8) & 7;
      const imm8 = op1 & 0xff;
      const cur = this.getReg(rd);
      const res = (cur + imm8) >>> 0;
      this.setReg(rd, res);
      this.updateNZ(res);
      return 1;
    }

    // 6. SUB Rd, #imm8 (0x3800 | (rd << 8) | imm8)
    if ((op1 & 0xf800) === 0x3800) {
      const rd = (op1 >> 8) & 7;
      const imm8 = op1 & 0xff;
      const cur = this.getReg(rd);
      const res = (cur - imm8) >>> 0;
      this.setReg(rd, res);
      this.updateNZ(res);
      this.flagC = cur >= imm8;
      return 1;
    }

    // 7. PUSH {reg_list, lr} (0xb400 | (lr << 8) | reg_list)
    if ((op1 & 0xfe00) === 0xb400) {
      const hasLr = (op1 & 0x0100) !== 0;
      const list = op1 & 0xff;
      if (hasLr) {
        this.sp = (this.sp - 4) >>> 0;
        this.write32(this.sp, this.lr);
      }
      for (let i = 7; i >= 0; i--) {
        if (list & (1 << i)) {
          this.sp = (this.sp - 4) >>> 0;
          this.write32(this.sp, this.getReg(i));
        }
      }
      return 2;
    }

    // 8. POP {reg_list, pc} (0xbc00 | (pc << 8) | reg_list)
    if ((op1 & 0xfe00) === 0xbc00) {
      const hasPc = (op1 & 0x0100) !== 0;
      const list = op1 & 0xff;
      for (let i = 0; i <= 7; i++) {
        if (list & (1 << i)) {
          this.setReg(i, this.read32(this.sp));
          this.sp = (this.sp + 4) >>> 0;
        }
      }
      if (hasPc) {
        const nextPc = this.read32(this.sp);
        this.sp = (this.sp + 4) >>> 0;
        this.pc = (nextPc & ~1) >>> 0;
      }
      return 2;
    }

    // 9. BX Rm (0x4700 | (rm << 3))
    if ((op1 & 0xff87) === 0x4700) {
      const rm = (op1 >> 3) & 0x0f;
      const target = this.getReg(rm);
      this.pc = (target & ~1) >>> 0;
      return 2;
    }

    // 10. B <unconditional> (0xe000 | offset11)
    if ((op1 & 0xf800) === 0xe000) {
      let imm11 = op1 & 0x07ff;
      if (imm11 & 0x0400) imm11 |= ~0x07ff; // Sign-extend
      this.pc = (this.pc + 2 + imm11 * 2) >>> 0;
      return 2;
    }

    // 11. B<cond> (0xd000 | (cond << 8) | offset8)
    if ((op1 & 0xf000) === 0xd000 && (op1 & 0x0e00) !== 0x0e00) {
      const cond = (op1 >> 8) & 0x0f;
      let imm8 = op1 & 0xff;
      if (imm8 & 0x80) imm8 |= ~0xff; // Sign-extend
      if (this.checkCondition(cond)) {
        this.pc = (this.pc + 2 + imm8 * 2) >>> 0;
      }
      return 2;
    }

    // 12. CBZ / CBNZ Rn, #imm
    if ((op1 & 0xf500) === 0xb100) {
      const isCbnz = (op1 & 0x0200) !== 0;
      const rn = op1 & 7;
      const imm = (((op1 >> 9) & 1) << 6) | (((op1 >> 3) & 0x1f) << 1);
      const val = this.getReg(rn);
      if ((isCbnz && val !== 0) || (!isCbnz && val === 0)) {
        this.pc = (this.pc + 2 + imm) >>> 0;
      }
      return 2;
    }

    // 13. STR Rd, [Rn, #imm5*4] (0x6000)
    if ((op1 & 0xf800) === 0x6000) {
      const imm5 = (op1 >> 6) & 0x1f;
      const rn = (op1 >> 3) & 7;
      const rd = op1 & 7;
      const addr = (this.getReg(rn) + imm5 * 4) >>> 0;
      this.write32(addr, this.getReg(rd));
      return 2;
    }

    // 14. LDR Rd, [Rn, #imm5*4] (0x6800)
    if ((op1 & 0xf800) === 0x6800) {
      const imm5 = (op1 >> 6) & 0x1f;
      const rn = (op1 >> 3) & 7;
      const rd = op1 & 7;
      const addr = (this.getReg(rn) + imm5 * 4) >>> 0;
      this.setReg(rd, this.read32(addr));
      return 2;
    }

    // 15. THUMB-2 (32-bit instruction): Opcode bắt đầu bằng 0xF000, 0xF800, 0xE800
    if ((op1 & 0xf000) === 0xf000 || (op1 & 0xf800) === 0xe800) {
      const op2 = this.read16(this.pc);
      this.pc = (this.pc + 2) >>> 0;

      // BL target (Branch with Link): 0xf000 | 0xf800
      if ((op1 & 0xf800) === 0xf000 && (op2 & 0xd000) === 0xd000) {
        let s = (op1 >> 10) & 1;
        let imm10 = op1 & 0x3ff;
        let j1 = (op2 >> 13) & 1;
        let j2 = (op2 >> 11) & 1;
        let imm11 = op2 & 0x7ff;

        let i1 = ~(j1 ^ s) & 1;
        let i2 = ~(j2 ^ s) & 1;
        let offset = (s << 24) | (i1 << 23) | (i2 << 22) | (imm10 << 12) | (imm11 << 1);
        if (s) offset |= ~0x01ffffff; // Sign-extend 25-bit

        this.lr = (this.pc | 1) >>> 0;
        this.pc = (this.pc + offset) >>> 0;
        return 4;
      }

      // MOVW Rd, #imm16 (0xf240)
      if ((op1 & 0xfbf0) === 0xf240 && (op2 & 0x8000) === 0) {
        const i = (op1 >> 10) & 1;
        const imm4 = op1 & 0x0f;
        const imm3 = (op2 >> 12) & 7;
        const rd = (op2 >> 8) & 0x0f;
        const imm8 = op2 & 0xff;
        const imm16 = (imm4 << 12) | (i << 11) | (imm3 << 8) | imm8;
        this.setReg(rd, imm16);
        return 2;
      }

      // MOVT Rd, #imm16 (0xf2c0)
      if ((op1 & 0xfbf0) === 0xf2c0 && (op2 & 0x8000) === 0) {
        const i = (op1 >> 10) & 1;
        const imm4 = op1 & 0x0f;
        const imm3 = (op2 >> 12) & 7;
        const rd = (op2 >> 8) & 0x0f;
        const imm8 = op2 & 0xff;
        const imm16 = (imm4 << 12) | (i << 11) | (imm3 << 8) | imm8;
        const cur = this.getReg(rd);
        this.setReg(rd, (cur & 0x0000ffff) | (imm16 << 16));
        return 2;
      }

      // LDR.W Rd, [Rn, #imm12] (0xf8d0)
      if ((op1 & 0xfff0) === 0xf8d0) {
        const rn = op1 & 0x0f;
        const rd = (op2 >> 12) & 0x0f;
        const imm12 = op2 & 0x0fff;
        const addr = (this.getReg(rn) + imm12) >>> 0;
        this.setReg(rd, this.read32(addr));
        return 2;
      }

      // STR.W Rd, [Rn, #imm12] (0xf8c0)
      if ((op1 & 0xfff0) === 0xf8c0) {
        const rn = op1 & 0x0f;
        const rd = (op2 >> 12) & 0x0f;
        const imm12 = op2 & 0x0fff;
        const addr = (this.getReg(rn) + imm12) >>> 0;
        this.write32(addr, this.getReg(rd));
        return 2;
      }
    }

    return 1;
  }

  private checkCondition(cond: number): boolean {
    switch (cond) {
      case 0x0: return this.flagZ; // EQ
      case 0x1: return !this.flagZ; // NE
      case 0x2: return this.flagC; // CS / HS
      case 0x3: return !this.flagC; // CC / LO
      case 0x4: return this.flagN; // MI
      case 0x5: return !this.flagN; // PL
      case 0x6: return this.flagV; // VS
      case 0x7: return !this.flagV; // VC
      case 0x8: return this.flagC && !this.flagZ; // HI
      case 0x9: return !this.flagC || this.flagZ; // LS
      case 0xa: return this.flagN === this.flagV; // GE
      case 0xb: return this.flagN !== this.flagV; // LT
      case 0xc: return !this.flagZ && this.flagN === this.flagV; // GT
      case 0xd: return this.flagZ || this.flagN !== this.flagV; // LE
      case 0xe: return true; // AL (Always)
      default: return true;
    }
  }

  /**
   * Chạy một loạt lệnh (batch) trong một khung hình để đạt tốc độ thời gian thực
   */
  public runBatch(count: number = 20000): void {
    for (let i = 0; i < count && !this.halted; i++) {
      this.step();
    }
  }

  public getCpuState(): CpuState {
    return {
      r: Array.from(this.r),
      sp: this.sp,
      lr: this.lr,
      pc: this.pc,
      xpsr: this.xpsr,
      flags: {
        n: this.flagN,
        z: this.flagZ,
        c: this.flagC,
        v: this.flagV,
      },
      cycles: this.cycles,
      instructionsExecuted: this.instructionsExecuted,
      halted: this.halted,
    };
  }
}
