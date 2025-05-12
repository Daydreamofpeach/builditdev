<template>
	<main class="w-full  z-10 flex flex-col justify-center items-center h-full ">
		<SvgoLogo :filled="true" :font-controlled="false" class="mx-auto animate-pulse  rounded-4xl infinite bg-primary  size-32" />

		<GlowyCardWrapper class="gap-2 mt-40 pt-4">
			<GlowyCard class=" pb-2 rounded-lg">
				<a href="#what" class="rounded p-6 lg:p-8 flex flex-col gap-2 cursor-pointer" @click.prevent="toggleSection('what')">
					<div class="flex justify-between items-center">
						<Icon name="lucide:hammer" class="w-8 h-8" />
						<Icon :name="activeSection === 'what' ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" class="w-6 h-6" />
					</div>
					<h1 class="font-medium text-2xl">
						BuildIt?
					</h1>
					<p class="line-clamp-4 text-neon-wb">
						Learn about what BuildIt is and how it can help you create amazing projects.
					</p>
				</a>
				<transition
					enter-active-class="transition duration-300 ease-out"
					enter-from-class="transform scale-95 opacity-0"
					enter-to-class="transform scale-100 opacity-100"
					leave-active-class="transition duration-200 ease-in"
					leave-from-class="transform scale-100 opacity-100"
					leave-to-class="transform scale-95 opacity-0"
				>
					<div v-if="activeSection === 'what'" class="p-6 lg:p-8 pt-0 expanded-content">
						<section id="what" class="mt-4">
							<h2 class="text-3xl font-bold mb-4">
								What's BuildIt?
							</h2>
							<p class="text-neon-wb">
								Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
							</p>
						</section>
					</div>
				</transition>
			</GlowyCard>
			<GlowyCard class="col-span-1  rounded-lg">
				<a href="#why" class="rounded p-6 lg:p-8 flex flex-col gap-2 cursor-pointer" @click.prevent="toggleSection('why')">
					<div class="flex justify-between items-center">
						<Icon name="ri:stack-line" class="w-8 h-8" />
						<Icon :name="activeSection === 'why' ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" class="w-6 h-6" />
					</div>
					<h1 class="font-medium text-2xl">
						Why BuildIt?
					</h1>
					<p class="line-clamp-4 text-neon-wb">
						Discover the benefits and advantages of choosing BuildIt.
					</p>
				</a>
				<transition
					enter-active-class="transition duration-300 ease-out"
					enter-from-class="transform scale-95 opacity-0"
					enter-to-class="transform scale-100 opacity-100"
					leave-active-class="transition duration-200 ease-in"
					leave-from-class="transform scale-100 opacity-100"
					leave-to-class="transform scale-95 opacity-0"
				>
					<div v-if="activeSection === 'why'" class="p-6 lg:p-8 pt-0 expanded-content">
						<section id="why" class="mt-4">
							<h2 class="text-3xl font-bold mb-4">
								Why BuildIt?
							</h2>
							<p class="text-neon-wb">
								Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
							</p>
						</section>
					</div>
				</transition>
			</GlowyCard>
			<GlowyCard class=" rounded-lg">
				<a href="#about" class="rounded p-6 lg:p-8 flex flex-col gap-2 cursor-pointer" @click.prevent="toggleSection('about')">
					<div class="flex justify-between items-center">
						<Icon name="lucide:badge-info" class="w-8 h-8" />
						<Icon :name="activeSection === 'about' ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" class="w-6 h-6" />
					</div>
					<h1 class="font-medium text-2xl">
						About Us
					</h1>
					<p class="line-clamp-4 text-neon-wb">
						Get to know our team and our story.
					</p>
				</a>
				<transition
					enter-active-class="transition duration-300 ease-out"
					enter-from-class="transform scale-95 opacity-0"
					enter-to-class="transform scale-100 opacity-100"
					leave-active-class="transition duration-200 ease-in"
					leave-from-class="transform scale-100 opacity-100"
					leave-to-class="transform scale-95 opacity-0"
				>
					<div v-if="activeSection === 'about'" class="p-6 lg:p-8 pt-0 expanded-content">
						<section id="about" class="mt-4">
							<h2 class="text-3xl font-bold mb-4">
								About Us
							</h2>
							<p class="text-neon-wb">
								Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
							</p>
						</section>
					</div>
				</transition>
			</GlowyCard>
			<GlowyCard class=" mb-40">
				<a href="#support" class="rounded p-6 lg:p-8 flex flex-col gap-2 cursor-pointer" @click.prevent="toggleSection('support')">
					<div class="flex justify-between items-center">
						<Icon name="lucide:heart" class="w-8 h-8" />
						<Icon :name="activeSection === 'support' ? 'ri:arrow-up-s-line' : 'ri:arrow-down-s-line'" class="w-6 h-6" />
					</div>
					<h1 class="font-medium text-2xl">
						Support Us
					</h1>
					<p class="line-clamp-4 text-neon-wb">
						Find out how you can support BuildIt's development.
					</p>
				</a>
				<Transition
					enter-active-class="transition duration-300 ease-out"
					enter-from-class="transform scale-95 opacity-0"
					enter-to-class="transform scale-100 opacity-100"
					leave-active-class="transition duration-200 ease-in"
					leave-from-class="transform scale-100 opacity-100"
					leave-to-class="transform scale-95 opacity-0"
				>
					<div v-if="activeSection === 'support'" class="p-6 lg:p-8 pt-0 expanded-content">
						<section id="support" class="mt-4 mb-4">
							<h2 class="text-3xl font-bold mb-4">
								Support Us
							</h2>
							<p class="text-gray-400">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
							</p>
						</section>
					</div>
				</Transition>
			</GlowyCard>
		</GlowyCardWrapper>
	</main>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import GlowyCard from "~/components/stunning/GlowyCard.vue";
	import GlowyCardWrapper from "~/components/stunning/GlowyCardWrapper.vue";

	const activeSection = ref<string | null>(null);

	const toggleSection = (section: string) => {
		activeSection.value = activeSection.value === section ? null : section;
	};
</script>

<style scoped>
.expanded-content {
	height: fit-content;
	max-height: 3000px;
	overflow-y: auto;
	overflow-x: hidden;
	max-width: 600px;
	word-wrap: break-word;
}

.glowy-card {
	height: 100%;
}
</style>
