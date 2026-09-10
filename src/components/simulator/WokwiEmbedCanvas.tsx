"use client";

import React, { useEffect, useRef, useState } from "react";
import { WokwiClient } from "@/lib/wokwi/wokwi-client";
import { MessagePortTransport } from "@/lib/wokwi/message-port-transport";
import { DiagramSchema } from "@/lib/emulator/diagram-parser";
import { Loader2 } from "lucide-react";

interface WokwiEmbedCanvasProps {
  diagram: DiagramSchema;
  onClientReady?: (client: WokwiClient) => void;
  onSerialData?: (text: string) => void;
  className?: string;
}

export const WokwiEmbedCanvas: React.FC<WokwiEmbedCanvasProps> = ({
  diagram,
  onClientReady,
  onSerialData,
  className = "",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const clientRef = useRef<WokwiClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Lắng nghe handshake MessagePort từ iframe Wokwi
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Chỉ nhận message có chứa port
      if (!event.data || !event.data.port) return;

      const port = event.data.port as MessagePort;
      const transport = new MessagePortTransport(port);
      const client = new WokwiClient(transport);
      clientRef.current = client;

      client.addEventListener("wokwi:connected", async () => {
        setIsConnected(true);
        setIsInitializing(false);

        try {
          // Bắt đầu lắng nghe UART Serial Monitor
          await client.serialMonitorListen();

          // Upload sơ đồ mạch ban đầu
          const diagramText = JSON.stringify(diagram, null, 2);
          await client.fileUpload("diagram.json", diagramText);

          if (onClientReady) {
            onClientReady(client);
          }
        } catch (err) {
          console.error("Lỗi khởi tạo Wokwi Client:", err);
        }
      });

      // Lắng nghe luồng dữ liệu UART gửi về
      client.addEventListener("serial-monitor:data", (e: any) => {
        if (e.detail && e.detail.bytes) {
          const rawBytes = new Uint8Array(e.detail.bytes);
          const decoded = new TextDecoder().decode(rawBytes);
          if (onSerialData) {
            onSerialData(decoded);
          }
        }
      });
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (clientRef.current) {
        clientRef.current.transport.close();
      }
    };
  }, []);

  // Cập nhật lại diagram.json mỗi khi sơ đồ mạch thay đổi
  useEffect(() => {
    if (clientRef.current && isConnected) {
      const diagramText = JSON.stringify(diagram, null, 2);
      clientRef.current
        .fileUpload("diagram.json", diagramText)
        .catch((err) => console.warn("Không thể cập nhật diagram.json lên Wokwi:", err));
    }
  }, [diagram, isConnected]);

  return (
    <div
      className={`relative w-full h-full min-h-[350px] bg-white dark:bg-[#0b1324] rounded-2xl border border-border overflow-hidden select-none shadow-sm transition-colors duration-200 ${className}`}
    >
      {/* Hiệu ứng loading khi đang tải iframe */}
      {isInitializing && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-bg-panel/80 backdrop-blur-sm gap-3">
          <Loader2 className="w-7 h-7 text-accent animate-spin" />
          <p className="text-xs text-text-secondary font-medium">
            Đang khởi động mạch mô phỏng...
          </p>
        </div>
      )}

      {/* Iframe nhúng Wokwi Embed Kernel - Đẩy thanh bar và nút thừa ra ngoài khung nhìn */}
      <div className="w-full h-full overflow-hidden relative">
        <iframe
          ref={iframeRef}
          src="https://wokwi.com/experimental/embed?client_id=wokwi_client_ptit_lab"
          className="w-full border-0 absolute left-0"
          style={{
            top: "-118px",
            height: "calc(100% + 118px)",
          }}
          title="Wokwi Embedded Simulator"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        />
      </div>
    </div>
  );
};
