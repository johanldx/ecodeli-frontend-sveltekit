<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="mx-20 color-dark-green">
	
	{@render children()}
</div>
