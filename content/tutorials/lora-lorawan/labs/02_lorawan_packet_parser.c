/**
 * @file 02_lorawan_packet_parser.c
 * @brief Bộ phân tích khung bản tin LoRaWAN MAC v1.0.4
 * @author Embedded-AIoT Lab PTIT
 */

#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>
#include <string.h>

typedef enum {
    LORAWAN_MTYPE_JOIN_REQUEST        = 0,
    LORAWAN_MTYPE_JOIN_ACCEPT         = 1,
    LORAWAN_MTYPE_UNCONFIRMED_DATA_UP = 2,
    LORAWAN_MTYPE_UNCONFIRMED_DATA_DN = 3,
    LORAWAN_MTYPE_CONFIRMED_DATA_UP   = 4,
    LORAWAN_MTYPE_CONFIRMED_DATA_DN   = 5,
    LORAWAN_MTYPE_REJOIN_REQUEST      = 6,
    LORAWAN_MTYPE_PROPRIETARY         = 7
} lorawan_mtype_t;

const char* mtype_to_string(lorawan_mtype_t mtype) {
    switch (mtype) {
        case LORAWAN_MTYPE_JOIN_REQUEST:        return "Join-Request";
        case LORAWAN_MTYPE_JOIN_ACCEPT:         return "Join-Accept";
        case LORAWAN_MTYPE_UNCONFIRMED_DATA_UP: return "Unconfirmed Data Up";
        case LORAWAN_MTYPE_UNCONFIRMED_DATA_DN: return "Unconfirmed Data Down";
        case LORAWAN_MTYPE_CONFIRMED_DATA_UP:   return "Confirmed Data Up";
        case LORAWAN_MTYPE_CONFIRMED_DATA_DN:   return "Confirmed Data Down";
        default:                                return "Unknown / Reserved";
    }
}

void parse_lorawan_packet(const uint8_t *buf, size_t len) {
    printf("===============================================================\n");
    printf("       EMBEDDED-AIOT LAB: LORAWAN PACKET DISSECTOR            \n");
    printf("===============================================================\n");

    if (len < 12) {
        printf("[!] LỖI: Chiều dài gói tin (%zu bytes) quá ngắn để là khung LoRaWAN hợp lệ!\n", len);
        return;
    }

    // 1. Phân tích MHDR (Byte 0)
    uint8_t mhdr = buf[0];
    lorawan_mtype_t mtype = (lorawan_mtype_t)((mhdr >> 5) & 0x07);
    uint8_t major = mhdr & 0x03;

    printf("[+] Tầng MHDR (0x%02X):\n", mhdr);
    printf("    |- Kiểu bản tin (MType) : %s (%d)\n", mtype_to_string(mtype), mtype);
    printf("    |- Phiên bản (Major)    : LoRaWAN R%d\n", major + 1);

    // Kiểm tra nếu là gói tin dữ liệu chuẩn (Data Up/Down)
    if (mtype >= LORAWAN_MTYPE_UNCONFIRMED_DATA_UP && mtype <= LORAWAN_MTYPE_CONFIRMED_DATA_DN) {
        // 2. Phân tích DevAddr (Bytes 1 - 4) theo Little Endian
        uint32_t dev_addr = (uint32_t)buf[1] |
                            ((uint32_t)buf[2] << 8) |
                            ((uint32_t)buf[3] << 16) |
                            ((uint32_t)buf[4] << 24);

        // 3. Phân tích FCtrl (Byte 5)
        uint8_t fctrl = buf[5];
        bool adr = (fctrl & 0x80) != 0;
        bool ack = (fctrl & 0x20) != 0;
        uint8_t fopts_len = fctrl & 0x0F;

        // 4. Phân tích FCnt (Bytes 6 - 7) theo Little Endian
        uint16_t fcnt = (uint16_t)buf[6] | ((uint16_t)buf[7] << 8);

        printf("[+] Tầng FHDR:\n");
        printf("    |- Địa chỉ DevAddr      : 0x%08X\n", dev_addr);
        printf("    |- Cờ Điều khiển (FCtrl): ADR=%d, ACK=%d, FOptsLen=%d\n", adr, ack, fopts_len);
        printf("    |- Số thứ tự khung (FCnt): %u (0x%04X)\n", fcnt, fcnt);

        size_t offset = 8 + fopts_len;
        if (offset + 4 <= len) {
            uint8_t fport = buf[offset++];
            size_t payload_len = len - offset - 4; // Loại trừ 4 bytes MIC ở cuối

            printf("[+] Tầng Payload:\n");
            printf("    |- Cổng ứng dụng (FPort): %d\n", fport);
            printf("    |- Chiều dài Payload mã hóa: %zu bytes\n", payload_len);
            printf("    |- Dữ liệu mã hóa (Hex) : ");
            for (size_t i = 0; i < payload_len; i++) {
                printf("%02X ", buf[offset + i]);
            }
            printf("\n");

            // 4 bytes MIC cuối
            uint32_t mic = (uint32_t)buf[len - 4] |
                           ((uint32_t)buf[len - 3] << 8) |
                           ((uint32_t)buf[len - 2] << 16) |
                           ((uint32_t)buf[len - 1] << 24);
            printf("[+] Tính toàn vẹn bản tin (MIC): 0x%08X\n", mic);
        }
    }
    printf("===============================================================\n\n");
}

int main(void) {
    // Gói tin mẫu trích xuất từ sóng thực tế
    uint8_t sample_packet[] = {
        0x40, 0x01, 0x02, 0x03, 0x04, 0x00, 0x2A, 0x00, 
        0x01, 0x5A, 0x7B, 0x3C, 0xD1, 0x88, 0x4F, 0x21
    };

    parse_lorawan_packet(sample_packet, sizeof(sample_packet));
    return 0;
}

