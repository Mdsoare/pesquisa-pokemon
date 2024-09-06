const inputPokemon = document.getElementById('pesquisaPokemon');

inputPokemon.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        pesquisaPokemon();
    }
});