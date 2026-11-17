# LORA & LORAWAN RESEARCH SOURCE REGISTER & TECHNICAL PROVENANCE
## Sổ Tay Tra Cứu Tài Liệu Nguồn Chuẩn Kỹ Thuật (Authoritative Technical Register)

Bản lưu vết toàn bộ tài liệu quy chuẩn kỹ thuật (Specifications, Datasheets, Application Notes, RFC) phục vụ biên soạn chuỗi chuyên đề LoRa & LoRaWAN tại Embedded-AIoT Lab.

---

### Danh mục Nguồn Chính Quy (Primary Authoritative Sources)

#### 1. Semtech Corporation (Tổ chức sở hữu bằng sáng chế LoRa CSS)
- **Nguồn 1.1:** *SX1261/2 Long Range, Low Power, sub-GHz RF Transceiver Datasheet* (DS.SX1261-2.W.APP, Rev 2.1, December 2021).
  - *URL:* https://www.semtech.com/products/wireless-rf/lora-connect/sx1262
  - *Nội dung trích dẫn:* Kiến trúc CSS, dải băng thông 7.8 kHz – 500 kHz, Spreading Factor SF5 – SF12, độ nhạy -148 dBm, công suất phát +22 dBm, các trạng thái Sleep/Standby/FS/TX/RX, thời gian chuyển đổi xung BUSY và giao thức SPI.
- **Nguồn 1.2:** *Semtech Application Note AN1200.22: LoRa™ Modulation Basics* (Rev 2, May 2015).
  - *URL:* https://www.semtech.com/products/wireless-rf/lora-core/sx1276
  - *Nội dung trích dẫn:* Nguyên lý Chirp Spread Spectrum, phương trình biến thiên tần số tức thời $f(t) = f_0 + \mu t$, định nghĩa Chip Rate $R_c = BW$, Symbol Rate $R_s = \frac{BW}{2^{SF}}$, cơ chế chống nhiễu Doppler và khả năng giải mã dưới ngưỡng nhiễu âm ($SNR < 0 \text{ dB}$).
- **Nguồn 1.3:** *Semtech Application Note AN1200.13: LoRa™ Modem Designer’s Guide*.
  - *Nội dung trích dẫn:* Phương pháp tính toán Link Budget, công thức xác định độ nhạy máy thu $S = -174 + 10\log_{10}(BW) + NF + SNR_{req}$, Time on Air (ToA) của preamble và payload.

#### 2. LoRa Alliance® (Tổ chức chuẩn hóa giao thức mạng LoRaWAN)
- **Nguồn 2.1:** *LoRaWAN® 1.0.4 Specification Package (TS001-1.0.4)*, October 2020.
  - *URL:* https://lora-alliance.org/resource_hub/lorawan-104-specification-package/
  - *Nội dung trích dẫn:* Cấu trúc khung LoRaWAN MAC (MHDR, FHDR, FCtrl, FCnt, FOpts, FPort, FRMPayload, MIC), cơ chế bảo mật AES-128 CMAC, thuật toán Over-The-Air Activation (OTAA) và Activation By Personalization (ABP), hành vi cửa sổ nhận tin RX1/RX2 của Class A, Class B và Class C.
- **Nguồn 2.2:** *LoRaWAN® Regional Parameters RP002-1.0.4*, LoRa Alliance, 2022.
  - *URL:* https://lora-alliance.org/resource_hub/rp002-1-0-4-regional-parameters/
  - *Nội dung trích dẫn:* Phổ tần quy định tại Châu Âu (EU863-870), Bắc Mỹ (US902-928) và Châu Á - Thái Bình Dương (AS923-1/2/3/4 bao gồm Việt Nam - AS923-2 920-923 MHz), giới hạn EIRP, quy định Duty Cycle (< 1%) và giới hạn công suất phát.

#### 3. The Things Network & The Things Stack (TTS v3)
- **Nguồn 3.1:** *The Things Stack Open Source Architecture Documentation*, The Things Industries, 2024.
  - *URL:* https://www.thethingsindustries.com/docs/
  - *Nội dung trích dẫn:* Kiến trúc hạ tầng LoRaWAN hiện đại: Network Server (LNS), Gateway Server (GS), Application Server (AS), Join Server (JS), giao thức kết nối Gateway qua Semtech UDP Packet Forwarder và Basic Station (LNS Protocol qua WebSockets).

#### 4. ChirpStack Architecture Documentation
- **Nguồn 4.1:** *ChirpStack v4 Open-Source LoRaWAN Network Server Stack*, Orne Brocaar, 2024.
  - *URL:* https://www.chirpstack.io/
  - *Nội dung trích dẫn:* Quy trình điều phối frame uplink/downlink qua MQTT brokers, giải mã payload JavaScript Codecs (Cayenne LPP, Protobuf), cơ chế Frame Counter validation và ADR engine.

#### 5. Cơ quan Quản lý Tần số Vô tuyến Việt Nam (ARFM)
- **Nguồn 5.1:** *Thông tư 08/2021/TT-BTTTT của Bộ Thông tin và Truyền thông Việt Nam:* Quy định danh mục thiết bị vô tuyến điện cự ly ngắn được miễn giấy phép sử dụng tần số vô tuyến điện.
  - *Nội dung trích dẫn:* Dải băng tần 920 MHz – 923 MHz (thuộc nhóm kênh AS923-2), giới hạn công suất phát bức xạ đẳng hướng tương đương tối đa (EIRP) là 25 mW (14 dBm).

