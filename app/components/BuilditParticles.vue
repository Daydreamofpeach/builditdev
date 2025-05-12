<template>
	<Head>
		<link href="https://fonts.googleapis.com/css2?family=Silkscreen&display=swap" rel="stylesheet">
	</Head>
	<div class="inset-0 w-full  h-36  pointer-events-none">
		<div class="absolute inset-0 backdrop-blur-[2px]" />
		<canvas
			ref="canvasRef"
			class="absolute inset-0 w-full h-full bg-transparent pointer-events-auto"
			aria-label="Interactive particle effect with Buildit text"
		/>
	</div>
</template>

<script setup>
	import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";

	const canvasRef = ref(null);
	const mousePosition = reactive({ x: 0, y: 0 });
	const isTouching = ref(false);
	const isMobile = ref(false);

	// Use appConfig for theme color
	const appConfig = useAppConfig();
	const primaryColor = computed(() => {
		// You may want to map the color name to a hex if needed, or use a CSS variable
		// For now, assume it's a valid CSS color or hex
		return appConfig.ui.colors.primary || "#E34D03";
	});

	// SVG logo URL - replace with your actual hosted SVG URL in production
	const logoUrl = "https://tu25u4cq83.ufs.sh/f/eF2PPJb7iMNdyP141QORN4S0BR5GUO1tVTbjwxzEZX2mcauq";

	onMounted(() => {
		const canvas = canvasRef.value;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const updateCanvasSize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			isMobile.value = window.innerWidth < 768; // Set mobile breakpoint
		};

		updateCanvasSize();

		let particles = [];
		let textImageData = null;
		let animationFrameId = null;
		const logoImage = new Image();
		logoImage.crossOrigin = "anonymous"; // Important for CORS

		logoImage.onload = () => {
			createTextAndLogoImage();
			createInitialParticles();
			animate();
		};

		logoImage.src = logoUrl;

		function createTextAndLogoImage() {
			if (!ctx || !canvas) return;

			ctx.fillStyle = "white";
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw the logo at the top with increased scale
			const logoScale = isMobile.value ? 0.0 : 0.0; // Increased from 0.25/0.4 to 0.4/0.6
			const logoWidth = logoImage.width * logoScale;
			const logoHeight = logoImage.height * logoScale;
			const logoX = (canvas.width - logoWidth) / 2;
			const logoY = canvas.height / 2 - logoHeight - (isMobile.value ? 60 : 100);

			ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);

			// Draw the text "Buildit" below the logo
			const fontSize = isMobile.value ? 60 : 120;
			ctx.font = `bold ${fontSize}px 'Silkscreen', sans-serif`;

			// Measure text width to center it
			const text = "BUILDIT";
			const textMetrics = ctx.measureText(text);
			const textWidth = textMetrics.width;

			// Position text below the logo
			const textX = (canvas.width - textWidth) / 2;
			const textY = canvas.height / 2 + fontSize / 3; // Adjust for baseline

			// Draw text
			ctx.fillText(text, textX, textY);

			// Capture the entire canvas with both logo and text
			textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		function createParticle() {
			if (!ctx || !canvas || !textImageData) return null;

			const data = textImageData.data;

			for (let attempt = 0; attempt < 100; attempt++) {
				const x = Math.floor(Math.random() * canvas.width);
				const y = Math.floor(Math.random() * canvas.height);

				if (data[(y * canvas.width + x) * 4 + 3] > 128) {
					// Determine if particle is in the logo or text area for initial positioning
					const centerY = canvas.height / 2;
					const isLogo = y < centerY - (isMobile.value ? 30 : 50);

					return {
						x,
						y,
						baseX: x,
						baseY: y,
						size: Math.random() * 1 + 0.5,
						color: "black",
						scatteredColor: primaryColor.value, // Use dynamic primary color
						isLogo,
						life: Math.random() * 100 + 50
					};
				}
			}

			return null;
		}

		function createInitialParticles() {
			const baseParticleCount = 7000; // Increased base count for higher density
			const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)));
			for (let i = 0; i < particleCount; i++) {
				const particle = createParticle();
				if (particle) particles.push(particle);
			}
		}

		function updateParticleColors() {
			// Update all particles' scatteredColor to the new primary color
			for (let i = 0; i < particles.length; i++) {
				particles[i].scatteredColor = primaryColor.value;
			}
		}

		function animate() {
			if (!ctx || !canvas) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const { x: mouseX, y: mouseY } = mousePosition;
			const maxDistance = 240;

			for (let i = 0; i < particles.length; i++) {
				const p = particles[i];
				const dx = mouseX - p.x;
				const dy = mouseY - p.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < maxDistance && (isTouching.value || !("ontouchstart" in window))) {
					const force = (maxDistance - distance) / maxDistance;
					const angle = Math.atan2(dy, dx);
					const moveX = Math.cos(angle) * force * 60;
					const moveY = Math.sin(angle) * force * 60;
					p.x = p.baseX - moveX;
					p.y = p.baseY - moveY;

					ctx.fillStyle = p.scatteredColor;
				} else {
					p.x += (p.baseX - p.x) * 0.1;
					p.y += (p.baseY - p.y) * 0.1;
					ctx.fillStyle = "black";
				}

				ctx.fillRect(p.x, p.y, p.size, p.size);

				p.life--;
				if (p.life <= 0) {
					const newParticle = createParticle();
					if (newParticle) {
						particles[i] = newParticle;
					} else {
						particles.splice(i, 1);
						i--;
					}
				}
			}

			const baseParticleCount = 7000;
			const targetParticleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)));
			while (particles.length < targetParticleCount) {
				const newParticle = createParticle();
				if (newParticle) particles.push(newParticle);
			}

			animationFrameId = requestAnimationFrame(animate);
		}

		const handleResize = () => {
			updateCanvasSize();
			createTextAndLogoImage();
			particles = [];
			createInitialParticles();
		};

		const handleMove = (x, y) => {
			mousePosition.x = x;
			mousePosition.y = y;
		};

		const handleMouseMove = (e) => {
			handleMove(e.clientX, e.clientY);
		};

		const handleTouchMove = (e) => {
			if (e.touches.length > 0) {
				e.preventDefault();
				handleMove(e.touches[0].clientX, e.touches[0].clientY);
			}
		};

		const handleTouchStart = () => {
			isTouching.value = true;
		};

		const handleTouchEnd = () => {
			isTouching.value = false;
			mousePosition.x = 0;
			mousePosition.y = 0;
		};

		const handleMouseLeave = () => {
			if (!("ontouchstart" in window)) {
				mousePosition.x = 0;
				mousePosition.y = 0;
			}
		};

		window.addEventListener("resize", handleResize);
		canvas.addEventListener("mousemove", handleMouseMove);
		canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
		canvas.addEventListener("mouseleave", handleMouseLeave);
		canvas.addEventListener("touchstart", handleTouchStart);
		canvas.addEventListener("touchend", handleTouchEnd);

		// Watch for theme color changes and update particles
		watch(primaryColor, () => {
			updateParticleColors();
		});

		onUnmounted(() => {
			window.removeEventListener("resize", handleResize);
			if (canvas) {
				canvas.removeEventListener("mousemove", handleMouseMove);
				canvas.removeEventListener("touchmove", handleTouchMove);
				canvas.removeEventListener("mouseleave", handleMouseLeave);
				canvas.removeEventListener("touchstart", handleTouchStart);
				canvas.removeEventListener("touchend", handleTouchEnd);
			}
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		});
	});
</script>

<style scoped>
.invite-link:hover + span + span {
	color: #E34D03;
}
</style>
