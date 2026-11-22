import { QRCodeSVG } from "qrcode.react";

export function QrCode({ label = "QR entry code", value = "https://voyage.events/p/MW-2841", color = "#171715" }: { label?: string; value?: string; color?: string }) {
  return <QRCodeSVG id="guest-qr" className="qr-code" value={value} size={94} level="H" marginSize={2} fgColor={color} bgColor="#ffffff" title={label} />;
}
