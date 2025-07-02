// ===== NOVA CLASSE Manutencao =====
class Manutencao {
    constructor(data, tipo, custo, descricao = "", status = "Realizada") { // status: 'Realizada' ou 'Agendada'
        this.data = data; // Espera-se uma string YYYY-MM-DD
        this.tipo = tipo;
        this.custo = custo;
        this.descricao = descricao;
        this.status = status;
    }

    formatar() {
        const dataFormatada = this.data ? new Date(this.data + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não definida';
        let custoFormatado = "";
        if (this.custo !== null && this.custo !== undefined && this.status === 'Realizada') {
            custoFormatado = ` - R$${Number(this.custo).toFixed(2)}`;
        }
        let descInfo = this.descricao ? ` (${this.descricao})` : '';
        return `${this.tipo} em ${dataFormatada}${custoFormatado}${descInfo} [${this.status}]`;
    }

    validar() {
        const hoje = new Date().toISOString().split('T')[0];

        if (!this.tipo || this.tipo.trim() === "") {
            alert("Erro: O tipo de serviço não pode estar vazio.");
            return false;
        }
        if (!this.data) {
            alert("Erro: A data da manutenção é obrigatória.");
            return false;
        }
        try {
            const dataObj = new Date(this.data + 'T00:00:00');
            if (isNaN(dataObj.getTime())) {
                throw new Error("Data inválida");
            }
            if (this.status === 'Realizada' && this.data > hoje) {
                alert("Erro: Manutenção 'Realizada' não pode ter data futura.");
                return false;
            }
        } catch (e) {
            alert("Erro: Formato de data inválido. Use AAAA-MM-DD.");
            return false;
        }
        if (this.status === 'Realizada' && (this.custo === null || this.custo === undefined || isNaN(Number(this.custo)) || Number(this.custo) < 0)) {
            alert("Erro: Custo inválido para manutenção realizada. Deve ser um número positivo ou zero.");
            return false;
        }
        if (!['Realizada', 'Agendada'].includes(this.status)) {
            alert("Erro: Status de manutenção inválido.");
            return false;
        }
        return true;
    }

    getDataObj() {
        try {
            return new Date(this.data + 'T00:00:00');
        } catch (e) {
            return null;
        }
    }
}


// ===== MODIFICAÇÕES NAS CLASSES DE VEÍCULO =====
class Carro {
    constructor(modelo, cor, id = Date.now() + Math.random().toString(36).substr(2, 9)) { // ID mais robusto
        this.id = String(id); // Garante que ID é string
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
        this.velocidadeMaxima = 180;
        this.tipo = "carro";
        this.historicoManutencao = [];
    }

    adicionarManutencao(manutencao) {
        if (manutencao instanceof Manutencao && manutencao.validar()) {
            this.historicoManutencao.push(manutencao);
            this.historicoManutencao.sort((a, b) => {
                const dataA = a.getDataObj();
                const dataB = b.getDataObj();
                if (!dataA) return 1;
                if (!dataB) return -1;
                return dataA - dataB;
            });
            console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencao.tipo}`);
            salvarGaragem();
            return true;
        }
        console.error("Falha ao adicionar manutenção: objeto inválido.");
        return false;
    }

    getHistoricoFormatado() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const realizadas = this.historicoManutencao
            .filter(m => m.status === 'Realizada')
            .map(m => m.formatar());

        const agendadas = this.historicoManutencao
            .filter(m => m.status === 'Agendada')
            .map(m => ({
                texto: m.formatar(),
                dataObj: m.getDataObj()
            }));

        const futuras = agendadas
            .filter(a => a.dataObj && a.dataObj >= hoje)
            .map(a => a.texto);

        const passadasAgendadas = agendadas
            .filter(a => !a.dataObj || a.dataObj < hoje)
            .map(a => a.texto);

        return {
            realizadas: realizadas,
            futuras: futuras,
            passadas: passadasAgendadas
        };
    }

    ligar() {
        if (this.ligado) {
            alert("O carro já está ligado!");
            return;
        }
        this.ligado = true;
        playSound("somLigar");
        atualizarStatusVisual(this);
        salvarGaragem();
        console.log("Carro ligado!");
    }

    desligar() {
        if (!this.ligado) {
            alert("O carro já está desligado!");
            return;
        }
        if (this.velocidade > 0) {
            alert("Pare o carro antes de desligar!");
            return;
        }
        this.ligado = false;
        this.velocidade = 0;
        playSound("somDesligar");
        atualizarStatusVisual(this);
        salvarGaragem();
        console.log("Carro desligado!");
    }

    acelerar(incremento) {
        if (!this.ligado) {
            alert("O carro precisa estar ligado para acelerar.");
            return;
        }
        const novaVelocidade = this.velocidade + incremento;
        this.velocidade = Math.min(novaVelocidade, this.velocidadeMaxima);
        playSound("somAcelerar");
        atualizarStatusVisual(this);
        console.log(`Velocidade aumentada para ${this.velocidade}`);
    }

    frear(decremento) {
        if (this.velocidade === 0 && this.ligado) {
            return;
        }
        if (!this.ligado && this.velocidade === 0) return;

        this.velocidade = Math.max(0, this.velocidade - decremento);
        playSound("somFrear");
        atualizarStatusVisual(this);
        console.log(`Velocidade reduzida para ${this.velocidade}`);
        if (this.velocidade === 0) {
            salvarGaragem();
        }
    }

    buzinar() {
        playSound("somBuzina");
        console.log("Beep beep!");
    }

    exibirInformacoes() {
        const status = this.ligado ? `<span class="status-ligado">Ligado</span>` : `<span class="status-desligado">Desligado</span>`;
        return `
            ID: ${this.id}<br>
            Modelo: ${this.modelo}<br>
            Cor: ${this.cor}<br>
            Status: ${status}<br>
            Velocidade: ${this.velocidade} km/h<br>
            Velocidade Máxima: ${this.velocidadeMaxima} km/h`;
    }

    getDescricaoLista() {
        return `${this.tipo.charAt(0).toUpperCase() + this.tipo.slice(1)}: ${this.modelo} (${this.cor})`;
    }

    static fromData(data) {
        const carro = new Carro(data.modelo, data.cor, data.id);
        carro.ligado = data.ligado;
        carro.velocidade = data.velocidade;
        carro.historicoManutencao = data.historicoManutencao.map(m =>
            new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
        );
        return carro;
    }
}

class CarroEsportivo extends Carro {
    constructor(modelo, cor, id = Date.now() + Math.random().toString(36).substr(2, 9)) {
        super(modelo, cor, id);
        this.turboAtivado = false;
        this.velocidadeMaxima = 250;
        this.tipo = "esportivo";
    }

    ativarTurbo() {
        if (!this.ligado) {
            alert("O carro precisa estar ligado para ativar o turbo.");
            return;
        }
        if (this.turboAtivado) {
            alert("O turbo já está ativado!");
            return;
        }
        this.turboAtivado = true;
        this.velocidadeMaxima = 320;
        console.log("Turbo ativado!");
        atualizarStatusVisual(this);
        salvarGaragem();
    }

    desativarTurbo() {
        if (!this.turboAtivado) {
            alert("O turbo já está desativado!");
            return;
        }
        this.turboAtivado = false;
        this.velocidadeMaxima = 250;
        if (this.velocidade > this.velocidadeMaxima) {
            console.log("Velocidade limitada após desativar turbo.");
        }
        console.log("Turbo desativado!");
        atualizarStatusVisual(this);
        salvarGaragem();
    }

    acelerar(incremento) {
        const boost = this.turboAtivado ? 1.5 : 1;
        super.acelerar(incremento * boost);
    }

    exibirInformacoes() {
        const infoBase = super.exibirInformacoes();
        const turboStatus = this.turboAtivado ? "Ativado" : "Desativado";
        return `
            ${infoBase}<br>
            Turbo: ${turboStatus}
        `;
    }

    static fromData(data) {
        const esportivo = new CarroEsportivo(data.modelo, data.cor, data.id);
        esportivo.ligado = data.ligado;
        esportivo.velocidade = data.velocidade;
        esportivo.turboAtivado = data.turboAtivado;
        esportivo.historicoManutencao = data.historicoManutencao.map(m =>
            new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
        );
        return esportivo;
    }
}

class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga, id = Date.now() + Math.random().toString(36).substr(2, 9)) {
        super(modelo, cor, id);
        this.capacidadeCarga = capacidadeCarga;
        this.cargaAtual = 0;
        this.velocidadeMaxima = 120;
        this.tipo = "caminhao";
    }

    carregar(quantidade) {
        if (this.ligado) {
            alert("Desligue o caminhão antes de carregar/descarregar.");
            return;
        }
        if (isNaN(quantidade) || quantidade <= 0) {
            alert("A quantidade a carregar deve ser um número positivo.");
            return;
        }
        if (this.cargaAtual + quantidade > this.capacidadeCarga) {
            alert(`Carga excede a capacidade do caminhão (${this.capacidadeCarga} kg).`);
            return;
        }
        this.cargaAtual += quantidade;
        console.log(`Caminhão carregado. Carga atual: ${this.cargaAtual} kg`);
        atualizarStatusVisual(this);
        salvarGaragem();
    }

    descarregar(quantidade) {
        if (this.ligado) {
            alert("Desligue o caminhão antes de carregar/descarregar.");
            return;
        }
        if (isNaN(quantidade) || quantidade <= 0) {
            alert("A quantidade a descarregar deve ser um número positivo.");
            return;
        }
        if (this.cargaAtual - quantidade < 0) {
            alert(`Não há carga suficiente para descarregar ${quantidade} kg. Carga atual: ${this.cargaAtual} kg.`);
            return;
        }
        this.cargaAtual -= quantidade;
        console.log(`Caminhão descarregado. Carga atual: ${this.cargaAtual} kg`);
        atualizarStatusVisual(this);
        salvarGaragem();
    }

    acelerar(incremento) {
        const fatorCarga = 1 - (this.cargaAtual / (this.capacidadeCarga * 2));
        super.acelerar(incremento * Math.max(0.3, fatorCarga));
    }

    exibirInformacoes() {
        const infoBase = super.exibirInformacoes();
        return `
            ${infoBase}<br>
            Capacidade: ${this.capacidadeCarga} kg<br>
            Carga atual: ${this.cargaAtual} kg`;
    }

    static fromData(data) {
        const caminhao = new Caminhao(data.modelo, data.cor, data.capacidadeCarga, data.id);
        caminhao.ligado = data.ligado;
        caminhao.velocidade = data.velocidade;
        caminhao.cargaAtual = data.cargaAtual;
        caminhao.historicoManutencao = data.historicoManutencao.map(m =>
            new Manutencao(m.data, m.tipo, m.custo, m.descricao, m.status)
        );
        return caminhao;
    }
}


// ===== GERENCIAMENTO DA GARAGEM E PERSISTÊNCIA =====
let garagem = [];
let veiculoSelecionado = null;
const GARAGEM_STORAGE_KEY = 'minhaGaragemInteligenteB2P1A2'; 

function salvarGaragem() {
    try {
        const garagemParaSalvar = garagem.map(veiculo => {
            const data = { ...veiculo };
            data.historicoManutencao = veiculo.historicoManutencao.map(m => ({ ...m }));
            return data;
        });
        localStorage.setItem(GARAGEM_STORAGE_KEY, JSON.stringify(garagemParaSalvar));
        console.log("Garagem salva no LocalStorage.");
    } catch (error) {
        console.error("Erro ao salvar garagem no LocalStorage:", error);
        alert("Não foi possível salvar o estado da garagem.");
    }
}

function carregarGaragem() {
    const dadosSalvos = localStorage.getItem(GARAGEM_STORAGE_KEY);
    if (dadosSalvos) {
        try {
            const garagemData = JSON.parse(dadosSalvos);
            garagem = garagemData.map(data => {
                switch (data.tipo) {
                    case 'carro':
                        return Carro.fromData(data);
                    case 'esportivo':
                        return CarroEsportivo.fromData(data);
                    case 'caminhao':
                        return Caminhao.fromData(data);
                    default:
                        console.warn("Tipo de veículo desconhecido encontrado:", data.tipo);
                        return null;
                }
            }).filter(v => v !== null);
            console.log("Garagem carregada do LocalStorage.");
            atualizarListaVeiculos();
            verificarAgendamentosProximos();
        } catch (error) {
            console.error("Erro ao carregar garagem do LocalStorage:", error);
            alert("Erro ao carregar dados salvos da garagem. Os dados podem estar corrompidos.");
            garagem = [];
            localStorage.removeItem(GARAGEM_STORAGE_KEY);
        }
    } else {
        console.log("Nenhuma garagem salva encontrada.");
    }
}

// ===== FUNÇÕES DE CRIAÇÃO E INTERFACE =====
function criarVeiculo(tipo) {
    let novoVeiculo = null;
    let modelo, cor, capacidade;

    try {
        switch (tipo) {
            case 'carro':
                modelo = document.getElementById("modeloBase").value.trim();
                cor = document.getElementById("corBase").value.trim();
                if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Carro Base.");
                novoVeiculo = new Carro(modelo, cor);
                document.getElementById("statusCarro").textContent = `Carro ${modelo} criado.`;
                document.getElementById("modeloBase").value = '';
                document.getElementById("corBase").value = '';
                break;
            case 'esportivo':
                modelo = document.getElementById("modeloEsportivo").value.trim();
                cor = document.getElementById("corEsportivo").value.trim();
                if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Carro Esportivo.");
                novoVeiculo = new CarroEsportivo(modelo, cor);
                document.getElementById("statusEsportivo").textContent = `Esportivo ${modelo} criado.`;
                document.getElementById("modeloEsportivo").value = '';
                document.getElementById("corEsportivo").value = '';
                break;
            case 'caminhao':
                modelo = document.getElementById("modeloCaminhao").value.trim();
                cor = document.getElementById("corCaminhao").value.trim();
                capacidade = parseInt(document.getElementById("capacidadeCaminhao").value);
                if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Caminhão.");
                if (isNaN(capacidade) || capacidade <= 0) throw new Error("Capacidade de carga inválida para Caminhão.");
                novoVeiculo = new Caminhao(modelo, cor, capacidade);
                document.getElementById("statusCaminhao").textContent = `Caminhão ${modelo} criado.`;
                document.getElementById("modeloCaminhao").value = '';
                document.getElementById("corCaminhao").value = '';
                document.getElementById("capacidadeCaminhao").value = '';
                break;
            default:
                console.error("Tipo de veículo desconhecido para criação:", tipo);
                alert("Erro interno: tipo de veículo inválido.");
                return;
        }

        if (novoVeiculo) {
            garagem.push(novoVeiculo);
            salvarGaragem();
            atualizarListaVeiculos();
            console.log(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} criado:`, novoVeiculo);
        }
    } catch (error) {
        alert(`Erro ao criar veículo: ${error.message}`);
        console.error("Erro na criação do veículo:", error);
    }
}

function atualizarListaVeiculos() {
    const listaDiv = document.getElementById("listaVeiculos");
    listaDiv.innerHTML = "";

    if (garagem.length === 0) {
        listaDiv.innerHTML = "<p>Nenhum veículo na garagem.</p>";
        return;
    }

    garagem.forEach(veiculo => {
        const itemVeiculo = document.createElement("div");
        itemVeiculo.classList.add("veiculo-item-lista");
        itemVeiculo.textContent = veiculo.getDescricaoLista();
        itemVeiculo.dataset.veiculoId = veiculo.id; // Usando data attributes
        itemVeiculo.onclick = () => selecionarVeiculo(veiculo.id);

        if (veiculoSelecionado && veiculo.id === veiculoSelecionado.id) {
            itemVeiculo.classList.add("selected");
        }
        listaDiv.appendChild(itemVeiculo);
    });
}


function selecionarVeiculo(id) {
    const veiculoEncontrado = garagem.find(v => v.id === id);
    const btnDetalhesExtras = document.getElementById('btnVerDetalhesExtras');
    const areaDetalhesExtras = document.getElementById('areaDetalhesExtras');

    veiculoSelecionado = veiculoEncontrado || null;

    // Atualiza a classe 'selected' em todos os itens da lista
    document.querySelectorAll('.veiculo-item-lista').forEach(item => {
        item.classList.toggle('selected', item.dataset.veiculoId === id);
    });

    exibirInformacoesVeiculoSelecionado(); // Única chamada para exibir/esconder/atualizar

    if (veiculoEncontrado) {
        console.log("Veículo selecionado:", veiculoSelecionado);
        if (btnDetalhesExtras) btnDetalhesExtras.style.display = 'inline-block';
        if (areaDetalhesExtras) {
            areaDetalhesExtras.style.display = 'none';
            areaDetalhesExtras.innerHTML = '<p>Clique no botão acima para carregar os detalhes.</p>';
        }
    }
}


function exibirInformacoesVeiculoSelecionado() {
    const areaVeiculoDiv = document.getElementById("areaVeiculoSelecionado");
    const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");
    const imagemVeiculo = document.getElementById("imagemVeiculo");
    const btnDetalhesExtras = document.getElementById('btnVerDetalhesExtras');
    const areaDetalhesExtras = document.getElementById('areaDetalhesExtras');

    if (veiculoSelecionado) {
        areaVeiculoDiv.classList.remove("hidden");
        informacoesVeiculoDiv.innerHTML = veiculoSelecionado.exibirInformacoes();
        
        let imagePath = "";
        switch (veiculoSelecionado.tipo) {
            case "carro": imagePath = "imagens/carro.png"; break;
            case "esportivo": imagePath = "imagens/esportivo.png"; break;
            case "caminhao": imagePath = "imagens/caminhao.png"; break;
            default: imagePath = ""; break;
        }

        if (imagePath) {
            imagemVeiculo.src = imagePath;
            imagemVeiculo.alt = `Imagem de ${veiculoSelecionado.tipo}`;
            imagemVeiculo.style.display = "block";
        } else {
            imagemVeiculo.style.display = "none";
        }

        atualizarStatusVisual(veiculoSelecionado);
        atualizarDisplayManutencao(veiculoSelecionado);
        controlarBotoesAcao();
        document.getElementById("formularioAgendamento").reset();
        
        if (btnDetalhesExtras) btnDetalhesExtras.style.display = 'inline-block';
        if (areaDetalhesExtras) {
            areaDetalhesExtras.style.display = 'none';
            areaDetalhesExtras.innerHTML = '<p>Clique no botão "Ver Detalhes Extras (API)" para carregar.</p>';
        }

    } else {
        areaVeiculoDiv.classList.add("hidden");
    }
}

function interagir(acao) {
    if (!veiculoSelecionado) {
        alert("Nenhum veículo selecionado!");
        return;
    }
    try {
        switch (acao) {
            case "ligar": veiculoSelecionado.ligar(); break;
            case "desligar": veiculoSelecionado.desligar(); break;
            case "acelerar": veiculoSelecionado.acelerar(10); break;
            case "frear": veiculoSelecionado.frear(10); break;
            case "buzinar": veiculoSelecionado.buzinar(); break;
            case "ativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) veiculoSelecionado.ativarTurbo();
                else alert("Este veículo não tem turbo.");
                break;
            case "desativarTurbo":
                if (veiculoSelecionado instanceof CarroEsportivo) veiculoSelecionado.desativarTurbo();
                else alert("Este veículo não tem turbo.");
                break;
            case "carregar":
                if (veiculoSelecionado instanceof Caminhao) {
                    const cargaStr = prompt(`Quanto carregar? (Capacidade: ${veiculoSelecionado.capacidadeCarga} kg, Carga Atual: ${veiculoSelecionado.cargaAtual} kg)`);
                    if (cargaStr !== null) {
                        const carga = parseFloat(cargaStr);
                        if (!isNaN(carga)) veiculoSelecionado.carregar(carga);
                        else alert("Valor de carga inválido.");
                    }
                } else alert("Este veículo não pode ser carregado.");
                break;
            case "descarregar":
                if (veiculoSelecionado instanceof Caminhao) {
                    const descargaStr = prompt(`Quanto descarregar? (Carga Atual: ${veiculoSelecionado.cargaAtual} kg)`);
                    if (descargaStr !== null) {
                        const descarga = parseFloat(descargaStr);
                        if (!isNaN(descarga)) veiculoSelecionado.descarregar(descarga);
                        else alert("Valor de descarga inválido.");
                    }
                } else alert("Este veículo não pode ser descarregado.");
                break;
            default: alert("Ação inválida.");
        }
    } catch (error) {
        alert(`Erro ao executar ação '${acao}': ${error.message}`);
        console.error(`Erro na ação ${acao}:`, error);
    }
    if (veiculoSelecionado) exibirInformacoesVeiculoSelecionado();
}

function controlarBotoesAcao() {
    if (!veiculoSelecionado) return;
    const ehEsportivo = veiculoSelecionado instanceof CarroEsportivo;
    const ehCaminhao = veiculoSelecionado instanceof Caminhao;
    document.getElementById('btnTurboOn').style.display = ehEsportivo ? 'inline-block' : 'none';
    document.getElementById('btnTurboOff').style.display = ehEsportivo ? 'inline-block' : 'none';
    document.getElementById('btnCarregar').style.display = ehCaminhao ? 'inline-block' : 'none';
    document.getElementById('btnDescarregar').style.display = ehCaminhao ? 'inline-block' : 'none';
}

function atualizarStatusVisual(veiculo) {
    if (!veiculoSelecionado || veiculo.id !== veiculoSelecionado.id) return;
    const velocidadeProgress = document.getElementById("velocidadeProgress");
    const statusVeiculoSpan = document.getElementById("statusVeiculo");
    const velocidadeTexto = document.getElementById("velocidadeTexto");
    const informacoesVeiculoDiv = document.getElementById("informacoesVeiculo");

    const porcentagemVelocidade = veiculo.velocidadeMaxima > 0 ? (veiculo.velocidade / veiculo.velocidadeMaxima) * 100 : 0;
    velocidadeProgress.style.width = Math.min(100, Math.max(0, porcentagemVelocidade)) + "%";
    velocidadeTexto.textContent = `${Math.round(veiculo.velocidade)} km/h`;

    if (veiculo.ligado) {
        statusVeiculoSpan.textContent = "Ligado";
        statusVeiculoSpan.className = "status-ligado";
    } else {
        statusVeiculoSpan.textContent = "Desligado";
        statusVeiculoSpan.className = "status-desligado";
    }
    informacoesVeiculoDiv.innerHTML = veiculo.exibirInformacoes();
}

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.warn("Erro ao tocar som:", error));
    } else {
        console.warn("Elemento de áudio não encontrado:", soundId);
    }
}

// ===== FUNÇÕES DE MANUTENÇÃO E AGENDAMENTO =====
function atualizarDisplayManutencao(veiculo) {
    const historicoDiv = document.getElementById("historicoManutencao");
    const agendamentosDiv = document.getElementById("agendamentosFuturos");
    historicoDiv.innerHTML = "";
    agendamentosDiv.innerHTML = "";

    if (!veiculo) {
        historicoDiv.innerHTML = "<p>Selecione um veículo para ver o histórico.</p>";
        agendamentosDiv.innerHTML = "<p>Selecione um veículo para ver os agendamentos.</p>";
        return;
    }

    const { realizadas, futuras, passadas } = veiculo.getHistoricoFormatado();

    if (realizadas.length > 0) {
        realizadas.forEach(item => {
            const p = document.createElement("p");
            p.classList.add("manutencao-item");
            p.textContent = item;
            historicoDiv.appendChild(p);
        });
    } else {
        historicoDiv.innerHTML = "<p>Nenhuma manutenção realizada registrada.</p>";
    }

    if (futuras.length > 0) {
        futuras.forEach(item => {
            const p = document.createElement("p");
            p.classList.add("agendamento-item");
            p.textContent = item;
            agendamentosDiv.appendChild(p);
        });
    } else {
        agendamentosDiv.innerHTML = "<p>Nenhum agendamento futuro.</p>";
    }

    if (passadas.length > 0) {
        const passadasTitle = document.createElement('h4');
        passadasTitle.textContent = "Agendamentos Passados (Não Realizados?)";
        passadasTitle.style.marginTop = '10px';
        passadasTitle.style.color = 'orange';
        agendamentosDiv.appendChild(passadasTitle);
        passadas.forEach(item => {
            const p = document.createElement("p");
            p.classList.add("agendamento-item", "passado");
            p.textContent = item;
            agendamentosDiv.appendChild(p);
        });
    }
}

function agendarManutencao(event) {
    event.preventDefault();
    if (!veiculoSelecionado) {
        alert("Selecione um veículo antes de agendar.");
        return;
    }
    const data = document.getElementById("dataAgendamento").value;
    const tipo = document.getElementById("tipoAgendamento").value.trim();
    const custoInput = document.getElementById("custoAgendamento").value;
    const descricao = document.getElementById("descricaoAgendamento").value.trim();
    const custo = custoInput ? parseFloat(custoInput) : null;
    const novaManutencao = new Manutencao(data, tipo, custo, descricao, "Agendada");

    if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
        alert(`Manutenção "${tipo}" agendada para ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}!`);
        atualizarDisplayManutencao(veiculoSelecionado);
        document.getElementById("formularioAgendamento").reset();
        verificarAgendamentosProximos();
    } else {
        console.error("Falha ao validar ou adicionar agendamento.");
    }
}

function adicionarManutencaoRealizada() {
    if (!veiculoSelecionado) {
        alert("Selecione um veículo antes de registrar manutenção.");
        return;
    }
    const data = document.getElementById("dataAgendamento").value;
    const tipo = document.getElementById("tipoAgendamento").value.trim();
    const custoInput = document.getElementById("custoAgendamento").value;
    const descricao = document.getElementById("descricaoAgendamento").value.trim();
    const custo = parseFloat(custoInput);
    if (custoInput === '' || isNaN(custo) || custo < 0) {
        alert("Erro: O custo é obrigatório e deve ser um número positivo (ou zero) para registrar uma manutenção realizada.");
        return;
    }
    const novaManutencao = new Manutencao(data, tipo, custo, descricao, "Realizada");
    if (veiculoSelecionado.adicionarManutencao(novaManutencao)) {
        alert(`Manutenção "${tipo}" registrada como realizada em ${new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')}!`);
        atualizarDisplayManutencao(veiculoSelecionado);
        document.getElementById("formularioAgendamento").reset();
    } else {
        console.error("Falha ao validar ou adicionar manutenção realizada.");
    }
}

function verificarAgendamentosProximos() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    let alertas = [];
    garagem.forEach(veiculo => {
        veiculo.historicoManutencao.forEach(manutencao => {
            if (manutencao.status === 'Agendada') {
                const dataAgendamento = manutencao.getDataObj();
                if (dataAgendamento) {
                    dataAgendamento.setHours(0, 0, 0, 0);
                    if (dataAgendamento.getTime() === hoje.getTime()) {
                        alertas.push(`🚨 HOJE: ${manutencao.tipo} for ${veiculo.modelo}`);
                    } else if (dataAgendamento.getTime() === amanha.getTime()) {
                        alertas.push(`🔔 AMANHÃ: ${manutencao.tipo} for ${veiculo.modelo}`);
                    }
                }
            }
        });
    });
    if (alertas.length > 0) {
        alert("Lembretes de Agendamento:\n\n" + alertas.join("\n"));
    }
}

// ===== PARTE 1: API SIMULADA - DETALHES EXTRAS DO VEÍCULO =====
// (Nenhuma alteração necessária aqui)
async function buscarDetalhesVeiculoAPI(identificadorVeiculo) { /* ...código existente sem alterações... */ }
async function mostrarDetalhesExtrasVeiculo() { /* ...código existente sem alterações... */ }


// ===== INÍCIO DAS MUDANÇAS PARA A ATIVIDADE B2.P1.A5 =====

// <<< MUDANÇA AQUI: A chave da API foi REMOVIDA daqui. Agora ela está segura no backend!
// const apiKey = "603bba2cdfbd01d41c80a3034a8c5aff"; // <-- CHAVE REMOVIDA

// Variáveis globais para armazenar o estado da previsão
let fullForecastData = []; // Guarda a previsão completa dos 5 dias
let ultimaCidadePesquisada = ""; // Guarda o nome da última cidade

// Objeto de configuração para os destaques
const PREVISAO_DESTAQUES = {
    CHUVA_ID: 'check-destaque-chuva',
    FRIO_ID: 'check-destaque-frio',
    FRIO_LIMITE: 10, // Temperatura em Celsius para considerar "frio"
    CALOR_ID: 'check-destaque-calor',
    CALOR_LIMITE: 30 // Temperatura em Celsius para considerar "calor"
};


/**
 * Busca a previsão do tempo detalhada (5 dias) para uma cidade,
 * AGORA CHAMANDO O NOSSO PRÓPRIO BACKEND.
 * @param {string} cidade O nome da cidade para a busca.
 * @returns {Promise<Object>} Uma promessa que resolve com os dados da API ou lança um erro.
 */
// <<< MUDANÇA AQUI: A função foi reescrita para chamar nosso backend.
async function buscarPrevisaoDetalhada(cidade) {
    // A URL agora aponta para o seu servidor backend na porta 3001
    // encodeURIComponent garante que cidades com espaços (ex: "São Paulo") funcionem
    const url = `http://localhost:3001/api/previsao/${encodeURIComponent(cidade)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Tenta pegar a mensagem de erro específica enviada pelo nosso backend
            const errorData = await response.json().catch(() => ({}));
            // Lança um erro que será pego pelo bloco catch no event listener
            throw new Error(errorData.error || `Erro ${response.status} ao buscar previsão.`);
        }
        
        // Se tudo deu certo, retorna os dados da previsão em formato JSON
        const data = await response.json();
        console.log("[Frontend] Dados da previsão recebidos do backend:", data);
        return data;

    } catch (error) {
        console.error("[Frontend] Erro ao chamar o backend:", error);
        // Re-lança o erro para que a função que chamou esta saiba que algo deu errado
        throw error;
    }
}


/**
 * Processa os dados brutos da API para agrupar por dia e extrair informações relevantes.
 * @param {Object} data O objeto JSON completo retornado pela API OpenWeatherMap /forecast.
 * @returns {Array<Object>} Um array de objetos, onde cada objeto representa um dia de previsão.
 */
function processarDadosForecast(data) {
    if (!data || !data.list || data.list.length === 0) {
        return [];
    }

    const previsoesPorDia = {};

    data.list.forEach(item => {
        const dia = item.dt_txt.split(' ')[0];
        if (!previsoesPorDia[dia]) {
            previsoesPorDia[dia] = {
                temps: [],
                descriptions: [],
                icons: [],
                weatherIds: [] // Adicionado para checar condições como chuva
            };
        }
        previsoesPorDia[dia].temps.push(item.main.temp);
        previsoesPorDia[dia].descriptions.push(item.weather[0].description);
        previsoesPorDia[dia].icons.push(item.weather[0].icon);
        previsoesPorDia[dia].weatherIds.push(item.weather[0].id); // Guarda o ID do clima
    });

    const resultadoFinal = [];
    for (const dia in previsoesPorDia) {
        const dadosDoDia = previsoesPorDia[dia];
        const indiceMeioDia = Math.floor(dadosDoDia.icons.length / 2);

        const resumoDia = {
            data: new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }),
            temp_min: Math.min(...dadosDoDia.temps),
            temp_max: Math.max(...dadosDoDia.temps),
            descricao: dadosDoDia.descriptions[indiceMeioDia],
            icone: dadosDoDia.icons[indiceMeioDia],
            weatherId: dadosDoDia.weatherIds[indiceMeioDia] // Adiciona o ID para lógica de destaque
        };
        resultadoFinal.push(resumoDia);
    }
    return resultadoFinal;
}

/**
 * Renderiza a previsão do tempo com base nos filtros e destaques atuais.
 * Função "mestre" que controla a exibição.
 */
function renderizarPrevisaoAtual() {
    if (fullForecastData.length === 0) return;

    // Lógica do Filtro de Dias (Desafio A)
    const filtroAtivo = document.querySelector('.filtro-dia-btn.active');
    const numDias = filtroAtivo ? parseInt(filtroAtivo.dataset.dias) : fullForecastData.length;
    const dadosFiltrados = fullForecastData.slice(0, numDias);
    
    // Chama a função de exibição com os dados já filtrados
    exibirPrevisaoDetalhada(dadosFiltrados, ultimaCidadePesquisada);
}


/**
 * Exibe a previsão na UI, aplicando classes de destaque conforme necessário.
 * @param {Array<Object>} previsaoDiaria O array de dados de previsão JÁ FILTRADO.
 * @param {string} nomeCidade O nome da cidade para exibir no título.
 */
function exibirPrevisaoDetalhada(previsaoDiaria, nomeCidade) {
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    resultadoDiv.innerHTML = '';

    const nomeCapitalizado = nomeCidade.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    
    const titulo = document.createElement('h3');
    titulo.innerHTML = `Previsão para ${nomeCapitalizado}`;
    resultadoDiv.appendChild(titulo);

    if(previsaoDiaria.length === 0) {
        resultadoDiv.innerHTML += '<p>Não há dados de previsão para mostrar.</p>';
        return;
    }

    const containerCards = document.createElement('div');
    containerCards.className = 'previsao-container';
    
    // Lógica de Destaques (Desafio B)
    const destacarChuva = document.getElementById(PREVISAO_DESTAQUES.CHUVA_ID).checked;
    const destacarFrio = document.getElementById(PREVISAO_DESTAQUES.FRIO_ID).checked;
    const destacarCalor = document.getElementById(PREVISAO_DESTAQUES.CALOR_ID).checked;

    previsaoDiaria.forEach(dia => {
        const cardDia = document.createElement('div');
        cardDia.className = 'previsao-dia-card';

        // Aplicar classes de destaque
        // IDs de 2xx, 3xx, 5xx são relacionados a chuva (Trovoadas, Garoa, Chuva)
        if (destacarChuva && dia.weatherId >= 200 && dia.weatherId < 600) {
            cardDia.classList.add('dia-chuvoso');
        }
        if (destacarFrio && dia.temp_min < PREVISAO_DESTAQUES.FRIO_LIMITE) {
            cardDia.classList.add('temp-baixa');
        }
        if (destacarCalor && dia.temp_max > PREVISAO_DESTAQUES.CALOR_LIMITE) {
            cardDia.classList.add('temp-alta');
        }
        
        const descricaoCapitalizada = dia.descricao.charAt(0).toUpperCase() + dia.descricao.slice(1);
        cardDia.innerHTML = `
            <h4>${dia.data}</h4>
            <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${dia.descricao}">
            <p class="previsao-descricao">${descricaoCapitalizada}</p>
            <p class="previsao-temp">
                <strong>Max:</strong> ${dia.temp_max.toFixed(1)}°C <br>
                <strong>Min:</strong> ${dia.temp_min.toFixed(1)}°C
            </p>
        `;
        containerCards.appendChild(cardDia);
    });

    resultadoDiv.appendChild(containerCards);
}

// Event listener PRINCIPAL para o botão de verificar clima
// <<< MUDANÇA AQUI: A lógica de chamada e tratamento de erro foi ajustada.
document.getElementById('verificar-clima-btn').addEventListener('click', async () => {
    const cidadeInput = document.getElementById('destino-viagem');
    const nomeCidade = cidadeInput.value.trim();
    const resultadoDiv = document.getElementById('previsao-tempo-resultado');
    const controlesDiv = document.getElementById('previsao-controles');

    if (!nomeCidade) {
        resultadoDiv.innerHTML = '<p style="color: orange;">Por favor, digite o nome da cidade.</p>';
        controlesDiv.classList.add('hidden');
        return;
    }

    resultadoDiv.innerHTML = `<p>Buscando previsão para ${nomeCidade}...</p>`;
    controlesDiv.classList.add('hidden'); // Esconde controles durante a busca

    try {
        // Chama nossa nova função que usa o backend
        const dadosCompletos = await buscarPrevisaoDetalhada(nomeCidade);
        
        // O formato dos dados não mudou, então a lógica de processamento continua a mesma
        fullForecastData = processarDadosForecast(dadosCompletos);
        ultimaCidadePesquisada = dadosCompletos.city.name;
        
        renderizarPrevisaoAtual(); // Chama a função que vai aplicar os filtros e exibir
        controlesDiv.classList.remove('hidden'); // Mostra os controles após sucesso

    } catch (error) {
        // O erro agora pode vir do nosso backend, e já vem formatado!
        console.error("Falha ao obter e exibir a previsão do tempo:", error);
        resultadoDiv.innerHTML = `<p style="color: red;">Falha ao buscar previsão: ${error.message}</p>`;
    }
});

// Event listeners para os CONTROLES INTERATIVOS
document.addEventListener('DOMContentLoaded', () => {
    // Para os filtros de dias
    const botoesFiltro = document.querySelectorAll('.filtro-dia-btn');
    botoesFiltro.forEach(btn => {
        btn.addEventListener('click', () => {
            botoesFiltro.forEach(b => b.classList.remove('active')); // Remove de todos
            btn.classList.add('active'); // Adiciona só no clicado
            renderizarPrevisaoAtual();
        });
    });

    // Para os checkboxes de destaque
    const checkboxesDestaque = document.querySelectorAll('#destaques-condicoes input[type="checkbox"]');
    checkboxesDestaque.forEach(check => {
        check.addEventListener('change', renderizarPrevisaoAtual);
    });
});

// ===== FINAL DAS MUDANÇAS PARA A ATIVIDADE B2.P1.A5 =====

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", function () {
    carregarGaragem();
    exibirInformacoesVeiculoSelecionado();
});