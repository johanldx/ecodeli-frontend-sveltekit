<script lang="ts">
  import { t } from '$lib/utils/t';

  let ibanInput: HTMLInputElement; // Référence directe à l'input

  const account_title = t('app.clients.account.my_account.title');
  const my_sub = t('app.clients.account.my_account.my_sub');
  const sub_status_premium = t('app.clients.account.my_account.sub_status_premium');
  const sub_status_basic = t('app.clients.account.my_account.sub_status_basic');
  const sub_status_pro = t('app.clients.account.my_account.sub_status_pro');
  const manage = t('app.clients.account.my_account.manage');
  const manage_global_account = t('app.clients.account.my_account.manage_global_account');
  const manage_addresses = t('app.clients.account.my_account.manage_addresses');
  const wallet_title = t('app.clients.account.my_electronic_wallet.title');
  const amount_available = t('app.clients.account.my_electronic_wallet.amount_available');
  const amount_pending = t('app.clients.account.my_electronic_wallet.amount_pending');
  const to_validate = t('app.clients.account.my_electronic_wallet.to_validate');
  const iban = t('app.clients.account.my_electronic_wallet.iban');
  const transfer_bank_account = t('app.clients.account.my_electronic_wallet.transfer_bank_account');

  function handleManageSubscription() {
    alert('Redirection vers la gestion de l\'abonnement...');
  }

  function handleManageAccount() {
    window.location.href = '/auth/account';
  }

  function handleManageAddresses() {
    window.location.href = '/app/clients/addresses';
  }

  function handleValidateIBAN() {
    if (ibanInput && ibanInput.value) {
      alert(`IBAN validé : ${ibanInput.value}`);
    } else {
      alert('Veuillez entrer un IBAN valide.');
    }
  }

  function handleTransferToBank() {
    alert('Redirection vers le transfert vers un compte bancaire...');
  }
</script>

<div class="p-6 bg-[#FEFCF3] min-h-screen max-w-2xl ml-0">
  <h1 class="text-2xl font-author mb-6 text-gray-800">{$account_title}</h1>
  
  <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
    <div class="mb-4">
      <p class="text-sm text-gray-600 mb-2">{$my_sub}</p>
      <div class="flex items-center">
        <div class="bg-gray-100 py-2 px-4 flex-grow mr-2 rounded-md">
          <p class="text-gray-700">{$sub_status_premium}</p>
        </div>

        <button 
          on:click={handleManageSubscription} 
          class="bg-primary text-primary-content py-2 px-6 rounded-md text-sm hover:bg-primary-focus transition-colors"
        >
          {$manage}
        </button>
      </div>
    </div>
    
    <button 
      on:click={handleManageAccount} 
      class="bg-primary text-primary-content py-3 w-full rounded-md text-sm mb-3 hover:bg-primary-focus transition-colors cursor-pointer"
    >
      {$manage_global_account}
    </button>
    
    <button 
      on:click={handleManageAddresses} 
      class="bg-secondary text-secondary-content py-3 w-full rounded-md text-sm hover:bg-secondary-focus transition-colors cursor-pointer"
    >
      {$manage_addresses}
    </button>
  </div>
  
  <h1 class="text-2xl font-author mb-6 text-gray-800">{$wallet_title}</h1>
  
  <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div class="flex justify-center gap-16 mb-6">
      <div class="text-center">
        <p class="text-2xl font-author text-gray-800">49,75 €</p>
        <p class="text-sm text-gray-600">{$amount_available}</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-auhtor text-gray-800">49,75 €</p>
        <p class="text-sm text-gray-600">{$amount_pending}</p>
      </div>
    </div>
    
    <div class="flex items-center gap-2 mb-4">
      <input 
        bind:this={ibanInput}
        type="text" 
        placeholder={$iban} 
        class="flex-[1_1_auto] w-0 bg-gray-100 py-2 px-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
      />

      <button 
        on:click={handleValidateIBAN} 
        class="flex-none bg-primary text-primary-content py-2 px-6 rounded-md text-sm hover:bg-primary-focus transition-colors"
      >
        {$to_validate}
      </button>
    </div>
    
    <button 
      on:click={handleTransferToBank} 
      class="bg-primary text-primary-content py-3 w-full rounded-md text-sm hover:bg-primary-focus transition-colors"
    >
      {$transfer_bank_account}
    </button>
  </div>
</div>
