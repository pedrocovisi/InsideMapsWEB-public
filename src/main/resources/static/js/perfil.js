document.addEventListener("DOMContentLoaded", () => {
    // Requisito: Incluir SweetAlert2 no seu HTML
    // <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    let usuarioLogado; // Use 'let' para ser atualizado após a chamada da API

    /**
     * Função principal que carrega os dados do perfil da API.
     * Esta é a primeira coisa a ser executada.
     */
    async function carregarPerfil() {
        const usuarioSalvo = JSON.parse(localStorage.getItem("usuarioLogado"));
        if (!usuarioSalvo || !usuarioSalvo.id) {
            window.location.href = "login.html";
            return;
        }

        try {
            // 1. BUSCA OS DADOS MAIS RECENTES DO USUÁRIO NA API
            const response = await fetch(`http://localhost:8080/api/usuarios/buscar/Id/${usuarioSalvo.id}`);

            if (!response.ok) {
                if (response.status === 404) {
                    localStorage.removeItem("usuarioLogado");
                    window.location.href = "login.html";
                }
                throw new Error("Falha ao buscar dados do perfil.");
            }

            usuarioLogado = await response.json(); // Atualiza a variável global

            // 2. ATUALIZA O LOCALSTORAGE COM OS DADOS FRESCOS
            localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

            // 3. INICIALIZA A INTERFACE COM OS DADOS ATUALIZADOS
            inicializarInterface();

        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            Swal.fire('Erro!', 'Não foi possível carregar seus dados. Tente recarregar a página.', 'error');
        }
    }

    /**
     * Inicializa a interface e os event listeners DEPOIS que os dados foram carregados.
     */
    function inicializarInterface() {
        // --- REFERÊNCIAS AOS ELEMENTOS DO DOM ---
        const nomeInput = document.getElementById("nome");
        const emailInput = document.getElementById("email");
        const dataNascimentoInput = document.getElementById("data-nascimento");
        const editarBtn = document.getElementById("editarBtn");
        const sairBtn = document.getElementById("sairBtn");
        const alterarSenhaBtn = document.getElementById("alterarSenhaBtn");
        const premiumBadge = document.getElementById("premium-status-badge");
        const cancelarBtn = document.getElementById("cancelarPremiumBtn");
        const adminPanelBtn = document.getElementById("adminPanelBtn");

        let editando = false;

        // --- FUNÇÕES DE CONTROLE DA INTERFACE ---

        function preencherDados() {
            nomeInput.value = usuarioLogado.nome || "";
            emailInput.value = usuarioLogado.email || "";
            dataNascimentoInput.value = usuarioLogado.dataNascimento || "";
            atualizarStatusPremiumUI(usuarioLogado.premium);
            verificarPermissaoAdmin(usuarioLogado.administrador);
        }

        function setFormDisabled(disabled) {
            nomeInput.disabled = disabled;
            dataNascimentoInput.disabled = disabled;
        }

        function atualizarStatusPremiumUI(isPremium) {
            if (isPremium) {
                premiumBadge.textContent = 'Premium';
                premiumBadge.className = 'badge bg-success fs-6';
                cancelarBtn.style.display = 'inline-block';
            } else {
                premiumBadge.textContent = 'Gratuito';
                premiumBadge.className = 'badge bg-secondary fs-6';
                cancelarBtn.style.display = 'none';
            }
        }

        function verificarPermissaoAdmin(isAdmin) {
            if (isAdmin) {
                adminPanelBtn.style.display = 'block'; // Mostra o botão
            }
        }

        // --- FUNÇÕES DE LÓGICA E EVENTOS ---

        async function handleEditarSalvar() {
            if (!editando) {
                setFormDisabled(false);
                editarBtn.textContent = "Salvar Alterações";
                editando = true;
            } else {
                const dadosAtualizados = {
                    ...usuarioLogado,
                    nome: nomeInput.value.trim(),
                    dataNascimento: dataNascimentoInput.value
                };

                try {
                    const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioLogado.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosAtualizados)
                    });

                    if (response.ok) {
                        Swal.fire('Sucesso!', 'Seu perfil foi atualizado.', 'success');
                        usuarioLogado = await response.json(); // Pega a resposta da API para ter os dados mais atuais
                        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                        preencherDados(); // Repreenche o form com os dados retornados
                        setFormDisabled(true);
                        editarBtn.textContent = "Editar informações";
                        editando = false;
                    } else {
                        const erro = await response.text();
                        Swal.fire('Erro!', `Não foi possível atualizar o perfil: ${erro}`, 'error');
                    }
                } catch (error) {
                    Swal.fire('Erro de Conexão', 'Não foi possível se comunicar com o servidor.', 'error');
                }
            }
        }

        async function handleCancelarPremium() {
            const confirmacao = await Swal.fire({
                title: 'Tem certeza?',
                text: "Você perderá o acesso aos recursos Premium.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sim, cancelar!',
                cancelButtonText: 'Manter Assinatura'
            });

            if (confirmacao.isConfirmed) {
                const dadosParaCancelar = { ...usuarioLogado, premium: false };

                try {
                    const response = await fetch(`http://localhost:8080/api/usuarios/${usuarioLogado.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosParaCancelar)
                    });

                    if (response.ok) {
                        Swal.fire('Cancelado!', 'Sua assinatura foi cancelada.', 'success');
                        usuarioLogado.premium = false;
                        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
                        atualizarStatusPremiumUI(false);
                    } else {
                        const erro = await response.text();
                        Swal.fire('Erro!', `Não foi possível cancelar: ${erro}`, 'error');
                    }
                } catch (error) {
                    Swal.fire('Erro de Conexão', 'Não foi possível se comunicar com o servidor.', 'error');
                }
            }
        }

        // --- INICIALIZAÇÃO E EVENTOS ---
        preencherDados();

        editarBtn.addEventListener("click", handleEditarSalvar);
        cancelarBtn.addEventListener("click", handleCancelarPremium);

        sairBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioLogado");
            window.location.href = "login.html";
        });

        alterarSenhaBtn.addEventListener("click", () => {
            window.location.href = "alterar.html";
        });
    }

    // PONTO DE ENTRADA DO SCRIPT: Inicia o processo de carregamento.
    carregarPerfil();
});
