<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
import { get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';
import { accessToken } from '$lib/stores/token';
import { user } from '$lib/stores/user';
import { notifications } from '$lib/stores/notifications';
import { fetchFromAPI } from '$lib/utils/api';
import { tabTitle } from '$lib/utils/tabTitle';
import { t, tStatic } from '$lib/utils/t';
import { validateFilesSize } from '$lib/utils/fileValidation';
import { validatePrice } from '$lib/utils/priceValidation';

	const page_title = t('app.traders.requests.tab_title');
	const title = t('app.traders.requests.title');
	const new_announcement = t('app.traders.requests.new_announcement');
	const no_photo = t('app.traders.requests.no_photo');
	const cart_release = t('app.traders.requests.cart_release');
	const client = t('app.traders.requests.client');
	const departure = t('app.traders.requests.departure');
	const arrival = t('app.traders.requests.arrival');
	const delete_btn = t('app.traders.requests.delete');
	
	const modal_title = t('app.traders.requests.modal.title');
	const title_label = t('app.traders.requests.modal.title_label');
	const description_label = t('app.traders.requests.modal.description_label');
	const package_size_label = t('app.traders.requests.modal.package_size_label');
	const price_label = t('app.traders.requests.modal.price_label');
	const price_advice = t('app.traders.requests.modal.price_advice');
	const client_email_label = t('app.traders.requests.modal.client_email_label');
	const departure_location_label = t('app.traders.requests.modal.departure_location_label');
	const arrival_location_label = t('app.traders.requests.modal.arrival_location_label');
	const images_label = t('app.traders.requests.modal.images_label');
	const choose = t('app.traders.requests.modal.choose');
	const cancel = t('app.traders.requests.modal.cancel');
	const create = t('app.traders.requests.modal.create');
	
	const delete_modal_title = t('app.traders.requests.delete_modal.title');
	const delete_modal_cancel = t('app.traders.requests.delete_modal.cancel');
	const delete_modal_delete = t('app.traders.requests.delete_modal.delete');
	
	const all_fields_required = t('app.traders.requests.notifications.all_fields_required');
	const invalid_email = t('app.traders.requests.notifications.invalid_email');
	const user_not_authenticated = t('app.traders.requests.notifications.user_not_authenticated');
	const announcement_created = t('app.traders.requests.notifications.announcement_created');
	const announcement_deleted = t('app.traders.requests.notifications.announcement_deleted');

	interface Location {
		id: number;
		name: string;
		cp: string;
		public?: boolean;
	}

	interface TraderAd {
		id: number;
		title: string;
		description: string;
		imageUrls: string[];
		status: string;
		reference: string;
		departureLocation: Address;
		arrivalLocation: Address;
		postedBy: number;
		clientEmail: string;
		packageSize: string;
		price: number;
	}

	type Address = {
		id: number;
		userId: number;
		name: string;
		address: string;
		cp: string;
		city: string;
		country: string;
	};

	let ads: TraderAd[] = [];
	let locations: Location[] = [];
	let showModal = false;
	let showDeleteModal = false;
	let deleteId: number | null = null;

	let form = {
		title: '',
		description: '',
		clientEmail: '',
		departureLocationId: -1,
		arrivalLocationId: -1,
		packageSize: 'XS',
		price: 0,
		files: [] as File[],
		imageUrls: [] as string[]
	};

	onMount(async () => {
		await loadAds();
		await loadLocations();
		onDestroy(tabTitle('app.traders.requests.tab_title'));
	});

	async function loadAds() {
		ads = await fetchFromAPI<TraderAd[]>('/release-cart-ads/mine', {
			headers: getAuthHeaders()
		});
	}

	async function loadLocations() {
		const allLocations = await fetchFromAPI<Location[]>('/locations', {
			headers: getAuthHeaders()
		});
		locations = allLocations.filter(location => !location.public);
	}

	function getAuthHeaders() {
		return {
			Authorization: `Bearer ${get(accessToken)}`
		};
	}

	function getStatusLabel(status: string): string {
		const statusMap: Record<string, string> = {
			'pending': tStatic('app.traders.requests.status.pending'),
			'in_progress': tStatic('app.traders.requests.status.in_progress'),
			'completed': tStatic('app.traders.requests.status.completed'),
			'cancelled': tStatic('app.traders.requests.status.cancelled'),
			'Pending': tStatic('app.traders.requests.status.pending'),
			'Ongoing': tStatic('app.traders.requests.status.in_progress'),
			'Completed': tStatic('app.traders.requests.status.completed'),
			'PENDING': tStatic('app.traders.requests.status.payment_pending'),
			'COMPLETED': tStatic('app.traders.requests.status.paid'),
			'FAILED': tStatic('app.traders.requests.status.failed')
		};
		return statusMap[status] || status;
	}

	function getStatusColor(status: string): string {
		const colorMap: Record<string, string> = {
			'pending': 'badge-warning',
			'in_progress': 'badge-info',
			'completed': 'badge-success',
			'cancelled': 'badge-error',
			'Pending': 'badge-warning',
			'Ongoing': 'badge-info',
			'Completed': 'badge-success',
			'PENDING': 'badge-warning',
			'COMPLETED': 'badge-success',
			'FAILED': 'badge-error'
		};
		return colorMap[status] || 'badge-neutral';
	}

	function handleFiles(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			const selectedFiles = Array.from(input.files);
			if (validateFilesSize(selectedFiles)) {
				form.files = selectedFiles;
				form.imageUrls = form.files.map((f) => URL.createObjectURL(f));
			} else {
				input.value = '';
			}
		}
	}

	function openAddModal() {
		showModal = true;
		form = {
			title: '',
			description: '',
			clientEmail: '',
			departureLocationId: -1,
			arrivalLocationId: -1,
			packageSize: 'XS',
			price: 0,
			files: [],
			imageUrls: []
		};
	}

	async function handleCreate() {
		if (
			!form.title ||
			!form.clientEmail ||
			form.departureLocationId === -1 ||
			form.arrivalLocationId === -1
		) {
			return notifications.error(tStatic('app.traders.requests.notifications.all_fields_required'));
		}

		if (!validatePrice(form.price)) {
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(form.clientEmail)) {
			return notifications.error(tStatic('app.traders.requests.notifications.invalid_email'));
		}

		const token = get(accessToken);
		const currentUser = get(user);
		const reference = uuidv4();

		if (!currentUser || !currentUser.id) {
			return notifications.error(tStatic('app.traders.requests.notifications.user_not_authenticated'));
		}

		const formData = new FormData();
		formData.append('title', form.title);
		formData.append('description', form.description);
		formData.append('clientEmail', form.clientEmail);
		formData.append('departureLocation', form.departureLocationId.toString());
		formData.append('arrivalLocation', form.arrivalLocationId.toString());
		formData.append('posted_by', currentUser.id.toString());
		formData.append('reference', reference);
		formData.append('status', 'pending');
		formData.append('packageSize', form.packageSize);
		formData.append('price', form.price.toString());
		form.files.forEach((file) => formData.append('images', file));

		await fetchFromAPI('/release-cart-ads', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: formData
		});

		showModal = false;
		await loadAds();
		notifications.success(tStatic('app.traders.requests.notifications.announcement_created'));
	}

	function openDeleteModal(id: number) {
		deleteId = id;
		showDeleteModal = true;
	}

	async function confirmDelete() {
		if (deleteId === null) return;
		await fetchFromAPI(`/release-cart-ads/${deleteId}`, {
			method: 'DELETE',
			headers: getAuthHeaders()
		});
		deleteId = null;
		showDeleteModal = false;
		await loadAds();
		notifications.success(tStatic('app.traders.requests.notifications.announcement_deleted'));
	}
</script>

<div class="bg-base-200 p-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="font-author text-2xl text-gray-800">{$title}</h1>
		<button class="btn btn-primary" on:click={openAddModal}>{$new_announcement}</button>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each ads as ad}
			<div class="card bg-base-100 shadow">
				{#if ad.imageUrls?.length > 0}
					<div class="carousel h-40 w-full rounded-t-lg sm:h-48">
						{#each ad.imageUrls as url, i}
							<div id="ditem-{ad.id}-{i}" class="carousel-item relative w-full">
								<img
									src={url}
									alt="Image {i + 1}"
									class="h-full w-full rounded-t-lg object-cover"
									loading="lazy"
								/>
								<div
									class="bg-opacity-50 absolute right-2 bottom-2 rounded bg-black px-2 py-1 text-xs text-white"
								>
									{i + 1}/{ad.imageUrls.length}
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-2 flex justify-center gap-2">
						{#each ad.imageUrls as _, i}
							<button
								class="btn btn-xs"
								on:click={() => {
									document
										.getElementById(`ditem-${ad.id}-${i}`)
										?.scrollIntoView({ behavior: 'smooth', inline: 'start' });
								}}
							>
								{i + 1}
							</button>
						{/each}
					</div>
				{:else}
					<figure class="flex h-40 items-center justify-center rounded-t-lg bg-gray-200 sm:h-48">
						<span class="text-gray-500">{$no_photo}</span>
					</figure>
				{/if}
				<div class="card-body">
					<div>
						<p class="badge badge-neutral badge-outline mt-2 mr-2 px-3 py-2">{$cart_release}</p>
						<p class="badge badge-neutral mt-2 px-3 py-2">{ad.price} €</p>
						{#if ad.status}
							<span class="badge {getStatusColor(ad.status)} mt-2">
								{getStatusLabel(ad.status)}
							</span>
						{/if}
					</div>
					<h2 class="card-title">{ad.title}</h2>
					<p class="text-sm text-gray-500">{ad.description}</p>
					<p class="text-sm">{$client} : {ad.clientEmail}</p>
					<p class="text-xs">
						{$departure} : {ad.departureLocation.name} → {$arrival} : {ad.arrivalLocation.name}
					</p>
					<div class="mt-2 flex justify-end">
						{#if ad.status === 'pending' || ad.status === 'Pending'}
							<button class="btn btn-xs btn-error" on:click={() => openDeleteModal(ad.id)}>
								{$delete_btn}
							</button>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>

	{#if showModal}
		<div class="modal modal-open">
			<div class="modal-box max-w-xl">
				<h3 class="mb-4 text-lg">{$modal_title}</h3>
				<div class="form-control mb-3">
					<label class="label" for="title-input"><span class="label-text">{$title_label}</span></label>
					<input id="title-input" class="input input-bordered w-full" bind:value={form.title} />
				</div>
				<div class="form-control mb-3">
					<label class="label" for="description-input"
						><span class="label-text">{$description_label}</span></label
					>
					<textarea
						id="description-input"
						class="textarea textarea-bordered w-full"
						bind:value={form.description}
					></textarea>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="package-size-select"
						><span class="label-text">{$package_size_label}</span></label
					>
					<select
						id="package-size-select"
						class="select select-bordered w-full"
						bind:value={form.packageSize}
					>
						<option value="XS">XS</option>
						<option value="S">S</option>
						<option value="M">M</option>
						<option value="XL">XL</option>
						<option value="XXL">XXL</option>
					</select>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="price-input"><span class="label-text">{$price_label}</span></label>
					<input
						id="price-input"
						type="number"
						class="input input-bordered w-full"
						bind:value={form.price}
						min={1}
					/>
					<p class="mt-1 text-xs text-gray-500">{$price_advice}</p>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="client-email-input"
						><span class="label-text">{$client_email_label}</span></label
					>
					<input
						id="client-email-input"
						class="input input-bordered w-full"
						bind:value={form.clientEmail}
					/>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="departure-location-select"
						><span class="label-text">{$departure_location_label}</span></label
					>
					<select
						id="departure-location-select"
						class="select select-bordered w-full"
						bind:value={form.departureLocationId}
					>
						<option value={-1} disabled selected>{$choose}</option>
						{#each locations as loc}
							<option value={loc.id}>{loc.name} ({loc.cp})</option>
						{/each}
					</select>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="arrival-location-select"
						><span class="label-text">{$arrival_location_label}</span></label
					>
					<select
						id="arrival-location-select"
						class="select select-bordered w-full"
						bind:value={form.arrivalLocationId}
					>
						<option value={-1} disabled selected>{$choose}</option>
						{#each locations as loc}
							<option value={loc.id}>{loc.name} ({loc.cp})</option>
						{/each}
					</select>
				</div>
				<div class="form-control mb-3">
					<label class="label" for="images-input"><span class="label-text">{$images_label}</span></label>
					<input
						id="images-input"
						type="file"
						multiple
						accept="image/*"
						class="file-input file-input-bordered w-full"
						on:change={handleFiles}
					/>
				</div>
				{#if form.imageUrls.length}
					<div class="mb-3 grid grid-cols-3 gap-2">
						{#each form.imageUrls as url}
							<img src={url} alt="Sélectionnée" class="h-20 w-full rounded border object-cover" />
						{/each}
					</div>
				{/if}
				<div class="modal-action">
					<button class="btn" on:click={() => (showModal = false)}>{$cancel}</button>
					<button class="btn btn-primary" on:click={handleCreate}>{$create}</button>
				</div>
			</div>
		</div>
	{/if}

	{#if showDeleteModal}
		<div class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">{$delete_modal_title}</h3>
				<div class="modal-action">
					<button class="btn" on:click={() => (showDeleteModal = false)}>{$delete_modal_cancel}</button>
					<button class="btn btn-error" on:click={confirmDelete}>{$delete_modal_delete}</button>
				</div>
			</div>
		</div>
	{/if}
</div>
