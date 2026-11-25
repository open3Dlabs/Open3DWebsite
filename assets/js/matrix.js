/*
	Matrix Effect for OPEN 3D LABORATORIES
	Creates falling 0s and 1s in Matrix style
*/

(function() {
	'use strict';

	var matrixActive = false;
	var fading = false;
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
		canvas.style.zIndex = '1'; // Behind content but above background
		canvas.style.pointerEvents = 'none';
		canvas.style.display = 'none';
		canvas.style.opacity = '0';
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
		if ((!matrixActive && !fading) || !ctx) return;

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
		fading = false;
		canvas.style.display = 'block';
		void canvas.offsetWidth;
		canvas.style.opacity = '0.3';
		document.body.classList.add('matrix-mode');
		if (animationId) cancelAnimationFrame(animationId);
		animate();
	}

	function stopMatrix() {
		if (!matrixActive) return;
		
		matrixActive = false;
		fading = true;
		if (canvas) {
			canvas.style.opacity = '0';
			setTimeout(function() {
				if (matrixActive) return;
				fading = false;
				if (animationId) {
					cancelAnimationFrame(animationId);
					animationId = null;
				}
				canvas.style.display = 'none';
			}, 1300);
		}

	// Restore original logo
	var logo = document.querySelector('.header-logo');
	if (logo && originalLogoSrc) {
		logo.setAttribute('src', originalLogoSrc);
	}

		document.body.classList.remove('matrix-mode');
	}

	// Toggle: close the header, swap theme while closed, reopen
	var switching = false;

	window.toggleMatrix = function() {
		if (switching) return;
		var body = document.body;

		switching = true;

		// If a popup (intro / work / contact) is open, close it first, then run the theme animation
		if (body.classList.contains('is-article-visible')) {
			var btn = document.querySelector('#main article.active .close');
			if (btn) btn.click(); else window.location.hash = '';
			var waited = 0;
			var poll = setInterval(function() {
				waited += 50;
				if (!body.classList.contains('is-article-visible') || waited > 2000) {
					clearInterval(poll);
					setTimeout(runSwitch, 450);
				}
			}, 50);
			return;
		}
		runSwitch();

		function runSwitch() {
		var dim = document.getElementById('theme-dim');
		if (!dim) {
			dim = document.createElement('div');
			dim.id = 'theme-dim';
			body.appendChild(dim);
		}
		dim.classList.remove('out');
		void dim.offsetWidth;

		// 1. Close the header and dim the page to black
		body.classList.add('is-closing');
		dim.classList.add('on');

		setTimeout(function() {
			// 2. Fully black: swap the theme underneath
			matrixActive ? stopMatrix() : startMatrix();
			body.classList.add('is-preload');
			body.classList.remove('is-closing');
			dim.classList.add('out');
			dim.classList.remove('on');

			setTimeout(function() {
				// 3. Reopen the header on the new theme
				body.classList.remove('is-preload');
				setTimeout(function() { switching = false; }, 900);
			}, 1000);
		}, 900);
		}
	};

})();
