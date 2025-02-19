<template>
  <div class="magazine-viewer">
    <header class="header">
      <h1>PORTFOLIO</h1>
      <nav class="menu">
        <a :href="src" download>Direct Download</a>
      </nav>
    </header>
    <div class="spread">
      <canvas ref="leftCanvas" class="page"></canvas>
      <canvas ref="rightCanvas" class="page"></canvas>
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
  name: "PdfViewer",
  props: {
    src: {
      type: String,
      required: true, // The PDF file URL or path
    },
  },
  setup(props) {
    const leftCanvas = ref(null);
    const rightCanvas = ref(null);
    const currentPage = ref(1); // Default to page 1
    const totalPages = ref(0);

    // Smooth animation duration in milliseconds
    const animationDuration = 500;

    // Render a specific page
    const renderPage = async (canvasRef, pageNum) => {
      if (!canvasRef.value) return;

      const canvas = canvasRef.value;
      const ctx = canvas.getContext("2d");

      try {
        const pdfDoc = await pdfjsLib.getDocument(props.src).promise;
        const page = await pdfDoc.getPage(pageNum); // Load the specific page

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error rendering PDF page:", error);
      }
    };

    // Smoothly fade out old pages, then fade in new pages
    const smoothTransition = async (callback) => {
      const spread = document.querySelector(".spread");
      spread.style.opacity = 0; // Fade out
      await new Promise((resolve) => setTimeout(resolve, animationDuration));
      await callback(); // Update content
      spread.style.opacity = 1; // Fade in
    };

    // Render both the left and right pages (spread)
    const renderSpread = async () => {
      const leftPage = currentPage.value;
      const rightPage = currentPage.value + 1;

      if (leftPage <= totalPages.value) {
        await renderPage(leftCanvas, leftPage);
      }

      if (rightPage <= totalPages.value) {
        await renderPage(rightCanvas, rightPage);
      } else {
        // Clear the right canvas if there's no next page
        const ctx = rightCanvas.value.getContext("2d");
        ctx.clearRect(0, 0, rightCanvas.value.width, rightCanvas.value.height);
      }
    };

    // Go to the previous page spread
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value -= 2; // Go back 2 pages (spread)
        smoothTransition(renderSpread);
      }
    };

    // Go to the next page spread
    const nextPage = () => {
      if (currentPage.value < totalPages.value - 1) {
        currentPage.value += 2; // Move forward 2 pages (spread)
        smoothTransition(renderSpread);
      }
    };

    // Initialize and load the PDF
    onMounted(async () => {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdfDoc = await pdfjsLib.getDocument(props.src).promise;
        totalPages.value = pdfDoc.numPages;

        // Render the initial spread (first two pages)
        renderSpread();
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    });

    const viewPortfolio = () => {
      alert("View Portfolio clicked!");
    };

    return {
      leftCanvas,
      rightCanvas,
      currentPage,
      totalPages,
      prevPage,
      nextPage,
      viewPortfolio,
    };
  },
};
</script>

<style scoped>
/* Header styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 20px;
  margin: 0;
}

.menu {
  display: flex;
  gap: 15px;
}

.menu a {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  padding: 5px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  transition: all 0.3s;
}

.menu a:hover {
  border: 1px solid #fff;
}

/* Viewer styles */
.magazine-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 90%;
  margin: 0 auto;
}

.spread {
  display: flex;
  gap: 10px;
  background-color: #fff;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: opacity 0.5s ease-in-out; /* Smooth transition */
}

.page {
  display: block;
  width: 500px; /* Adjust page width */
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
