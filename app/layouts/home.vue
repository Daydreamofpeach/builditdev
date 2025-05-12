<template>
	<div>
		<SiteNavbar class="fixed w-full" />
		<SiteSidebar />

		<div class=" overflow-hidden">
			<DesignTopBlob />
			<DesignBottomBlob />

			<slot />
		</div>
	</div>
</template>
