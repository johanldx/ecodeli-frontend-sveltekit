<script lang="ts">
    import Menu from '$lib/components/AppMenu.svelte';
    let menuPages = [
      { name: 'S’inscrire', url: '/auth/register' },
      { name: 'Se connecter', url: '/auth/login' },
      { name: 'Clients', url: '/auth/space/clients' },
      { name: 'Livreurs', url: '/auth/space/delivery-persons' },
      { name: 'Commerçants', url: '/auth/space/traders' },
      { name: 'Fournisseurs', url: '/auth/space/providers' },
    ];
  </script>
  
  <Menu pages={menuPages} />
  