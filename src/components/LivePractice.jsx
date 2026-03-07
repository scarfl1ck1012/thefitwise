import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, AlertCircle } from "lucide-react";

/**
 * LivePractice — AR "Smart Mirror" Prep Component
 *
 * Boilerplate for WebRTC camera feed + MediaPipe Face Mesh integration.
 * Currently shows the camera feed with placeholders for landmark detection.
 * Future: overlay facial landmarks, detect pose correctness, and glow green
 * when the correct exercise pose is held.
 */
export default function LivePractice({ exerciseName, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [poseDetected, setPoseDetected] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 480, height: 360 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);

      // --- MediaPipe Face Mesh Integration Point ---
      // To enable real-time facial landmark detection:
      //
      // 1. Install: npm install @mediapipe/face_mesh @mediapipe/camera_utils
      //
      // 2. Initialize Face Mesh:
      //    const faceMesh = new FaceMesh({ locateFile: (file) =>
      //      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      //    });
      //    faceMesh.setOptions({
      //      maxNumFaces: 1,
      //      refineLandmarks: true,
      //      minDetectionConfidence: 0.5,
      //      minTrackingConfidence: 0.5,
      //    });
      //
      // 3. On results, draw landmarks on the canvas overlay:
      //    faceMesh.onResults((results) => {
      //      const ctx = canvasRef.current.getContext("2d");
      //      // Draw landmarks, check if pose matches exerciseName
      //      // If pose correct: setPoseDetected(true)
      //    });
      //
      // 4. Feed frames from the video element:
      //    const camera = new Camera(videoRef.current, {
      //      onFrame: async () => {
      //        await faceMesh.send({ image: videoRef.current });
      //      },
      //      width: 480, height: 360,
      //    });
      //    camera.start();
      //
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions.");
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setPoseDetected(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && cameraActive) {
        stopCamera();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cameraActive, stopCamera]);

  return (
    <div className="mt-3 rounded-lg overflow-hidden bg-background/80 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50">
        <span className="text-xs font-medium text-foreground">
          Live Practice
        </span>
        <div className="flex items-center gap-2">
          {cameraActive && (
            <span
              className={`w-2 h-2 rounded-full ${poseDetected ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={cameraActive ? stopCamera : startCamera}
          >
            {cameraActive ? (
              <>
                <CameraOff className="h-3 w-3" /> Stop
              </>
            ) : (
              <>
                <Camera className="h-3 w-3" /> Start Camera
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative aspect-[4/3] bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover mirror"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
        />
        {/* Canvas overlay for future landmark rendering */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Pose detection border glow */}
        {poseDetected && (
          <div className="absolute inset-0 border-2 border-primary shadow-[inset_0_0_20px_hsl(var(--primary)/0.3)] rounded pointer-events-none" />
        )}

        {/* Placeholder when camera is off */}
        {!cameraActive && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Camera className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">
              Start camera to practice "{exerciseName}"
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-xs text-destructive text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Status bar */}
      {cameraActive && (
        <div className="px-3 py-2 bg-muted/30 text-center">
          <p className="text-[10px] text-muted-foreground">
            {poseDetected
              ? "Pose detected! Hold it..."
              : "Position your face in frame and perform the exercise"}
          </p>
        </div>
      )}
    </div>
  );
}
