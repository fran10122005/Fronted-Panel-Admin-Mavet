import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Button from "./button/Button";

interface Props {
  url: string;
  filename?: string;
  variant?: "card" | "button";
}

export default function QRCodeGenerator({ url, filename = "qr-code", variant = "card" }: Props) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${filename}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  if (variant === "button") {
    return (
      <>
        <div className="absolute -left-[9999px] -top-[9999px]" ref={qrRef}>
          <QRCodeCanvas 
            value={url} 
            size={512}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
            includeMargin={true}
          />
        </div>
        <Button 
          variant="secondary"
          size="sm" 
          onClick={downloadQR}
          startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>}
        >
          Imprimir QR
        </Button>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/60">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 dark:border-gray-700" ref={qrRef}>
        <QRCodeCanvas 
          value={url} 
          size={180}
          bgColor={"#ffffff"}
          fgColor={"#000000"}
          level={"H"}
          includeMargin={false}
        />
      </div>
      <p className="text-[10px] text-gray-500 text-center font-medium max-w-[200px] break-all">
        {url}
      </p>
      <Button 
        variant="secondary"
        size="sm" 
        onClick={downloadQR}
        className="w-full justify-center"
        startIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
      >
        Descargar QR
      </Button>
    </div>
  );
}
