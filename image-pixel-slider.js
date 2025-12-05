class ImagePixelSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Configuration
    this.originalPixelSize = 0.1083333;
    this.pixelSize = this.originalPixelSize;
    this.imageWidth = 500;
    this.imageHeight = 500;
    this.actualImagePixels = 1326;
    this.fieldSize = 143.65;
    
    // Image URL - can be overridden via attribute
    this.imageUrl = this.getAttribute('image-url') || 
      'https://dl.dropboxusercontent.com/scl/fi/ikis3ahrhioeot9q0fx23/u2os_ph488.jpg?rlkey=g8oevnyk37x366eaqe55xy5de&st=9m920pco';
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.loadImage();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 24px;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .header {
          background-color: #645a89;
          color: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 24px;
        }
        
        .header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .canvas-container {
          margin-bottom: 24px;
          text-align: center;
        }
        
        canvas {
          border-radius: 4px;
          max-width: 100%;
          height: auto;
        }
        
        .controls {
          display: flex;
          flex-direction: column;
        }
        
        .controls label {
          color: #374151;
          font-weight: 700;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .slider-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        input[type="range"] {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 6px;
          background: #d1d5db;
          border-radius: 5px;
          outline: none;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #7bcdcf;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #7bcdcf;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .value-display {
          background-color: #645a89;
          color: white;
          border-radius: 4px;
          padding: 8px 16px;
          font-weight: 600;
          min-width: 100px;
          text-align: center;
          white-space: nowrap;
        }

        @media (max-width: 640px) {
          .container {
            padding: 16px;
          }
          
          canvas {
            width: 100%;
          }
        }
      </style>
      
      <div class="container">
        <div class="header">
          <h3>Adjust the image pixel size with the slider below</h3>
        </div>
        
        <div class="canvas-container">
          <canvas id="canvas" width="${this.imageWidth}" height="${this.imageHeight}"></canvas>
        </div>
        
        <div class="controls">
          <label>Pixel Size</label>
          <div class="slider-group">
            <input 
              type="range" 
              id="slider"
              min="0.1083333" 
              max="2" 
              step="0.01" 
              value="${this.pixelSize}"
            />
            <div class="value-display" id="value">
              ${this.pixelSize.toFixed(2)} μm
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const slider = this.shadowRoot.getElementById('slider');
    const valueDisplay = this.shadowRoot.getElementById('value');
    
    slider.addEventListener('input', (e) => {
      this.pixelSize = parseFloat(e.target.value);
      valueDisplay.textContent = `${this.pixelSize.toFixed(2)} μm`;
      this.drawPixelatedImage();
    });
  }

  loadImage() {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.onload = () => {
      this.drawPixelatedImage();
    };
    this.image.src = this.imageUrl;
  }

  drawPixelatedImage() {
    const canvas = this.shadowRoot.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!this.image || !this.image.complete) return;

    // Calculate the downsampled dimensions based on pixel size
    const downsampleFactor = this.pixelSize / this.originalPixelSize;
    const downsampledWidth = Math.floor(this.imageWidth / downsampleFactor);
    const downsampledHeight = Math.floor(this.imageHeight / downsampleFactor);

    // Clear canvas
    ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);

    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;

    // Draw image downsampled then scaled back up
    ctx.drawImage(this.image, 0, 0, downsampledWidth, downsampledHeight);
    ctx.drawImage(
      canvas,
      0, 0, downsampledWidth, downsampledHeight,
      0, 0, this.imageWidth, this.imageHeight
    );
  }
}

// Register the custom element
customElements.define('image-pixel-slider', ImagePixelSlider);

// For Moodle integration: Custom elemnts are sanitized or not allowed,
// The code below is a work around: Look for divs with data-component="image-pixel-slider"
// and replace them with the web component.
function initViewers() {
	document
		.querySelectorAll('[data-component="image-pixel-slider"]')
		.forEach((el) => {
			const viewer = document.createElement("image-pixel-slider");

			// grab all data- attributes and pass them to the viewer
			Object.keys(el.dataset).forEach((key) => {
				viewer[key] = el.dataset[key];
			});

			el.replaceWith(viewer);
		});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initViewers);
} else {
	initViewers();
}
