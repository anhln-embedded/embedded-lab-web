/**
 * @file 04_mock_packet_forwarder.c
 * @brief Chương trình Giả lập Chuyển tiếp Gói tin Gateway (Semtech UDP Protocol)
 * Hỗ trợ biên dịch chéo trên cả Linux và Windows (Winsock2)
 * @author Embedded-AIoT Lab PTIT
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
    typedef int socklen_t;
    #define close_socket(s) closesocket(s)
#else
    #include <unistd.h>
    #include <arpa/inet.h>
    #include <sys/socket.h>
    #define close_socket(s) close(s)
#endif

#define SERVER_IP "127.0.0.1"
#define SERVER_PORT 1700
#define PROTOCOL_VERSION 2
#define PKT_PUSH_DATA 0

// Hàm mã hóa Base64 đơn giản cho Payload
static const char b64_table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
void base64_encode(const unsigned char *src, size_t len, char *out) {
    size_t i, j = 0;
    for (i = 0; i < len; i += 3) {
        uint32_t val = (src[i] << 16) + (((i + 1) < len ? src[i + 1] : 0) << 8) + (((i + 2) < len ? src[i + 2] : 0));
        out[j++] = b64_table[(val >> 18) & 0x3F];
        out[j++] = b64_table[(val >> 12) & 0x3F];
        out[j++] = (i + 1 < len) ? b64_table[(val >> 6) & 0x3F] : '=';
        out[j++] = (i + 2 < len) ? b64_table[val & 0x3F] : '=';
    }
    out[j] = '\0';
}

int main(void) {
    printf("===============================================================\n");
    printf("  EMBEDDED-AIOT LAB: GATEWAY PACKET FORWARDER SIMULATOR       \n");
    printf("===============================================================\n\n");

#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        printf("[!] WSAStartup thất bại.\n");
        return 1;
    }
#endif

    int sockfd;
    struct sockaddr_in servaddr;

    if ((sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
        perror("Tạo Socket thất bại");
        return 1;
    }

    memset(&servaddr, 0, sizeof(servaddr));
    servaddr.sin_family = AF_INET;
    servaddr.sin_port = htons(SERVER_PORT);
    servaddr.sin_addr.s_addr = inet_addr(SERVER_IP);

    // Gói tin vô tuyến mẫu thu được tại Anten (16 bytes)
    unsigned char lora_phy_packet[] = {
        0x40, 0x01, 0x02, 0x03, 0x04, 0x00, 0x01, 0x00,
        0x01, 0x09, 0xC4, 0x1A, 0x2B, 0xEF, 0xBE, 0xAD, 0xDE
    };
    char b64_payload[64];
    base64_encode(lora_phy_packet, sizeof(lora_phy_packet), b64_payload);

    // Xây dựng Header 12 bytes theo chuẩn Semtech UDP
    unsigned char buffer[1024];
    buffer[0] = PROTOCOL_VERSION;
    buffer[1] = 0xAA; // Token ngẫu nhiên (Random Token High)
    buffer[2] = 0x55; // Token ngẫu nhiên (Random Token Low)
    buffer[3] = PKT_PUSH_DATA;

    // 8 bytes Gateway EUI duy nhất (ví dụ: AA:55:5A:00:00:00:00:01)
    unsigned char gw_eui[8] = { 0xAA, 0x55, 0x5A, 0x00, 0x00, 0x00, 0x00, 0x01 };
    memcpy(&buffer[4], gw_eui, 8);

    // Xây dựng chuỗi JSON mang siêu dữ liệu đo đạc vô tuyến (Metadata)
    char json_payload[512];
    snprintf(json_payload, sizeof(json_payload),
             "{\"rxpk\":[{"
             "\"tmst\":%u,"
             "\"freq\":921.4,"
             "\"chan\":0,"
             "\"rfch\":0,"
             "\"stat\":1,"
             "\"modu\":\"LORA\","
             "\"datr\":\"SF10BW125\","
             "\"codr\":\"4/5\","
             "\"rssi\":-85,"
             "\"lsnr\":9.5,"
             "\"size\":%zu,"
             "\"data\":\"%s\""
             "}]}",
             (unsigned int)time(NULL), sizeof(lora_phy_packet), b64_payload);

    strcpy((char*)&buffer[12], json_payload);
    size_t total_packet_len = 12 + strlen(json_payload);

    printf("[+] Đang đẩy gói tin Gateway -> Server (%s:%d)...\n", SERVER_IP, SERVER_PORT);
    printf("[+] JSON Metadata:\n%s\n\n", json_payload);

    sendto(sockfd, (const char*)buffer, (int)total_packet_len, 0, (const struct sockaddr *)&servaddr, sizeof(servaddr));
    printf("[✔] Đã gửi thành công %zu bytes qua socket UDP!\n", total_packet_len);

    close_socket(sockfd);

#ifdef _WIN32
    WSACleanup();
#endif

    return 0;
}

