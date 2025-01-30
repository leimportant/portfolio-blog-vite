<template>
    <div class="magazine-view">
      <div class="spread">
        <canvas ref="leftPage" class="page"></canvas>
        <canvas ref="rightPage" class="page"></canvas>
      </div>
      <div class="controls">
        <button @click="prevPage" :disabled="currentPage <= 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage >= totalPages - 1">Next</button>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from "vue";
  import * as pdfjsLib from "pdfjs-dist";
  
  export default {
    name: "MagazineView",
    props: {
      src: {
        type: String,
        required: true, // PDF file path
      },
    },
    setup(props) {
      const leftPage = ref(null);
      const rightPage = ref(null);
      const pdfDoc = ref(null);
      const currentPage = ref(1); // Default to page 1
      const totalPages = ref(0);
  
      // Render a specific page
      const renderPage = async (canvasRef, pageNum) => {
        if (!canvasRef.value || !pdfDoc.value) {
          console.error("PDF Document or Canvas Ref is unavailable");
          return;
        }
  
        try {
          // Fetch the requested page from the PDF
          const page = await pdfDoc.value.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
  
          const canvas = canvasRef.value;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
  
          const context = canvas.getContext("2d");
          if (!context) {
            console.error("Failed to get canvas context");
            return;
          }
  
          console.log(`Rendering page ${pageNum}`); // Log the current page being rendered
  
          // Render the page content on the canvas
          await page.render({ canvasContext: context, viewport }).promise;
        } catch (error) {
          console.error(`Error rendering page ${pageNum}:`, error);
        }
      };
  
      // Render a spread (left and right pages)
      const renderSpread = async () => {
        if (currentPage.value <= totalPages.value) {
          await renderPage(leftPage, currentPage.value); // Render left page
        }
  
        if (currentPage.value + 1 <= totalPages.value) {
          await renderPage(rightPage, currentPage.value + 1); // Render right page (next page)
        } else {
          // Clear the right page canvas if there's no next page
          const ctx = rightPage.value.getContext("2d");
          ctx.clearRect(0, 0, rightPage.value.width, rightPage.value.height);
        }
      };
  
      // Go to the previous spread (2 pages back)
      const prevPage = () => {
        if (currentPage.value > 1) {
          currentPage.value -= 2; // Go to the previous spread (2 pages at a time)
          renderSpread(); // Re-render the pages
        }
      };
  
      // Go to the next spread (2 pages forward)
      const nextPage = () => {
        if (currentPage.value < totalPages.value - 1) {
          currentPage.value += 2; // Go to the next spread
          renderSpread(); // Re-render the pages
        }
      };
  
      // Load the PDF and render the first spread (default)
      onMounted(async () => {
        try {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  
          pdfDoc.value = await pdfjsLib.getDocument(props.src).promise;
          totalPages.value = pdfDoc.value.numPages;
  
          console.log("PDF loaded successfully");
  
          // Initial rendering of the first spread
          renderSpread();
        } catch (error) {
          console.error("Error loading PDF:", error);
        }
      });
  
      return { leftPage, rightPage, currentPage, totalPages, prevPage, nextPage };
    },
  };
  </script>
  
  <style scoped>
  .magazine-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .spread {
    display: flex;
    gap: 10px;
    background-color: #fff;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .page {
    display: block;
    width: 400px;
    height: auto;
  }
  .controls {
    display: flex;
    gap: 10px;
  }
  button {
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
  }
  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  </style>
  