<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { t, tStatic } from '$lib/utils/t';

	export let columns: { Header: string; accessor: string; sortable?: boolean; hidden?: boolean }[] =
		[];
	export let data: any[] = [];
	export let pageSize: number = 5;
	export let onAction: (action: string, row: any) => void;

	const next = t('admin.users.next');
	const previous = t('admin.users.previous');
	const page = t('admin.users.page');
	const on = tStatic('admin.users.on');

	let currentPage = 0;
	let totalPages = Math.ceil(data.length / pageSize);
	let currentData: any[] = [];

	let searchQuery = '';

	let sortColumn: string | null = null;
	let sortOrder: 'asc' | 'desc' = 'asc';

	const dispatch = createEventDispatcher();

	function filterData() {
		if (searchQuery === '') {
			return data;
		}

		return data.filter((row) =>
			columns.some((col) =>
				String(row[col.accessor]).toLowerCase().includes(searchQuery.toLowerCase())
			)
		);
	}

	function updatePage(page: number) {
		if (page < 0) {
			currentPage = 0;
		} else if (page >= totalPages) {
			currentPage = totalPages - 1;
		} else {
			currentPage = page;
		}
		updateCurrentData();
	}

	function updateCurrentData() {
		const filteredData = filterData();
		totalPages = Math.ceil(filteredData.length / pageSize);
		currentData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
	}

	function sortData(column: string) {
		if (sortColumn === column) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortOrder = 'asc';
		}

		const filteredData = filterData();
		filteredData.sort((a, b) => {
			const valA = a[column];
			const valB = b[column];

			if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
			if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});

		totalPages = Math.ceil(filteredData.length / pageSize);
		currentData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
	}

	onMount(() => {
		updateCurrentData();
	});
</script>

<div class="overflow-x-auto">
	<!-- Recherche -->
	<div class="my-4">
		<input
			type="text"
			class="input input-bordered w-full md:w-1/2"
			placeholder="Rechercher..."
			bind:value={searchQuery}
			on:input={() => {
				currentPage = 0;
				updateCurrentData();
			}}
		/>
	</div>

	<!-- Table -->
	<table class="table-striped table-zebra table w-full">
		<thead>
			<tr>
				{#each columns as column}
					{#if !column.hidden}
						<th
							class="cursor-pointer"
							on:click={() => column.sortable !== false && sortData(column.accessor)}
						>
							{column.Header}
							{#if sortColumn === column.accessor}
								{#if sortOrder === 'asc'}
									<span>&#9650;</span> <!-- Flèche ascendante -->
								{:else}
									<span>&#9660;</span> <!-- Flèche descendante -->
								{/if}
							{/if}
						</th>
					{/if}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each currentData as row}
				<tr>
					{#each columns as column}
						{#if !column.hidden}
							<td>
								{#if column.accessor === 'actions'}
									<div class="flex space-x-2">
										{#each row[column.accessor] as action}
											<button
												class={action.class || 'btn btn-xs btn-primary'}
												on:click={() => onAction(action.label, row)}
											>
												{action.label}
											</button>
										{/each}
									</div>
								{:else}
									{@html row[column.accessor]}
								{/if}
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Pagination -->
	<div class="mt-4 flex items-center justify-between">
		<button
			class="btn btn-primary btn-sm"
			on:click={() => updatePage(currentPage - 1)}
			disabled={currentPage === 0}
		>
			{$previous}
		</button>

		<span>
			{$page}
			{currentPage + 1} ${on}
			{totalPages}
		</span>

		<button
			class="btn btn-primary btn-sm"
			on:click={() => updatePage(currentPage + 1)}
			disabled={currentPage === totalPages - 1}
		>
			{$next}
		</button>
	</div>
</div>
