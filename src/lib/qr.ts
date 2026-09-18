import QRCode from "qrcode";

export function generateQrPng(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
  });
}
