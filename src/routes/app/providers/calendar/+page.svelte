<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import dayjs from 'dayjs';
	import isoWeek from 'dayjs/plugin/isoWeek';
	import { t } from '$lib/utils/t';
	import { tabTitle } from '$lib/utils/tabTitle';
	import { fetchFromAPI } from '$lib/utils/api';
	import { accessToken } from '$lib/stores/token';
	import { notifications } from '$lib/stores/notifications';
	import { profileIds } from '$lib/stores/profiles';

	dayjs.extend(isoWeek);

	const addSlotLabel = 'Ajouter un créneau';
	const saveLabel = 'Enregistrer';
	const cancelLabel = 'Annuler';
	const deleteLabel = 'Supprimer';

	const mondayLabel = get(t('app.providers.calendar.monday'));
	const tuesdayLabel = get(t('app.providers.calendar.tuesday'));
	const wednesdayLabel = get(t('app.providers.calendar.wednesday'));
	const thursdayLabel = get(t('app.providers.calendar.thursday'));
	const fridayLabel = get(t('app.providers.calendar.friday'));
	const saturdayLabel = get(t('app.providers.calendar.saturday'));
	const sundayLabel = get(t('app.providers.calendar.sunday'));

	const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
	const dayLabels = {
		monday: mondayLabel,
		tuesday: tuesdayLabel,
		wednesday: wednesdayLabel,
		thursday: thursdayLabel,
		friday: fridayLabel,
		saturday: saturdayLabel,
		sunday: sundayLabel
	};

	const timeSlots: string[] = Array.from({ length: 24 }, (_, i) => `${i}h`);

	interface ServiceType {
		id: number;
		name: string;
	}
	interface Schedule {
		id: number;
		providerId: number;
		personalServiceTypeId: number;
		startTime: string;
		endTime: string;
		status: 'available' | 'unavailable';
	}

	let currentWeek = dayjs().isoWeek();
	let weekRangeLabel = '';
	let schedules: Schedule[] = [];
	let serviceTypes: ServiceType[] = [];
	let authorizedTypeIds: number[] = [];
	let loading = true;

	let showAddModal = false;
	let showDetailModal = false;
	let selectedSchedule: Schedule | null = null;

	let newSchedule = {
		personalServiceTypeId: null as number | null,
		day: 'monday',
		startSlot: timeSlots[0],
		endSlot: timeSlots[1]
	};

	const profiles = get(profileIds);
	const providerId = profiles.providerId;

	onMount(() => {
		onDestroy(tabTitle('app.providers.calendar.tab_title'));
		loadServiceTypes();
		loadSchedules();
	});

	function computeWeekRange() {
		const year = dayjs().year();
		const start = dayjs().year(year).isoWeek(currentWeek).startOf('isoWeek');
		const end = start.add(6, 'day').endOf('day');
		weekRangeLabel = `Semaine du ${start.format('DD/MM/YYYY')} au ${end.format('DD/MM/YYYY')}`;
		return { start, end };
	}

	async function loadServiceTypes() {
		const all = (await fetchFromAPI('/personal-service-types', {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
		})) as ServiceType[];
		serviceTypes = all;
		const auths = (await fetchFromAPI(
			`/personal-service-type-authorizations?providerId=${providerId}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			}
		)) as { personalServiceTypeId: number }[];
		authorizedTypeIds = auths.map((a) => a.personalServiceTypeId);
	}

	async function loadSchedules() {
		loading = true;
		const { start, end } = computeWeekRange();
		schedules = (await fetchFromAPI(
			`/provider-schedules?start=${start.toISOString()}&end=${end.toISOString()}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
			}
		)) as Schedule[];
		loading = false;
	}

	function prevWeek() {
		currentWeek--;
		loadSchedules();
	}
	function nextWeek() {
		currentWeek++;
		loadSchedules();
	}

	function openAddModal(dayKey = 'monday', slot = timeSlots[0]) {
		const { start } = computeWeekRange();
		const dayIndex = dayKeys.indexOf(dayKey);
		const base = start.add(dayIndex, 'day');
		const selectedTime = parseSlot(base, slot);

		if (dayjs(selectedTime).isBefore(dayjs())) {
			notifications.error("Impossible d'ajouter un créneau dans le passé");
			return;
		}

		showAddModal = true;
		newSchedule = {
			personalServiceTypeId: null,
			day: dayKey,
			startSlot: slot,
			endSlot: timeSlots[timeSlots.indexOf(slot) + 1] || slot
		};
	}

	function handleCellClick(dk: string, slot: string) {
		openAddModal(dk, slot);
	}

	function handleScheduleClick(sched: Schedule) {
		showAddModal = false;
		selectedSchedule = sched;
		showDetailModal = true;
	}

	function parseSlot(base: dayjs.Dayjs, slot: string) {
		const [h, m] = slot.split('h').map(Number);
		return base.hour(h).minute(m).second(0).toISOString();
	}

	async function addSchedule() {
		if (!newSchedule.personalServiceTypeId) return;

		const { start } = computeWeekRange();
		const dayIndex = dayKeys.indexOf(newSchedule.day);
		const base = start.add(dayIndex, 'day');
		const startTime = parseSlot(base, newSchedule.startSlot);
		const endTime = parseSlot(base, newSchedule.endSlot);

		if (dayjs(startTime).isBefore(dayjs())) {
			notifications.error("Impossible d'ajouter un créneau dans le passé");
			return;
		}

		await fetchFromAPI('/provider-schedules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` },
			body: JSON.stringify({
				providerId,
				personalServiceTypeId: newSchedule.personalServiceTypeId,
				startTime,
				endTime,
				status: 'available'
			})
		});

		await loadSchedules();
		notifications.success('Créneau ajouté');
		showAddModal = false;
	}

	async function deleteSchedule() {
		if (!selectedSchedule) return;

		const isPast = dayjs(selectedSchedule.startTime).isBefore(dayjs());
		if (isPast || selectedSchedule.status !== 'available') {
			notifications.error('Impossible de supprimer ce créneau');
			return;
		}

		await fetchFromAPI(`/provider-schedules/${selectedSchedule.id}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${get(accessToken)}` }
		});
		notifications.success('Créneau supprimé');
		showDetailModal = false;
		loadSchedules();
	}
</script>

<div class="bg-base-100 min-h-screen p-6">
	<div class="mx-auto max-w-7xl">
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button on:click={prevWeek} class="btn btn-circle btn-sm btn-outline">←</button>
				<h1 class="font-author text-xl">{weekRangeLabel}</h1>
				<button on:click={nextWeek} class="btn btn-circle btn-sm btn-outline">→</button>
			</div>
			<!-- <button class="btn btn-primary" on:click={() => openAddModal()}>{addSlotLabel}</button> -->
		</div>

		{#if loading}
			<p class="text-center text-gray-500">Chargement...</p>
		{:else}
			<div class="border-base-300 overflow-x-auto rounded-lg border">
				<table class="table-zebra table w-full">
					<thead class="bg-base-200 font-author text-base">
						<tr>
							<th class="bg-base-200 text-right">Heure</th>
							{#each dayKeys as dk (dk)}
								<th class="text-center">{dayLabels[dk as keyof typeof dayLabels]}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each timeSlots as slot}
							<tr class="hover:bg-base-100">
								<td class="font-author bg-base-100 text-right">{slot}</td>
								{#each dayKeys as dk}
									<td class="border-base-300 relative min-h-16 min-w-32 border p-0">
										<button
											type="button"
											on:click={() => handleCellClick(dk, slot)}
											class="absolute inset-0 z-10 h-full w-full opacity-0"
											aria-label="Add schedule for {dayLabels[
												dk as keyof typeof dayLabels
											]} at {slot}"
										></button>

										{#each schedules.filter((s) => {
											const d = dayjs(s.startTime).day();
											const key = d === 0 ? 'sunday' : dayKeys[d - 1];
											const sh = dayjs(s.startTime).hour();
											const eh = dayjs(s.endTime).hour();
											const hr = Number(slot.replace('h', ''));
											return key === dk && hr >= sh && hr < eh;
										}) as sched}
											<button
												type="button"
												on:click={() => handleScheduleClick(sched)}
												class="absolute inset-0 z-20 flex items-center justify-center p-1 text-xs font-semibold shadow-sm
                     {sched.status === 'available'
													? 'bg-green-500 text-white'
													: 'bg-red-500 text-white'}"
											>
												{serviceTypes.find((st) => st.id === sched.personalServiceTypeId)?.name}
											</button>
										{/each}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	{#if showAddModal}
		<dialog class="modal modal-open">
			<div class="modal-box">
				<h3 class="font-author mb-4 text-lg">{addSlotLabel}</h3>
				<div class="form-control mb-2">
					<label class="label" for="service-type"
						><span class="label-text">Type de service</span></label
					>
					<select
						id="service-type"
						bind:value={newSchedule.personalServiceTypeId}
						class="select select-bordered"
					>
						<option value={null}>-- choisir --</option>
						{#each serviceTypes as st}
							<option value={st.id} disabled={!authorizedTypeIds.includes(st.id)}>
								{st.name}
							</option>
						{/each}
					</select>
				</div>
				<div class="mb-2 grid grid-cols-2 gap-4">
					<div class="form-control">
						<label class="label" for="day-select"><span class="label-text">Jour</span></label>
						<select id="day-select" bind:value={newSchedule.day} class="select select-bordered">
							{#each dayKeys as dk (dk)}
								<option value={dk}>{dayLabels[dk as keyof typeof dayLabels]}</option>
							{/each}
						</select>
					</div>
					<div class="form-control">
						<label class="label" for="start-slot"><span class="label-text">Début</span></label>
						<select
							id="start-slot"
							bind:value={newSchedule.startSlot}
							class="select select-bordered"
						>
							{#each timeSlots as ts}
								<option value={ts}>{ts}</option>
							{/each}
						</select>
					</div>
					<div class="form-control col-span-2">
						<label class="label" for="end-slot"><span class="label-text">Fin</span></label>
						<select id="end-slot" bind:value={newSchedule.endSlot} class="select select-bordered">
							{#each timeSlots as ts}
								<option
									value={ts}
									disabled={timeSlots.indexOf(ts) <= timeSlots.indexOf(newSchedule.startSlot)}
								>
									{ts}
								</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="modal-action">
					<button class="btn btn-primary" on:click={addSchedule}>{saveLabel}</button>
					<button class="btn btn-error" on:click={() => (showAddModal = false)}
						>{cancelLabel}</button
					>
				</div>
			</div>
		</dialog>
	{/if}

	{#if showDetailModal && selectedSchedule}
		<dialog class="modal modal-open">
			<div class="modal-box">
				<h3 class="font-author text-lg">
					{serviceTypes.find((st) => st.id === selectedSchedule!.personalServiceTypeId)?.name}
				</h3>
				<p class="py-2">
					{dayLabels[
						dayKeys[dayjs(selectedSchedule!.startTime).day() - 1 || 6] as keyof typeof dayLabels
					]}
					{' '}{dayjs(selectedSchedule!.startTime).format('HH:mm')} – {dayjs(
						selectedSchedule!.endTime
					).format('HH:mm')}
				</p>
				<p class="py-2">
					Statut :
					{@html selectedSchedule!.status === 'available'
						? `<span class="badge badge-success">Disponible</span>`
						: `<span class="badge badge-error">Réservé</span>`}
				</p>
				<div class="modal-action">
					<button class="btn btn-error" on:click={deleteSchedule}>{deleteLabel}</button>
					<button class="btn" on:click={() => (showDetailModal = false)}>{cancelLabel}</button>
				</div>
			</div>
		</dialog>
	{/if}
</div>
