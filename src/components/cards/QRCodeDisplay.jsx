import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Button } from '@/components/ui/button';
import { Download, Share2, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

export default function QRCodeDisplay({ slug, qrSettings, size = 200, showActions = true, trackable = false }) {
  const { t, isRTL } = useLanguage();
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Use tracking URL for QR codes, direct URL for links
  const cardUrl = trackable 
    ? `https://rawajcard.com/trackQRScan?slug=${slug}`
    : `https://rawajcard.com/c/${slug}`;
  
  const displayUrl = `https://rawajcard.com/c/${slug}`;

  // Generate QR code with customization
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // QR code options
    const options = {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: size,
      color: {
        dark: qrSettings?.dot_color || '#000000',
        light: qrSettings?.background_color || '#FFFFFF'
      }
    };

    // Generate QR code
    QRCode.toCanvas(canvas, cardUrl, options, (error) => {
      if (error) {
        console.error('QR generation error:', error);
        return;
      }

      // Apply style effects
      const style = qrSettings?.style || 'square';
      if (style === 'rounded' || style === 'dots') {
        const imageData = ctx.getImageData(0, 0, size, size);
        const data = imageData.data;
        const moduleSize = size / 33; // QR has ~33 modules

        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        ctx.fillStyle = qrSettings?.background_color || '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = qrSettings?.dot_color || '#000000';

        // Redraw with style
        for (let y = 0; y < 33; y++) {
          for (let x = 0; x < 33; x++) {
            const pixelX = Math.floor(x * moduleSize + moduleSize / 2);
            const pixelY = Math.floor(y * moduleSize + moduleSize / 2);
            const index = (pixelY * size + pixelX) * 4;

            if (data[index] < 128) {
              const drawX = x * moduleSize;
              const drawY = y * moduleSize;

              if (style === 'dots') {
                ctx.beginPath();
                ctx.arc(
                  drawX + moduleSize / 2,
                  drawY + moduleSize / 2,
                  moduleSize / 2.5,
                  0,
                  2 * Math.PI
                );
                ctx.fill();
              } else if (style === 'rounded') {
                const radius = moduleSize / 4;
                ctx.beginPath();
                ctx.moveTo(drawX + radius, drawY);
                ctx.lineTo(drawX + moduleSize - radius, drawY);
                ctx.quadraticCurveTo(drawX + moduleSize, drawY, drawX + moduleSize, drawY + radius);
                ctx.lineTo(drawX + moduleSize, drawY + moduleSize - radius);
                ctx.quadraticCurveTo(drawX + moduleSize, drawY + moduleSize, drawX + moduleSize - radius, drawY + moduleSize);
                ctx.lineTo(drawX + radius, drawY + moduleSize);
                ctx.quadraticCurveTo(drawX, drawY + moduleSize, drawX, drawY + moduleSize - radius);
                ctx.lineTo(drawX, drawY + radius);
                ctx.quadraticCurveTo(drawX, drawY, drawX + radius, drawY);
                ctx.fill();
              }
            }
          }
        }
      }

      // Add logo if provided
      if (qrSettings?.logo_url) {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = size * 0.2;
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          // Draw white background for logo
          ctx.fillStyle = qrSettings?.background_color || '#FFFFFF';
          ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);

          // Draw logo
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

          // Store data URL for download
          setQrDataUrl(canvas.toDataURL('image/png'));
        };
        logo.src = qrSettings.logo_url;
      } else {
        setQrDataUrl(canvas.toDataURL('image/png'));
      }
    });
  }, [slug, qrSettings, size, cardUrl]);

  const handleDownload = async (format) => {
    if (format === 'svg') {
      // For SVG, use simple QR generation
      const svg = await QRCode.toString(cardUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 1,
        color: {
          dark: qrSettings?.dot_color || '#000000',
          light: qrSettings?.background_color || '#FFFFFF'
        }
      });
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rawajcard-${slug}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // PNG download from canvas
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `rawajcard-${slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'My Digital Card',
        text: isRTL ? 'تحقق من بطاقتي الرقمية!' : 'Check out my digital card!',
        url: displayUrl
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-2xl shadow-lg">
          <canvas
            ref={canvasRef}
            className="rounded-lg"
            style={{ width: size, height: size }}
          />
        </div>
      </div>

      {/* Card URL */}
      <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <p className="flex-1 text-sm text-slate-600 dark:text-slate-400 truncate font-mono">
          {displayUrl}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyLink}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('png')}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownload('svg')}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            {isRTL ? 'مشاركة' : 'Share'}
          </Button>
        </div>
      )}
    </div>
  );
}