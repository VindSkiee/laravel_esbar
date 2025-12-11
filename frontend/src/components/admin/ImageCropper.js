import React, { useState, useRef } from "react";
import "./ImageCropper.css";

const ImageCropper = ({ imageUrl, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);

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
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Crop preview"
            crossOrigin="anonymous"
            style={{
              transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onError={(e) => {
              console.error("Image failed to load:", e);
            }}
          />
          <div className="crop-circle"></div>
        </div>

        <div className="crop-controls">
          <label>
            Zoom: {zoom.toFixed(1)}x
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="crop-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Batal
          </button>
          <button className="crop-btn" onClick={handleCrop}>
            Potong & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
