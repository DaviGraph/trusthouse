import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export type CameraResult = {
  file: File;
  lat: number;
  lng: number;
  accuracyM: number;
  capturedAt: string;
};

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("This device does not support location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  });
}

export function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (result: CameraResult) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera is not available here. Open the site over https, or on localhost.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
        // Ask for location permission early so it is not a surprise at capture time.
        getPosition().catch(() => {});
      } catch {
        setError("Could not open the camera. Allow camera access and try again.");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function capture() {
    const video = videoRef.current;
    if (!video) return;
    setBusy(true);
    setError(null);
    try {
      const [pos, blob] = await Promise.all([
        getPosition(),
        new Promise<Blob>((resolve, reject) => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not read the camera."));
            return;
          }
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not save the photo."))), "image/jpeg", 0.85);
        }),
      ]);
      const file = new File([blob], `onsite-${Date.now()}.jpg`, { type: "image/jpeg" });
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onCapture({
        file,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracyM: pos.coords.accuracy,
        capturedAt: new Date().toISOString(),
      });
    } catch (err) {
      const denied = err instanceof GeolocationPositionError && err.code === 1;
      setError(
        denied
          ? "Location is blocked. Allow location access for this site, then try again."
          : err instanceof Error
            ? err.message
            : "Could not take the photo.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-4">
        <video ref={videoRef} playsInline muted className="aspect-[4/3] w-full rounded-md bg-black object-cover" />
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <div className="mt-4 flex gap-3">
          <Button type="button" onClick={capture} disabled={!ready || busy} className="flex-1">
            {busy ? "Getting location…" : "Take photo"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}