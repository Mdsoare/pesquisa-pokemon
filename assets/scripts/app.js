/**
 * =========================================================================
 * 0. UTILITÁRIOS DE SEGURANÇA (AppSec Hardening)
 * =========================================================================
 */
// Função para higienizar entradas e evitar a execução de scripts maliciosos (Anti-XSS)
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * =========================================================================
 * 1. MAPEAMENTOS E DICIONÁRIOS GLOBAIS
 * =========================================================================
 */
const TRANSLATE_TYPES = {
    normal: 'Normal', fighting: 'Lutador', flying: 'Voador', poison: 'Venenoso',
    ground: 'Terrestre', rock: 'Pedra', bug: 'Inseto', ghost: 'Fantasma',
    steel: 'Aço', fire: 'Fogo', water: 'Água', grass: 'Planta',
    electric: 'Elétrico', psychic: 'Psíquico', ice: 'Gelo', dragon: 'Dragão',
    dark: 'Sombrio', fairy: 'Fada', unknown: 'Desconhecido', shadow: 'Sombra'
};

const TRANSLATE_ABILITIES = {
    static: 'Estático', imposter: 'Impostor', overgrow: 'Supercrescimento',
    blaze: 'Chama', torrent: 'Torrente', 'shield-dust': 'Poeira de Escudo',
    'shed-skin': 'Troca de Pele', 'compound-eyes': 'Olhos Compostos', insomnia: 'Insônia'
};

const UNIT_CONVERSIONS = {
    weight: { unidadeConvertida: 'kg', fatorConversao: 0.1 },
    height: { unidadeConvertida: 'm', fatorConversao: 0.1 }
};

/**
 * =========================================================================
 * 2. MONITORES DE EVENTO
 * =========================================================================
 */
document.getElementById('btnPesquisar').addEventListener('click', executarBusca);

document.getElementById('pesquisaPokemon').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        executarBusca();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        event.preventDefault();
        clean();
    }
});

document.getElementById('btnLimpar').addEventListener('click', clean);

/**
 * =========================================================================
 * 3. LÓGICA DE NEGÓCIO E ROTEAMENTO DA API
 * =========================================================================
 */
function clean() {
    document.getElementById('resultado').innerHTML = '';
    document.getElementById('pesquisaPokemon').value = '';
    document.getElementById('errorMessage').style.display = 'none';
}

function validarPesquisa(nomePokemon) {
    const regex = /^[a-zA-Z0-9çáãéêíóôõú-]+$/i;

    if (!nomePokemon) {
        exibirErro("Pesquisa inválida! Digite o nome do Pokémon ou o número da Pokédex.");
        return false;
    }
    if (!regex.test(nomePokemon)) {
        exibirErro("Pesquisa inválida! Utilize apenas letras, números e hífens.");
        return false;
    }
    return true;
}

function exibirErro(mensagem) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = mensagem;
    errorDiv.style.display = 'block';
    document.getElementById('resultado').innerHTML = '';
}

async function executarBusca() {
    const inputField = document.getElementById('pesquisaPokemon');
    const query = inputField.value.trim().toLowerCase();

    const loader = document.getElementById('loader');
    const errorDiv = document.getElementById('errorMessage');
    const resultadoDiv = document.getElementById('resultado');

    if (!validarPesquisa(query)) return;

    errorDiv.style.display = 'none';
    resultadoDiv.innerHTML = '';
    loader.style.display = 'block';

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Pokémon não localizado na base de dados global.');
        const pokemonData = await response.json();

        // Validação básica da URL retornada pela API externa
        if (!pokemonData.species.url.startsWith('https://pokeapi.co/api/v2/')) {
            throw new Error('Origem de API inválida.');
        }

        const speciesResponse = await fetch(pokemonData.species.url);
        const speciesData = await speciesResponse.json();

        if (!speciesData.evolution_chain.url.startsWith('https://pokeapi.co/api/v2/')) {
            throw new Error('Origem de API inválida.');
        }

        const evoResponse = await fetch(speciesData.evolution_chain.url);
        const evoData = await evoResponse.json();

        renderizarCard(pokemonData, speciesData, evoData);

    } catch (error) {
        exibirErro(error.message || 'Erro de conexão com o servidor da PokeAPI.');
    } finally {
        loader.style.display = 'none';
    }
}

/**
 * =========================================================================
 * 4. RENDERIZAÇÃO E MANIPULAÇÃO DE DADOS (Sanitizado)
 * =========================================================================
 */
function renderizarCard(poke, species, evo) {
    const resultadoDiv = document.getElementById('resultado');

    const habilidadesTraduzidas = poke.abilities
        .map(a => escapeHTML(TRANSLATE_ABILITIES[a.ability.name] || a.ability.name))
        .join(', ');

    const categoriaPT = species.genera.find(g => g.language.name === 'pt');
    const textoDescricaoPT = species.flavor_text_entries.find(e => e.language.name === 'pt-BR' || e.language.name === 'pt');

    const formatadorMoeda = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    const pesoFormatado = formatadorMoeda.format(poke.weight * UNIT_CONVERSIONS.weight.fatorConversao);
    const alturaFormatada = formatadorMoeda.format(poke.height * UNIT_CONVERSIONS.height.fatorConversao);

    const cadeiaEvolutivaString = processarCadeiaEvolutiva(evo.chain);
    const loreAnime = buscarLoreAnime(poke.id);

    const badgesHTML = poke.types.map(t => {
        const nomeTraduzido = TRANSLATE_TYPES[t.type.name] || t.type.name;
        return `<span class="type-badge ${escapeHTML(t.type.name)}">${escapeHTML(nomeTraduzido)}</span>`;
    }).join(' ');

    const imgSrc = escapeHTML(poke.sprites.other['official-artwork'].front_default || poke.sprites.front_default);
    const pokeName = escapeHTML(poke.name.toUpperCase());
    const categoriaTexto = categoriaPT ? escapeHTML(categoriaPT.genus) : 'Desconhecida';
    const descricaoTexto = textoDescricaoPT 
        ? escapeHTML(textoDescricaoPT.flavor_text.replace(/[\n\f]/g, ' ')) 
        : 'Sem descrição em português disponível.';

    resultadoDiv.innerHTML = `
        <div class="pokedex-card" style="display: block;">
            <div class="card-header">
                <img class="pokemon-img" src="${imgSrc}" alt="${pokeName}">
                <h2 class="pokemon-name">#${escapeHTML(poke.id)} - ${pokeName}</h2>
                <div class="types-container">${badgesHTML}</div>
            </div>
            
            <div class="info-section">
                <h3><i class="fa-solid fa-dna"></i> Dados Biológicos (PT-BR)</h3>
                <div class="info-grid">
                    <div class="info-item"><p><strong>Categoria:</strong> ${categoriaTexto}</p></div>
                    <div class="info-item"><p><strong>Habilidades:</strong> ${habilidadesTraduzidas}</p></div>
                    <div class="info-item"><p><strong>Peso:</strong> ${pesoFormatado} ${UNIT_CONVERSIONS.weight.unidadeConvertida}</p></div>
                    <div class="info-item"><p><strong>Altura:</strong> ${alturaFormatada} ${UNIT_CONVERSIONS.height.unidadeConvertida}</p></div>
                </div>
                <p class="mt-10"><strong>Cadeia Evolutiva:</strong> ${cadeiaEvolutivaString}</p>
            </div>
            
            <div class="info-section">
                <h3><i class="fa-solid fa-tv"></i> Registros do Anime & Lore</h3>
                <p><strong>Primeira Aparição:</strong> ${escapeHTML(loreAnime.appearance)}</p>
                <p><strong>Treinador Notável:</strong> ${escapeHTML(loreAnime.trainer)}</p>
                <p class="mt-10"><strong>Descrição:</strong> <em>${descricaoTexto}</em></p>
            </div>
        </div>
    `;
}

function processarCadeiaEvolutiva(chain) {
    let atual = chain;
    let nos = [];
    while (atual) {
        nos.push(atual.species.name);
        atual = atual.evolves_to[0];
    }
    return nos.map(n => escapeHTML(n.charAt(0).toUpperCase() + n.slice(1))).join(' ➔ ');
}

function buscarLoreAnime(id) {
    const bancoLoreFixo = {
        1: { appearance: 'Episódio 10 - O Desafio do Samurai', trainer: 'Ash Ketchum' },
        4: { appearance: 'Episódio 11 - Charmander, o Pokémon Perdido', trainer: 'Ash Ketchum' },
        7: { appearance: 'Episódio 12 - O Esquadrão Squirtle', trainer: 'Ash Ketchum' },
        25: { appearance: 'Episódio 1 - Pokémon, Eu Escolho Você!', trainer: 'Ash Ketchum' }
    };

    if (bancoLoreFixo[id]) return bancoLoreFixo[id];

    let regiao = 'Saga Clássica (Kanto)';
    if (id > 151 && id <= 251) regiao = 'Liga Johto (Geração 2)';
    else if (id > 251 && id <= 386) regiao = 'Região de Hoenn (Geração 3)';
    else if (id > 386) regiao = 'Fases Avançadas do Anime (Sinnoh/Unova/Alola/Jornadas)';

    return {
        appearance: `Introduzido originalmente na ${regiao}`,
        trainer: 'Treinadores regionais e Líderes de Ginásio'
    };
}