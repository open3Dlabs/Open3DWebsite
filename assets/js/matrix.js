/*
	Matrix Effect for OPEN 3D LABORATORIES
	Creates falling 0s and 1s in Matrix style
*/

(function() {
	'use strict';

	var matrixActive = false;
	var canvas = null;
	var ctx = null;
	var animationId = null;
	var columns = [];
	var originalLogoSrc = null;

	// Initialize matrix effect
	function initMatrix() {
		if (canvas) return; // Already initialized

		// Create canvas
		canvas = document.createElement('canvas');
		canvas.id = 'matrix-canvas';
		canvas.style.position = 'fixed';
		canvas.style.top = '0';
		canvas.style.left = '0';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.zIndex = '2'; // Behind content but above background
		canvas.style.pointerEvents = 'none';
		canvas.style.display = 'none';
		canvas.style.opacity = '0.3'; // Make it subtle so website content is visible
		document.body.appendChild(canvas);

		ctx = canvas.getContext('2d');
		resizeCanvas();
		window.addEventListener('resize', resizeCanvas);

		// Initialize columns
		var fontSize = 14;
		var columnSpacing = fontSize * 1.8; // More columns = more lines of 0's and 1's
		var columnCount = Math.floor(window.innerWidth / columnSpacing);
		columns = [];
		for (var i = 0; i < columnCount; i++) {
			columns.push({
				x: i * columnSpacing,
				y: Math.random() * -1000, // Start at random heights
				speed: Math.random() * 2 + 1,
				chars: []
			});
		}
	}

	function resizeCanvas() {
		if (!canvas) return;
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}

	function animate() {
		if (!matrixActive || !ctx) return;

		// Clear canvas with slight fade effect
		ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Draw falling characters
		var fontSize = 14;
		ctx.font = fontSize + 'px monospace';
		ctx.fillStyle = '#00ff41';

		columns.forEach(function(column, i) {
			// Randomly change characters
			if (Math.random() > 0.95) {
				column.chars = [];
				var charCount = Math.floor(Math.random() * 25) + 15; // More digits per column
				for (var j = 0; j < charCount; j++) {
					column.chars.push(Math.random() > 0.5 ? '0' : '1');
				}
			}

			// Draw characters with more spacing
			var charSpacing = fontSize * 1.8; // Much more vertical spacing between chars (like Matrix)
			column.chars.forEach(function(char, charIndex) {
				var y = column.y + (charIndex * charSpacing);
				if (y > 0 && y < canvas.height) {
					var brightness = 1 - (charIndex / column.chars.length);
					ctx.fillStyle = 'rgba(0, 255, 65, ' + brightness + ')';
					ctx.fillText(char, column.x, y);
				}
			});

			// Move column down
			column.y += column.speed;
			if (column.y > canvas.height) {
				column.y = -Math.random() * 500;
			}
		});

		animationId = requestAnimationFrame(animate);
	}

	function startMatrix() {
		if (matrixActive) return;
		
		initMatrix();

	// Swap logo to Matrix version if available
	var logo = document.querySelector('.header-logo');
	if (logo) {
		if (!originalLogoSrc) originalLogoSrc = logo.getAttribute('src');
		logo.setAttribute('src', 'images/logo-matrix.png');
	}

		matrixActive = true;
		canvas.style.display = 'block';
		document.body.classList.add('matrix-mode');
		// Re-trigger header logo animation (appear from middle)
		document.body.classList.add('is-preload');
		setTimeout(function() {
			document.body.classList.remove('is-preload');
		}, 150);
		animate();
	}

	function stopMatrix() {
		if (!matrixActive) return;
		
		matrixActive = false;
		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
		if (canvas) {
			canvas.style.display = 'none';
		}

	// Restore original logo
	var logo = document.querySelector('.header-logo');
	if (logo && originalLogoSrc) {
		logo.setAttribute('src', originalLogoSrc);
	}

		document.body.classList.remove('matrix-mode');
	}

	// Toggle function
	window.toggleMatrix = function() {
		if (matrixActive) {
			stopMatrix();
		} else {
			startMatrix();
		}
	};

})();
