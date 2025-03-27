<script lang="ts">
	import { t } from '$lib/utils/t';

    let code = '';
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        code = urlParams.get('code') || '';
    }
</script>

<div class="text-center">
	<a href="/">
		<img src="/images/logo/ecodeli-icon-light.png" class="m-auto h-5 w-auto" alt="EcoDeli" />
	</a>
	<h1 class="mt-10 text-xl font-semibold">Réinitialiser le mot de passe</h1>

	<form action="" class="my-5 space-y-5">
		<input type="text" class="input w-full" placeholder="Code" bind:value={code}/>
        <input type="password" class="input w-full" placeholder="Nouveau mot de passe"/>

		<input type="submit" value="Changer" class="btn btn-primary w-full" />
	</form>

	<a href="/auth/login" class="">Connexion</a>
</div>
