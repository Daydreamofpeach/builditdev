<template>
	<div>
		<SiteNavbar class="sticky bg-(--ui-bg)/75 backdrop-blur" />
		<SiteSidebar />

	
		<div class="h-screen overflow-hidden">
			<DesignTopBlob />
			<DesignBottomBlob />
	
			<slot />
		</div>
	</div>
</template>
