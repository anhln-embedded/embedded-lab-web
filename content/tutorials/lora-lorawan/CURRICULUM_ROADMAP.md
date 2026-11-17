# LORA & LORAWAN CURRICULUM ROADMAP
## Từ Nền Tảng Vật Lý Vô Tuyến Đến Ứng Dụng Thực Chiến Chuẩn Công Nghiệp
**Embedded-AIoT Lab — Học viện Công nghệ Bưu chính Viễn thông (PTIT)**

---

### Tổng quan Khung chương trình (8 Chương — 40 Chuyên đề)

| Chương | Tiêu đề Chuyên mục | Số bài | Trạng thái kỹ thuật | Phần cứng mục tiêu |
| :--- | :--- | :---: | :---: | :--- |
| **Chương 01** | **Introduction to LoRa & LPWAN** | 4 | **Hoàn thành (Batch 1)** | RPi 4 / SX1262 HAT (Theory & Sim) |
| **Chương 02** | **LoRa Physical Layer & RF Fundamentals** | 6 | Sắp phát hành | SDR / Waveform Generator / RPi 4 |
| **Chương 03** | **Semtech LoRa Transceiver Architecture** | 5 | Lên kế hoạch | Semtech SX1262, SX1276, LR1110 |
| **Chương 04** | **LoRa Point-to-Point (P2P) Communication** | 5 | Lên kế hoạch | 2x SX1262 Nodes (RPi 4 + Linux SPI) |
| **Chương 05** | **LoRaWAN Protocol Architecture** | 6 | Lên kế hoạch | LoRaWAN End-Device Stack 1.0.4 |
| **Chương 06** | **LoRaWAN Security & Key Management** | 5 | Lên kế hoạch | AES-128, Crypto, Secure Provisioning |
| **Chương 07** | **LoRaWAN Gateway & Network Server** | 4 | Lên kế hoạch | SX1302/03 Concentrator + ChirpStack v4 |
| **Chương 08** | **Advanced Engineering & Industrial IoT** | 5 | Lên kế hoạch | Low-Power Battery, Field Testing |

---

### Danh mục Chi tiết 40 Bài giảng

#### Chapter 01 — Introduction to LoRa & LPWAN
- **Bài 01:** What Is LoRa? Principles, Features and Real-World Applications (`01-what-is-lora-principles-features-applications.md`)
- **Bài 02:** LoRa vs LoRaWAN: PHY, MAC and Network Architecture (`02-lora-vs-lorawan-phy-mac-network.md`)
- **Bài 03:** LoRa vs Wi-Fi, BLE, Zigbee, NB-IoT and LTE-M (`03-lora-vs-wifi-ble-zigbee-nbiot-ltem.md`)
- **Bài 04:** End-to-End LoRa/LoRaWAN System Architecture (`04-end-to-end-lora-lorawan-system-architecture.md`)

#### Chapter 02 — LoRa Physical Layer & RF Fundamentals
- **Bài 05:** RF Fundamentals: Frequency, Wavelength, dBm, dBi and Propagation Models
- **Bài 06:** Chirp Spread Spectrum (CSS) Modulation Explained
- **Bài 07:** Spreading Factor: SF7–SF12, Orthogonality and Data Rates
- **Bài 08:** Bandwidth, Coding Rate, Receiver Sensitivity and Link Budget
- **Bài 09:** RSSI, SNR, Packet Error Rate and Time on Air (ToA) Calculations
- **Bài 10:** Adaptive Data Rate (ADR) and Dynamic RF Optimization

#### Chapter 03 — Semtech LoRa Transceiver Architecture
- **Bài 11:** Semtech Radio Family Comparison: SX127x vs SX126x vs LR11xx
- **Bài 12:** Deep Inside SX1262: RF Front-End, DC-DC/LDO, XTAL/TCXO and SPI Interface
- **Bài 13:** SX1262 Operational State Machine: Sleep, Standby, TX, RX and CAD
- **Bài 14:** SPI Protocol, BUSY Line Synchronization, DIOs and IRQ Interrupt Handling
- **Bài 15:** Frequency Planning, Filtering, Matching Networks and Power Output Control

#### Chapter 04 — LoRa Point-to-Point (P2P) Communication
- **Bài 16:** Designing Point-to-Point (P2P) Wireless Communication with LoRa
- **Bài 17:** Custom Physical Packet Structures, Preamble Length and Hardware CRC
- **Bài 18:** Finite State Machines (FSM), Retransmissions and Acknowledgments (ACK)
- **Bài 19:** Empirical Measurement: RSSI, SNR, Doppler Shift and Outdoor Range Testing
- **Bài 20:** Building an Industrial P2P Sensor Telemetry Node in Embedded C / Linux

#### Chapter 05 — LoRaWAN Protocol Architecture
- **Bài 21:** Topology Overview: End-Device, Gateway, Network Server (LNS), Application Server (AS)
- **Bài 22:** LoRaWAN MAC Frame Format: MHDR, FHDR, FPort, FRMPayload and MIC
- **Bài 23:** Device Classes: Class A (Battery-Optimized), Class B (Beaconing), Class C (Continuous Listening)
- **Bài 24:** Activation Procedures: Over-The-Air Activation (OTAA) vs Activation By Personalization (ABP)
- **Bài 25:** Uplink, Downlink, Confirmed vs Unconfirmed Frames and Acknowledgements
- **Bài 26:** MAC Commands (LinkCheck, LinkADR, DutyCycle) and Regional Channel Plans (AS923, EU868, US915)

#### Chapter 06 — LoRaWAN Security
- **Bài 27:** End-to-End Cryptographic Architecture: Dual 128-bit AES Keys
- **Bài 28:** Root Keys (AppKey, NwkKey) and Session Key Derivation (AppSKey, NwkSKey / FNwkSIntKey)
- **Bài 29:** Message Integrity Code (MIC), Frame Counters (FCntUp/FCntDown) and Replay Attack Defense
- **Bài 30:** Secure Device Provisioning, Hardware Security Modules (ATECC608A) and Key Injection
- **Bài 31:** Debugging OTAA Join Accept Failures, MIC Mismatch and Counter Desynchronization

#### Chapter 07 — LoRaWAN Gateway & Network Server
- **Bài 32:** End-Device Transceiver (SX1262) vs Gateway Multichannel Concentrator (SX1302 / SX1303)
- **Bài 33:** Packet Forwarder Architecture: Semtech UDP vs Semtech Basics Station (LNS Protocol)
- **Bài 34:** Deploying ChirpStack v4 on Linux / Docker with PostgreSQL and Redis
- **Bài 35:** Device Provisioning, Payload Codecs (ChirpStack JavaScript Codec), MQTT Uplink and Downlink

#### Chapter 08 — Advanced Engineering & Applications
- **Bài 36:** Ultra Low-Power System Design: Power Profiling, Quiescent Current, Capacitor Leakage
- **Bài 37:** Network Scalability, Aloha Channel Collisions, Duty Cycle Restrictions (ETSI 1%) and Regulations
- **Bài 38:** Hardcore Hardware Troubleshooting: Logic Analyzer SPI Traces, Spectrum Analysis, Impedance Mismatch
- **Bài 39:** Real-World Deployments: Smart Agriculture, Environmental Telemetry, Smart Grid
- **Bài 40:** Capstone Project: End-to-End Industrial LoRaWAN Node-to-Dashboard Validation

