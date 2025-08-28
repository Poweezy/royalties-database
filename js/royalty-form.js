import { RoyaltyCalculator } from './modules/RoyaltyCalculator.js';

document.addEventListener('DOMContentLoaded', () => {
    const contracts = window.app.state.contracts;

    const entitySelect = document.getElementById('entity');
    const mineralSelect = document.getElementById('mineral');
    const contractSelect = document.getElementById('contract');
    const volumeInput = document.getElementById('volume');
    const royaltyAmountSpan = document.createElement('span');

    const populateContracts = () => {
        const selectedEntity = entitySelect.value;
        const selectedMineral = mineralSelect.value;
        contractSelect.innerHTML = '<option>Select Contract</option>';
        const filteredContracts = contracts.filter(c => c.entity === selectedEntity && c.mineral === selectedMineral);
        filteredContracts.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = `Contract #${c.id} (${c.calculationType})`;
            contractSelect.appendChild(option);
        });
    };

    const calculateRoyalty = () => {
        const contractId = parseInt(contractSelect.value, 10);
        const volume = parseFloat(volumeInput.value);
        if (isNaN(contractId) || isNaN(volume)) {
            royaltyAmountSpan.textContent = '';
            return;
        }

        const contract = contracts.find(c => c.id === contractId);
        if (!contract) return;

        // For sliding scale, we'll use a mock commodity price.
        const productionData = {
            volume,
            commodityPrice: 65 // Mock commodity price, in a real app this would come from an API.
        };
        const calculator = new RoyaltyCalculator();
        const royalty = calculator.calculate(contract, productionData);
        royaltyAmountSpan.textContent = `Calculated Royalty: E ${royalty.toFixed(2)}`;
    };

    entitySelect?.addEventListener('change', populateContracts);
    mineralSelect?.addEventListener('change', populateContracts);
    contractSelect?.addEventListener('change', calculateRoyalty);
    volumeInput?.addEventListener('input', calculateRoyalty);

    const formActions = document.querySelector('#royalty-records .form-actions');
    if(formActions) {
        formActions.parentElement.insertBefore(royaltyAmountSpan, formActions);
    }
});
