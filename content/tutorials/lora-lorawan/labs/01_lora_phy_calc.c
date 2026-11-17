/**
 * @file 01_lora_phy_calc.c
 * @brief Bộ công cụ tính toán tham số Tầng Vật Lý LoRa PHY theo chuẩn Semtech
 * @author Embedded-AIoT Lab PTIT
 */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <stdbool.h>

typedef struct {
    uint8_t sf;             // Spreading Factor (7 - 12)
    double bw_khz;          // Bandwidth in kHz (125, 250, 500)
    uint8_t cr;             // Coding rate denominator: 5 for 4/5, 6 for 4/6, etc.
    uint16_t preamble_len;  // Preamble length in symbols (default 8)
    bool header_explicit;   // Explicit header mode (true) or Implicit (false)
    bool low_dr_opt;        // Low Data Rate Optimization (mandatory for SF11, SF12 at BW 125kHz)
    bool crc_enabled;       // Payload CRC enabled
} lora_config_t;

/**
 * @brief Tính toán thời gian truyền sóng trên không (Time on Air - ToA)
 */
double calculate_lora_toa(const lora_config_t *cfg, uint8_t payload_bytes) {
    double bw_hz = cfg->bw_khz * 1000.0;
    double t_sym = pow(2.0, cfg->sf) / bw_hz; // Symbol duration in seconds

    // 1. Thời gian Preamble
    double t_preamble = (cfg->preamble_len + 4.25) * t_sym;

    // 2. Số lượng Payload Symbols theo công thức chuẩn Semtech SX1262
    double term1 = 8.0 * payload_bytes - 4.0 * cfg->sf + 28.0 + (cfg->crc_enabled ? 16.0 : 0.0) - (cfg->header_explicit ? 0.0 : 20.0);
    double term2 = 4.0 * (cfg->sf - (cfg->low_dr_opt ? 2.0 : 0.0));
    
    double payload_sym_nb = ceil(term1 / term2) * cfg->cr;
    if (payload_sym_nb < 0.0) {
        payload_sym_nb = 0.0;
    }
    payload_sym_nb += 8.0;

    double t_payload = payload_sym_nb * t_sym;
    return (t_preamble + t_payload) * 1000.0; // Trả về mili-giây (ms)
}

int main(void) {
    printf("===============================================================\n");
    printf("   EMBEDDED-AIOT LAB: BỘ CÔNG CỤ TÍNH THAM SỐ LORA PHY        \n");
    printf("===============================================================\n\n");

    lora_config_t config = {
        .sf = 10,
        .bw_khz = 125.0,
        .cr = 5,              // CR 4/5
        .preamble_len = 8,
        .header_explicit = true,
        .low_dr_opt = false,
        .crc_enabled = true
    };

    uint8_t payload_len = 20; // 20 bytes
    double bw_hz = config.bw_khz * 1000.0;
    double t_sym_ms = (pow(2.0, config.sf) / bw_hz) * 1000.0;
    double bit_rate_bps = (config.sf * (bw_hz / pow(2.0, config.sf)) * (4.0 / config.cr));
    double toa_ms = calculate_lora_toa(&config, payload_len);

    printf("[-] Cấu hình vô tuyến: SF=%d, BW=%.1f kHz, CR=4/%d\n", config.sf, config.bw_khz, config.cr);
    printf("[-] Chiều dài gói dữ liệu (Payload): %d bytes\n", payload_len);
    printf("---------------------------------------------------------------\n");
    printf("[+] Thời gian một Symbol (T_sym)    : %.3f ms\n", t_sym_ms);
    printf("[+] Tốc độ bit danh định (Bit Rate) : %.2f bps\n", bit_rate_bps);
    printf("[+] Tổng thời gian phát sóng (ToA)  : %.2f ms\n", toa_ms);
    printf("===============================================================\n");

    return 0;
}

