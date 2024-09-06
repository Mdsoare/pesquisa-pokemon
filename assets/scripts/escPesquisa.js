/* //Funciona apenas na pesquisa com <Enter>
const escPokemon = document.getElementById('pesquisaPokemon'); 

escPokemon.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        event.preventDefault();
        clean();
    }
});
*/

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        event.preventDefault();
        clean();
    }
});