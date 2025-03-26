<script lang="ts">
	import { redirect } from "@sveltejs/kit";
    export async function load() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
        throw redirect(302, '/login');
    }

    // Optionnellement, vous pouvez vérifier si le token est valide avec votre API

    return {};
    }
</script>
