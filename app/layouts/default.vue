<template>
	<div>
		<SiteNavbar class="sticky bg-(--ui-bg)/75 backdrop-blur" />
		<SiteSidebar />

		<UContainer>
		
			<div class=" overflow-hidden">
			<DesignTopBlob />
			<DesignBottomBlob />

			<slot />
		</div>
		</UContainer>
	</div>
</template>
