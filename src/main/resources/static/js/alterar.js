document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 alterar.js carregado");

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    console.log("👤 Usuário logado:", usuarioLogado);

    const form = document.getElementById('alterarSenhaForm');
    console.log("📋 Formulário encontrado:", !!form);

    // Verificar se usuário está logado
    if (!usuarioLogado) {
        alert('Você precisa estar logado para alterar a senha.');
        window.location.href = 'login.html';
        return;
    }

    form.setAttribute('novalidate', '');

    function validarSenha(senha) {
        // Requisito 1: Pelo menos 6 caracteres
        if (senha.length < 6) {
            return { valido: false, mensagem: 'A senha deve ter no mínimo 6 caracteres.' };
        }
        // Requisito 2: Pelo menos 1 letra maiúscula
        if (!/[A-Z]/.test(senha)) {
            return { valido: false, mensagem: 'Deve conter pelo menos uma letra maiúscula.' };
        }
        // Requisito 3: Pelo menos 1 letra minúscula
        if (!/[a-z]/.test(senha)) {
            return { valido: false, mensagem: 'Deve conter pelo menos uma letra minúscula.' };
        }
        // Requisito 4: Pelo menos 1 número
        if (!/\d/.test(senha)) { // \d é um atalho para [0-9]
            return { valido: false, mensagem: 'Deve conter pelo menos um número.' };
        }
        // Requisito 5: Pelo menos 1 caractere especial
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(senha)) {
            return { valido: false, mensagem: 'Deve conter pelo menos um caractere especial (ex: !@#$%).' };
        }

        // Se todos os requisitos foram atendidos
        return { valido: true, mensagem: 'Senha válida' };
    }

    // Função para exibir erro
    function exibirErro(campo, mensagem) {
        const erroAnterior = campo.parentNode.querySelector('.erro-mensagem');
        if (erroAnterior) {
            erroAnterior.remove();
        }

        campo.classList.add('campo-erro');

        const divErro = document.createElement('div');
        divErro.className = 'erro-mensagem';
        divErro.textContent = mensagem;
        divErro.style.color = 'red';
        divErro.style.fontSize = '12px';
        divErro.style.marginTop = '2px';

        campo.parentNode.insertBefore(divErro, campo.nextSibling);
    }

    // Função para remover erro
    function removerErro(campo) {
        campo.classList.remove('campo-erro');
        campo.classList.remove('campo-valido');
        const erro = campo.parentNode.querySelector('.erro-mensagem');
        if (erro) {
            erro.remove();
        }
    }

    // Função para marcar campo como válido
    function marcarComoValido(campo) {
        campo.classList.remove('campo-erro');
        campo.classList.add('campo-valido');
        const erro = campo.parentNode.querySelector('.erro-mensagem');
        if (erro) {
            erro.remove();
        }
    }

    // Função para limpar todos os erros
    function limparErros() {
        const campos = form.querySelectorAll('input');
        campos.forEach(campo => removerErro(campo));
    }

    // Referências dos campos
    const campos = {
        senhaAtual: document.getElementById("senhaAtual"),
        novaSenha: document.getElementById("novaSenha"),
        confirmarSenha: document.getElementById("confirmarSenha")
    };

    // Botão voltar
    const voltarBtn = document.getElementById('voltarBtn');
    if (voltarBtn) {
        voltarBtn.addEventListener('click', () => {
            window.location.href = 'perfil.html';
        });
    }

    // Validações em tempo real (igual ao código anterior)
    // Validação da Senha Atual (Blur)
    campos.senhaAtual.addEventListener('blur', () => {
        if (!campos.senhaAtual.value) {
            exibirErro(campos.senhaAtual, 'Senha atual é obrigatória');
        } else {
            removerErro(campos.senhaAtual);
        }
    });

    // Validação da Nova Senha (Blur)
    campos.novaSenha.addEventListener('blur', () => {
        const validacao = validarSenha(campos.novaSenha.value);
        if (!validacao.valido) {
            exibirErro(campos.novaSenha, validacao.mensagem);
        } else {
            marcarComoValido(campos.novaSenha);
        }
    });

    function validarConfirmacaoSenha() {
        const novaSenha = campos.novaSenha.value;
        const confirmarSenha = campos.confirmarSenha.value;

        if (!confirmarSenha) {
            exibirErro(campos.confirmarSenha, 'Confirmação de senha é obrigatória');
        } else if (novaSenha !== confirmarSenha) {
            exibirErro(campos.confirmarSenha, 'As senhas não coincidem');
        } else {
            marcarComoValido(campos.confirmarSenha);
        }
    }

    campos.confirmarSenha.addEventListener('blur', validarConfirmacaoSenha);
    campos.confirmarSenha.addEventListener('input', validarConfirmacaoSenha);

    // Validação durante digitação
    campos.senhaAtual.addEventListener('input', () => {
        if (campos.senhaAtual.classList.contains('campo-erro')) {
            removerErro(campos.senhaAtual);
        }
    });

    campos.novaSenha.addEventListener('input', () => {
        if (campos.novaSenha.classList.contains('campo-erro')) {
            removerErro(campos.novaSenha);
        }
        if (campos.confirmarSenha.value) {
            if (campos.confirmarSenha.classList.contains('campo-erro')) {
                removerErro(campos.confirmarSenha);
            }
        }
    });

    campos.confirmarSenha.addEventListener('input', () => {
        if (campos.confirmarSenha.classList.contains('campo-erro')) {
            removerErro(campos.confirmarSenha);
        }

        const novaSenha = campos.novaSenha.value;
        const confirmarSenha = campos.confirmarSenha.value;

        if (confirmarSenha && novaSenha && confirmarSenha === novaSenha) {
            marcarComoValido(campos.confirmarSenha);
        }
    });

    // Submit do formulário
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        console.log("📤 Formulário enviado");

        limparErros();

        const senhaAtual = campos.senhaAtual.value;
        const novaSenha = campos.novaSenha.value;
        const confirmarSenha = campos.confirmarSenha.value;

        console.log("📝 Dados:", { senhaAtual: "***", novaSenha: "***", confirmarSenha: "***" });

        let temErro = false;

        // Validações
        if (!senhaAtual) {
            exibirErro(campos.senhaAtual, 'Senha atual é obrigatória');
            temErro = true;
        }

        if (!novaSenha) {
            exibirErro(campos.novaSenha, 'Nova senha é obrigatória');
            temErro = true;
        } else if (!validarSenha(novaSenha)) {
            if (novaSenha.length < 6) {
                exibirErro(campos.novaSenha, 'Nova senha deve ter pelo menos 6 caracteres');
            } else {
                exibirErro(campos.novaSenha, 'Nova senha deve conter pelo menos 1 número');
            }
            temErro = true;
        }

        if (!confirmarSenha) {
            exibirErro(campos.confirmarSenha, 'Confirmação de senha é obrigatória');
            temErro = true;
        } else if (novaSenha !== confirmarSenha) {
            exibirErro(campos.confirmarSenha, 'As senhas não coincidem');
            temErro = true;
        }

        if (temErro) {
            console.log("❌ Erro de validação");
            return;
        }

        // Desabilita o botão
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            const textoOriginal = submitBtn.textContent;
            submitBtn.textContent = 'Alterando...';
        }

        try {
            const userId = usuarioLogado.usuario?.id || usuarioLogado.id;
            console.log("🆔 User ID:", userId);

            const response = await fetch(`http://localhost:8080/api/usuarios/${userId}/alterar-senha`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    senhaAtual: senhaAtual,
                    novaSenha: novaSenha
                })
            });

            console.log("📡 Response status:", response.status);

            if (response.ok) {
                alert('Senha alterada com sucesso! Você será redirecionado para o perfil.');
                window.location.href = 'perfil.html';
            } else {
                const errorText = await response.text().catch(() => 'Erro desconhecido');
                console.log("❌ Erro:", errorText);

                if (response.status === 400) {
                    if (errorText.includes('Senha atual incorreta') || errorText.includes('senha atual')) {
                        exibirErro(campos.senhaAtual, 'Senha atual incorreta');
                    } else if (errorText.includes('Nova senha')) {
                        exibirErro(campos.novaSenha, errorText);
                    } else {
                        alert(`Erro: ${errorText}`);
                    }
                } else {
                    alert(`Erro ao alterar senha: ${errorText}`);
                }
            }
        } catch (error) {
            console.error('💥 Erro na requisição:', error);
            alert('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        } finally {
            // Reabilita o botão
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.textContent = 'Alterar Senha';
            }
        }
    });
});
