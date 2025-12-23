import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, QrCode, Share2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  referralLink: string;
  affiliateName?: string;
}

const QRCodeGenerator = ({ referralLink, affiliateName = "Afiliado" }: QRCodeGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const downloadQRCode = () => {
    const svg = document.getElementById("affiliate-qrcode");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      
      if (ctx) {
        // White background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 0, 0, 300, 300);
      }

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qrcode-${affiliateName.toLowerCase().replace(/\s+/g, "-")}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "QR Code baixado!",
        description: "O arquivo foi salvo no seu dispositivo.",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Meu link de indicação",
          text: `Faça sua cotação de seguro através do meu link: ${referralLink}`,
          url: referralLink,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "Compartilhe com seus contatos.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Ver QR Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Seu QR Code
          </DialogTitle>
          <DialogDescription>
            Mostre este código para seus clientes escanearem e acessarem seu link de indicação.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="bg-white p-4 rounded-2xl shadow-soft border border-border">
            <QRCodeSVG
              id="affiliate-qrcode"
              value={referralLink}
              size={200}
              level="H"
              includeMargin={true}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
            />
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 text-center max-w-[200px] break-all">
            {referralLink}
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={shareQRCode}
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
          <Button 
            variant="hero" 
            className="flex-1 gap-2"
            onClick={downloadQRCode}
          >
            <Download className="w-4 h-4" />
            Baixar PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;