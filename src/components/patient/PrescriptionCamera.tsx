import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon, X } from 'lucide-react';

interface PrescriptionCameraProps {
  onCapture: (imageDataUrl: string, sampleName?: string) => void;
  onCancel: () => void;
}

export const PrescriptionCamera: React.FC<PrescriptionCameraProps> = ({ onCapture, onCancel }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        setStream(mediaStream);
        setCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        setCameraError('Camera hardware API not available in this browser context. You can upload an image or select a sample prescription.');
      }
    } catch (err: any) {
      setCameraError('Unable to access camera. Please allow camera permissions or upload an image.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        onCapture(dataUrl, 'Captured Prescription Photo');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        stopCamera();
        onCapture(result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSample = (sampleType: 'nashik_opd' | 'chronic_cardio') => {
    stopCamera();
    if (sampleType === 'nashik_opd') {
      onCapture(
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f8fafc"/><text x="20" y="40" font-family="sans-serif" font-size="16" fill="%230f172a">Dr. R. Deshpande, MBBS (Nashik)</text><text x="20" y="80" font-family="sans-serif" font-size="14" fill="%23334155">1. Tab. Augmentin 625mg 1 tab BD x 5 days</text><text x="20" y="110" font-family="sans-serif" font-size="14" fill="%23334155">2. Cap. Pan D 1 cap OD ac</text><text x="20" y="140" font-family="sans-serif" font-size="14" fill="%23334155">3. Tab. Paracetamol 650mg SOS</text></svg>',
        'Nashik General OPD Prescription (Sample)'
      );
    } else {
      onCapture(
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f8fafc"/><text x="20" y="40" font-family="sans-serif" font-size="16" fill="%230f172a">Apollo Clinic Nashik - Cardiology OPD</text><text x="20" y="80" font-family="sans-serif" font-size="14" fill="%23334155">1. Tab. Telma 40mg 1 tab OD morning</text><text x="20" y="110" font-family="sans-serif" font-size="14" fill="%23334155">2. Tab. Calpol 650mg PRN</text></svg>',
        'Cardiology Maintenance List (Sample)'
      );
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto relative flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-xs border-b border-slate-800 z-10">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-teal-400" />
          <span className="font-semibold text-sm">Scan Prescription / Medicine List</span>
        </div>
        <button
          onClick={() => {
            stopCamera();
            onCancel();
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder area */}
      <div className="relative aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
        {cameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Alignment Guideline Box */}
            <div className="absolute inset-6 border-2 border-dashed border-teal-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-xs text-teal-300 font-mono">
                <span>[TOP RX EDGE]</span>
                <span>DOCTOR HEADER</span>
              </div>
              <p className="text-center text-xs text-white/80 bg-black/50 py-1 px-2 rounded backdrop-blur-xs">
                Position prescription clearly inside the frame
              </p>
              <div className="flex justify-between text-xs text-teal-300 font-mono">
                <span>MEDICINE LIST</span>
                <span>[BOTTOM RX EDGE]</span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            {cameraError ? (
              <p className="text-xs text-amber-300 max-w-xs">{cameraError}</p>
            ) : (
              <p className="text-xs text-slate-400">Starting camera viewfinder...</p>
            )}
            <button
              onClick={startCamera}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Camera</span>
            </button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls & Quick Samples */}
      <div className="p-4 bg-slate-950 space-y-4">
        <div className="flex items-center justify-center space-x-4">
          {/* File Upload Alternative */}
          <label className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors border border-slate-700">
            <Upload className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* Shutter Button */}
          <button
            onClick={capturePhoto}
            disabled={!cameraActive}
            className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
              cameraActive
                ? 'border-white bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-500/30 active:scale-95'
                : 'border-slate-700 bg-slate-800 cursor-not-allowed opacity-50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/90" />
          </button>

          {/* Gallery / Presets indicator */}
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        {/* Quick Sample Prescriptions */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Or test with sample Nashik prescriptions:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => selectSample('nashik_opd')}
              className="text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
            >
              <div className="font-semibold text-teal-300">OPD Rx Sample</div>
              <div className="text-[11px] text-slate-400 truncate">Augmentin + Pan-D</div>
            </button>
            <button
              onClick={() => selectSample('chronic_cardio')}
              className="text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors"
            >
              <div className="font-semibold text-teal-300">Cardio Rx Sample</div>
              <div className="text-[11px] text-slate-400 truncate">Telma 40 + Calpol</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionCamera;
