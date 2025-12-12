import React, { useState, useRef, useEffect } from "react";
import "./ImageCropper.css";

const ImageCropper = ({ imageUrl, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);

  // Handle image load
  const handleImageLoad = () => {
    if (imgRef.current) {
      const img = imgRef.current;
      setImageDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setImageLoaded(true);
    }
  };

  // Reset to initial position
  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.2, Math.min(3, prev + delta)));
  };

  // Touch support
  const [touchStart, setTouchStart] = useState(null);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setTouchStart({
        x: e.touches[0].clientX - crop.x,
        y: e.touches[0].clientY - crop.y,
      });
    } else if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging && touchStart) {
      setCrop({
        x: e.touches[0].clientX - touchStart.x,
        y: e.touches[0].clientY - touchStart.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistance) {
      const newDistance = getTouchDistance(e.touches);
      const delta = (newDistance - lastTouchDistance) * 0.01;
      setZoom((prev) => Math.max(0.2, Math.min(3, prev + delta)));
      setLastTouchDistance(newDistance);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTouchStart(null);
    setLastTouchDistance(null);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setCrop({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    const container = containerRef.current;

    if (!img || !container) return;

    // Wait for image to load completely
    if (!img.complete || img.naturalWidth === 0) {
      alert("Gambar belum selesai dimuat. Tunggu sebentar dan coba lagi.");
      return;
    }

    const cropSize = 300; // Size of the circular crop
    canvas.width = cropSize;
    canvas.height = cropSize;

    // Calculate the actual crop area
    const rect = container.getBoundingClientRect();
    const scaleX = img.naturalWidth / (img.width * zoom);
    const scaleY = img.naturalHeight / (img.height * zoom);

    const sourceX = (rect.width / 2 - crop.x) * scaleX - cropSize / 2;
    const sourceY = (rect.height / 2 - crop.y) * scaleY - cropSize / 2;

    // Create circular clip
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    try {
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        cropSize * scaleX,
        cropSize * scaleY,
        0,
        0,
        cropSize,
        cropSize
      );

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], "cropped-image.jpg", {
              type: "image/jpeg",
            });
            onCropComplete(croppedFile, canvas.toDataURL());
          }
        },
        "image/jpeg",
        0.95
      );
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Gagal crop gambar. Pastikan gambar sudah dimuat dengan benar.");
    }
  };

  return (
    <div className="image-cropper-modal">
      <div className="cropper-container">
        <h3>Crop Gambar Menjadi Bulat</h3>

        <div
          className="crop-area"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop preview"
            onLoad={handleImageLoad}
            style={{
              transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
              cursor: isDragging ? "grabbing" : "grab",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
              maxWidth: imageLoaded ? "none" : "100%",
              maxHeight: imageLoaded ? "none" : "100%",
              width: imageLoaded ? "auto" : "100%",
              height: imageLoaded ? "auto" : "100%",
              opacity: imageLoaded ? 1 : 0,
            }}
            onError={(e) => {
              console.error("Image failed to load:", e);
            }}
          />
          {!imageLoaded && (
            <div className="image-loading">
              <div className="spinner"></div>
              <p>Memuat gambar...</p>
            </div>
          )}
          <div className="crop-circle"></div>
          {showGrid && (
            <>
              <div className="grid-line grid-h" style={{ top: "33.33%" }}></div>
              <div className="grid-line grid-h" style={{ top: "66.66%" }}></div>
              <div className="grid-line grid-v" style={{ left: "33.33%" }}></div>
              <div className="grid-line grid-v" style={{ left: "66.66%" }}></div>
            </>
          )}
        </div>

        <div className="crop-controls">
          <div className="control-row">
            <label>
              <span className="control-label">🔍 Zoom: {zoom.toFixed(1)}x</span>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="zoom-slider"
              />
            </label>
          </div>
          <div className="control-row control-buttons">
            <button className="control-btn" onClick={handleReset} title="Reset posisi & zoom">
              🔄 Reset
            </button>
            <button 
              className={`control-btn ${showGrid ? 'active' : ''}`}
              onClick={() => setShowGrid(!showGrid)}
              title="Toggle grid helper"
            >
              📐 Grid
            </button>
          </div>
          <div className="crop-tips">
            💡 <strong>Tips:</strong> Drag gambar untuk posisi • Scroll/pinch untuk zoom
          </div>
        </div>

        <div className="crop-actions">
          <button className="cancel-btn" onClick={onCancel}>
            ✖ Batal
          </button>
          <button className="crop-btn" onClick={handleCrop}>
            ✓ Potong & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
