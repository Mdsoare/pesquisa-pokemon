function validarPesquisa(nomePokemon) {
    const regex = /^[a-zA-Z0-9çáãéêíóôõú]+$/i; //Para permitir espaços acrescente \s no []
    if (!nomePokemon) {
        alert("Pesquisa inválida! Você precisa digitar o nome do Pokémon ou o número da Pokedex");
        return false;
    } else if (!regex.test(nomePokemon)) {
        alert("Pesquisa inválida! Utilize apenas letras e números.");
        return false;
    }
    return true;
}