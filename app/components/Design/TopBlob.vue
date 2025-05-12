<template>
	<div class="pointer-events-none absolute inset-x-0 transform-gpu blur-3xl -top-1/4 -z-10" aria-hidden="true">
		<div class="blob relative left-[calc(50%-30rem)] aspect-[1155/678] w-[72.1875rem] rotate-30 from-(--color-primary) to-(--color-primary) bg-gradient-to-tl opacity-60 -translate-x-1/2" />
	</div>
</template>

<style scoped>
	.blob {
		animation: blob-animation 20s infinite;
	}

	@keyframes blob-animation {
		0% {
			clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%);
		}
		50% {
			clip-path: polygon(60% 30%, 90% 50%, 95% 20%, 80% 5%, 75% 10%, 65% 40%, 55% 65%, 45% 70%, 40% 55%, 35% 30%, 20% 80%, 5% 70%, 15% 95%, 25% 75%, 70% 90%, 60% 30%);
		}
		100% {
			clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%);
		}
	}
</style>
