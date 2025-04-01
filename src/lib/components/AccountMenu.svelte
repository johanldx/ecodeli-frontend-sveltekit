<script lang="ts">
    import { get, writable } from 'svelte/store';
    import { user } from '$lib/stores/user';
    import { onMount, onDestroy } from 'svelte';
    import { createAvatar } from '@dicebear/core';
    import { glass } from '@dicebear/collection';
	import { t } from '$lib/utils/t';

    function waitUntil(conditionFn: () => boolean, interval = 50): Promise<void> {
        return new Promise((resolve) => {
            const check = () => {
                if (conditionFn()) resolve();
                else setTimeout(check, interval);
            };
            check();
        });
    }

    const dropdownOpen = writable(false);
    let dropdownRef: HTMLDivElement | null = null;
    let sectionName: string;

    onMount(async () => {
        await waitUntil(() => !!get(user));
        console.log(get(user));

        const path = window.location.pathname;
        const match = path.split('/app/')[1]?.split('/')[0];

        if (match) {
            sectionName = match;
        } else {
            sectionName = "auth";
        }
    });

    const avatar = createAvatar(glass, {
        seed: user.first_name,
    });

    const toggleDropdown = () => {
        dropdownOpen.update(value => !value);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            dropdownOpen.set(false);
        }
    };

    onMount(() => {
        document.addEventListener('click', handleClickOutside);
    });

    onDestroy(() => {
        document.removeEventListener('click', handleClickOutside);
    });

    const title = t("app.global.menu.title");
    const account_link = t("app.global.menu.account_link");
    const profile_link = t("app.global.menu.profile_link");
    const logout_link = t("app.global.menu.logout_link");
</script>

<div class="dropdown dropdown-end" bind:this={dropdownRef}>
    <button
        class="btn flex items-center gap-2"
        on:click={toggleDropdown}
        aria-label="Toggle account menu"
    >
        {#if avatar}
            <div class="w-7 h-7 rounded-full overflow-hidden">
                {@html avatar}
            </div>
        {:else}
            <img src="/images/default-avatar.png" alt="User Avatar" class="w-8 h-8 rounded-full" />
        {/if}
        <span class="ml-2">{$title}</span>

        <svg class="ml-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 9l-7 7-7-7"/>
        </svg>
    </button>

    {#if $dropdownOpen}
        <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
            <li>
                <a class="py-2.5" href="/auth/account">{$account_link}</a>
            </li>
            <li>
                <a class="py-2.5" href="/app/{sectionName}/account">{$profile_link}</a>
            </li>
            <li>
                <a class="py-2.5 text-error" href="/auth/logout">{$logout_link}</a>
            </li>
        </ul>
    {/if}
</div>
