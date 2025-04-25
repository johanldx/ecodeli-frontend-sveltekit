<script lang="ts">

import { t } from '$lib/utils/t';
import { tabTitle } from '$lib/utils/tabTitle';
import { onDestroy, onMount } from 'svelte';

onMount(() => onDestroy(tabTitle('app.providers')));

const account_title = t('app.providers.account.title');
const manage_my_documents = t('app.providers.account.manage_my_documents');
const manage_global_account = t('app.providers.account.manage_global_account');
const manage_addresses = t('app.providers.account.manage_addresses');
const manage_my_profil = t('app.providers.account.manage_my_profil');

const income = t('app.providers.income.title');
const amount_raised_month = t('app.providers.income.amount_raised_month');
const iban = t('app.providers.income.iban');
const valid = t('app.providers.income.valid');

const title_service = t('app.providers.service.title');
const transport = t('app.providers.service.transport');
const gardening = t('app.providers.service.gardening');
const childcare = t('app.providers.service.childcare');
const request = t('app.providers.service.request');
const customer_service = t('app.providers.service.customer_service');

const invoice = t('app.providers.invoice.title');

    
    function handleManageDocuments() {
      alert('Redirection vers la gestion des pièces justificatives...');
    }
    
    function handleManageAccount() {
      alert('Redirection vers la gestion du compte global...');
    }
    
    function handleManageAddresses() {
      alert('Redirection vers la gestion des adresses...');
    }
    
    function handleManageSEPA() {
      alert('Redirection vers la gestion des prélèvements SEPA...');
    }
    
    function handleContactSupport() {
      alert('Redirection vers le service client...');
    }
  
    function handleViewInvoice(month: string) {
      alert(`Visualisation de la facture ${month}...`);
    }
      function handleManageProfil() {
        alert('Redirection vers la gestion du profil...');
    }
    function handleValidateIBAN() {
        alert('Validation de l\'IBAN...');
    }
  </script>
    
  <div class="p-6 bg-[#FEFCF3]">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl font-author mb-6 text-gray-800">{$account_title}</h1>
      
      <div class="flex flex-col lg:flex-row lg:gap-6">
        <div class="lg:w-2/3">
          <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <div class="space-y-4">
              <button 
                on:click={handleManageDocuments} 
                class="bg-primary text-primary-content py-2 w-full rounded-md text-sm hover:bg-emerald-500 transition-colors"
              >
                {$manage_my_documents}
              </button>
              
              <button 
                on:click={handleManageAccount} 
                class="bg-primary text-primary-content py-2 w-full rounded-md text-sm hover:bg-emerald-500 transition-colors"
              >
                {$manage_global_account}
              </button>
              
              <button 
                on:click={handleManageAddresses} 
                class="bg-neutral text-white py-2 w-full rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                {$manage_addresses}
              </button>
              <button 
                on:click={handleManageProfil} 
                class="bg-neutral text-white py-2 w-full rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                {$manage_my_profil}
              </button>
            </div>
          </div>
          
          <h2 class="text-xl font-author mb-4 text-gray-800">{$income} </h2>
          <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div class="flex justify-center gap-16 mb-6">
              <div class="text-center">
                <p class="text-2xl font-author text-gray-800">490,75 €</p>
                <p class="text-sm text-gray-600">{$amount_raised_month}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Mon IBAN" 
                class="flex-[1_1_auto] w-0 bg-gray-100 py-2 px-4 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              />
              <button 
                on:click={handleValidateIBAN} 
                class="flex-none bg-primary text-primary-content py-2 px-6 rounded-md text-sm hover:bg-primary-focus transition-colors"
              >
                {$valid}
              </button>
            </div>
          </div>
        </div>
        
        <div class="lg:w-1/3 mt-6 lg:mt-0">
          <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
            <h2 class="text-xl font-author mb-2">{$title_service}</h2>
            <p class="text-x1 font-author text-primary-content mb-4">{$transport} (43€) <br> {$gardening} (124€ / heure) <br> {$childcare} (60€ / heure)</p>
            <p class="text-sm text-gray-200 mb-4">{$request}</p>
            <button 
              on:click={handleContactSupport} 
              class="w-full py-2 px-4 bg-neutral text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
            >
              {$customer_service}
            </button>
          </div>
  
          <h2 class="text-xl font-author mb-4 text-gray-800">{$invoice}</h2>
          <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div class="space-y-3">
              <button 
                on:click={() => handleViewInvoice('Octobre 2024')} 
                class="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>Octobre 2024</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button 
                on:click={() => handleViewInvoice('Novembre 2024')} 
                class="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>Novembre 2024</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button 
                on:click={() => handleViewInvoice('Décembre 2024')} 
                class="flex items-center justify-between w-full p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
              >
                <span>Décembre 2024</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  