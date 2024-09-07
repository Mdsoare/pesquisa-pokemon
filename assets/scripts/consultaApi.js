async function pesquisaPokemon() {
    const nomePokemon = document.getElementById('pesquisaPokemon').value.toLowerCase();
    
    if (!validarPesquisa(nomePokemon)) { //valida entrada de dados da pesquisa
        clean();
        return;
      }

    const url = `https://pokeapi.co/api/v2/pokemon/${nomePokemon}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Pokémon não encontrado!');
        }
        const data = await response.json();

        // Objeto para mapeamento de dados
        const dados = {
            unidades: {
                weight: { unidadeOriginal: 'hg', unidadeConvertida: 'kg', fatorConversao: 0.1 },
                height: { unidadeOriginal: 'dm', unidadeConvertida: 'm', fatorConversao: 0.1 }
            },
            termos: {
                types: 'Tipos',
                abilities: 'Habilidades'
            },
            tipos: {
                electric: 'Elétrico',
                psychic: 'Psíquico',
            },
            habilidades: {
                static: 'Estático',
                imposter: 'Impostor'
            }
        };

        const resultado = document.getElementById('resultado');
        resultado.textContent = ''; // Limpa o conteúdo anterior
        resultado.innerHTML = `
           <div class="pokemon-card">
               <h2>${data.name}</h2>
               <img src="${data.sprites.front_default}" alt="${data.name}">
               <p><strong>${dados.termos.types}:</strong> ${data.types.map(type => traduzir(dados.tipos, type.type.name)).join(', ')}</p>
               <p><strong>Peso:</strong> ${new Intl.NumberFormat('pt-BR').format((data.weight * dados.unidades.weight.fatorConversao).toFixed(2))} ${dados.unidades.weight.unidadeConvertida}</p>
               <p><strong>Altura:</strong> ${new Intl.NumberFormat('pt-BR').format((data.height * dados.unidades.height.fatorConversao).toFixed(2))} ${dados.unidades.height.unidadeConvertida}</p>
               <p><strong>${dados.termos.abilities}:</strong> ${data.abilities.map(ability => traduzir(dados.habilidades, ability.ability.name)).join(', ')}</p>
           </div>
       `;

        // Função auxiliar para traduzir termos
        function traduzir(dicionario, termo) {
            return dicionario[termo] || termo;
        }
    } catch (error) {
        const resultado = document.getElementById('resultado');
        alert(error.message);
        clean();
    }
}