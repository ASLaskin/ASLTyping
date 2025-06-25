"use client"
import { useRef, useEffect, useState } from 'react';

const CameraFeed = () => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        //camera access
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user' 
          },
          audio: false
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setIsLoading(false);
      } catch (err) {
        if (!mounted) return;
        
        // console.error('Camera dont work');
        setError(err.message);
        setIsLoading(false);
      }
    };

    startCamera();

    //cleanup
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  //stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div >Camera Error</div>
        <div>{error}</div>
        <div>
          Make sure to allow camera access in your browser
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center">
      {isLoading && (
        <div>
          <div className="text-gray-600">Loading camera</div>
          <div className="text-gray-600">Accept Permissions to start </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-2xl rounded-lg shadow-lg"
        style={{ transform: 'scaleX(-1)' }} //Mirror horizontally
      />
      
      {!isLoading && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Camera feed active
        </div>
      )}
    </div>
  );
};

export default CameraFeed;