/**
 * @file 03_iot_battery_simulator.c
 * @brief Mô phỏng và So sánh Tuổi thọ Pin giữa LoRaWAN và NB-IoT
 * @author Embedded-AIoT Lab PTIT
 */

#include <stdio.h>
#include <stdint.h>

typedef struct {
    const char *name;
    double sleep_current_ua;   // Dòng ngủ (uA)
    double tx_current_ma;      // Dòng phát (mA)
    double tx_time_sec;        // Thời gian phát (s)
    double rx_current_ma;      // Dòng nhận (mA)
    double rx_time_sec;        // Thời gian nhận (s)
} radio_profile_t;

void simulate_lifespan(const radio_profile_t *prof, double battery_mah, double interval_minutes) {
    double interval_sec = interval_minutes * 60.0;
    
    // 1. Điện lượng tiêu hao trong 1 chu kỳ (mA.s)
    double q_sleep = (prof->sleep_current_ua / 1000.0) * (interval_sec - prof->tx_time_sec - prof->rx_time_sec);
    double q_tx = prof->tx_current_ma * prof->tx_time_sec;
    double q_rx = prof->rx_current_ma * prof->rx_time_sec;
    double q_cycle_mas = q_sleep + q_tx + q_rx;

    // 2. Số chu kỳ trong 1 năm
    double cycles_per_year = (365.25 * 24.0 * 3600.0) / interval_sec;
    double mah_per_year = (q_cycle_mas * cycles_per_year) / 3600.0;

    // 3. Tuổi thọ pin (trừ 15% tự xả)
    double usable_battery = battery_mah * 0.85;
    double years = usable_battery / mah_per_year;

    printf("[-] Công nghệ: %s\n", prof->name);
    printf("    |- Dòng tiêu thụ chu kỳ     : %.2f mA.s / lần phát\n", q_cycle_mas);
    printf("    |- Điện năng hao tổn 1 năm  : %.2f mAh / năm\n", mah_per_year);
    printf("    |- Tuổi thọ pin dự tính     : %.2f nam\n", years);
}

int main(void) {
    printf("===============================================================\n");
    printf("   EMBEDDED-AIOT LAB: BỘ MÔ PHỎNG NĂNG LƯỢNG THIẾT BỊ IOT     \n");
    printf("===============================================================\n\n");

    double battery_capacity = 2600.0; // Cell pin 2600 mAh LiSOCl2
    double interval = 120.0;          // Cứ 120 phút phát 1 lần

    printf("[i] Cấu hình: Pin = %.0f mAh, Chu kỳ truyền = %.0f phút\n\n", battery_capacity, interval);

    radio_profile_t lorawan = {
        .name = "LoRaWAN Class A (SX1262)",
        .sleep_current_ua = 1.5,
        .tx_current_ma = 25.0,
        .tx_time_sec = 0.10,
        .rx_current_ma = 5.0,
        .rx_time_sec = 0.02
    };

    radio_profile_t nbiot = {
        .name = "NB-IoT PSM (Quectel BC660K)",
        .sleep_current_ua = 3.5,
        .tx_current_ma = 100.0,
        .tx_time_sec = 4.0,
        .rx_current_ma = 0.0,
        .rx_time_sec = 0.0
    };

    simulate_lifespan(&lorawan, battery_capacity, interval);
    printf("---------------------------------------------------------------\n");
    simulate_lifespan(&nbiot, battery_capacity, interval);

    printf("===============================================================\n");
    return 0;
}

