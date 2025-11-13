// for square image cropping

export default function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size to cropped area
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // ✅ No circular clip — just draw square crop
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Export as JPEG blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          resolve({ file: blob });
        },
        "image/jpeg",
        1 // quality (1 = best)
      );
    };
    image.onerror = reject;
  });
}






// for round image cropping.js

// export default function getCroppedImg(imageSrc, pixelCrop) {
//   return new Promise((resolve, reject) => {
//     const image = new Image();
//     image.src = imageSrc;
//     image.onload = () => {
//       const canvas = document.createElement("canvas");
//       const ctx = canvas.getContext("2d");

//       const diameter = Math.min(pixelCrop.width, pixelCrop.height);
//       canvas.width = diameter;
//       canvas.height = diameter;

//       ctx.beginPath();
//       ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, 2 * Math.PI);
//       ctx.closePath();
//       ctx.clip();

//       ctx.drawImage(
//         image,
//         pixelCrop.x,
//         pixelCrop.y,
//         pixelCrop.width,
//         pixelCrop.height,
//         0,
//         0,
//         diameter,
//         diameter
//       );

//       canvas.toBlob((blob) => {
//         if (!blob) {
//           reject(new Error("Canvas is empty"));
//           return;
//         }
//         resolve({ file: blob });
//       }, "image/jpeg");
//     };
//     image.onerror = reject;
//   });
// }
