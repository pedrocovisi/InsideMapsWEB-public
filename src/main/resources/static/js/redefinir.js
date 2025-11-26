document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('redefinirSenhaForm');
    form.setAttribute('novalidate', '');

    /**
     * Valida uma senha com base em um conjunto de requisitos de complexidade.
     * @param {string} senha - A senha a ser validada.
     * @returns {{valido: boolean, mensagem: string}} Um objeto com o status e a mensagem de erro.
     */
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


    // Função para verificar se as senhas coincidem
    function senhasCoincidentes(senha1, senha2) {
        return senha1 === senha2 && senha1.length > 0;
    }

    // Função para exibir erro
    function exibirErro(campo, mensagem) {
        // Remove erro anterior se existir
        const erroAnterior = campo.parentNode.querySelector('.erro-mensagem');
        if (erroAnterior) {
            erroAnterior.remove();
        }

        // Adiciona classe de erro ao campo
        campo.classList.add('campo-erro');

        // Cria elemento de erro
        const divErro = document.createElement('div');
        divErro.className = 'erro-mensagem';
        divErro.textContent = mensagem;
        divErro.style.color = 'red';
        divErro.style.fontSize = '12px';
        divErro.style.marginTop = '2px';

        // Insere o erro após o campo
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
        novaSenha: document.getElementById("novaSenha"),
        confirmarSenha: document.getElementById("confirmarSenha")
    };

    // ALTERADO: Validação da nova senha em tempo real
    campos.novaSenha.addEventListener('blur', () => {
        const validacao = validarSenha(campos.novaSenha.value);
        if (!validacao.valido) {
            exibirErro(campos.novaSenha, validacao.mensagem);
        } else {
            marcarComoValido(campos.novaSenha);
        }
    });


    // Função para validar confirmação de senha
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

    // Validação da confirmação de senha em tempo real (blur)
    campos.confirmarSenha.addEventListener('blur', validarConfirmacaoSenha);

    // Validação em tempo real durante digitação (input)
    campos.novaSenha.addEventListener('input', () => {
        // Remove erro se estava com erro
        if (campos.novaSenha.classList.contains('campo-erro')) {
            removerErro(campos.novaSenha);
        }

        // Se confirmação já foi preenchida, revalida
        if (campos.confirmarSenha.value) {
            if (campos.confirmarSenha.classList.contains('campo-erro')) {
                removerErro(campos.confirmarSenha);
            }
        }
    });

    campos.confirmarSenha.addEventListener('input', () => {
        // Remove erro se estava com erro
        if (campos.confirmarSenha.classList.contains('campo-erro')) {
            removerErro(campos.confirmarSenha);
        }

        // Validação em tempo real para senhas coincidentes
        const novaSenha = campos.novaSenha.value;
        const confirmarSenha = campos.confirmarSenha.value;

        if (confirmarSenha && novaSenha && confirmarSenha === novaSenha) {
            marcarComoValido(campos.confirmarSenha);
        }
    });

    // Captura o token da URL uma vez
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Verifica se o token existe na URL
    if (!token) {
        alert('Token de recuperação não encontrado. Solicite uma nova recuperação de senha.');
        window.location.href = 'recuperar.html';
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        limparErros();

        const novaSenha = campos.novaSenha.value;
        const confirmarSenha = campos.confirmarSenha.value;
        let temErro = false;

        // ALTERADO: Validação completa da nova senha no submit
        const validacaoSenha = validarSenha(novaSenha);
        if (!validacaoSenha.valido) {
            exibirErro(campos.novaSenha, validacaoSenha.mensagem);
            temErro = true;
        }

        // Validação da confirmação de senha (sem alterações)
        if (!confirmarSenha) {
            exibirErro(campos.confirmarSenha, 'Confirmação de senha é obrigatória');
            temErro = true;
        } else if (novaSenha !== confirmarSenha) {
            exibirErro(campos.confirmarSenha, 'As senhas não coincidem');
            temErro = true;
        }

        if (temErro) return;

        // Desabilita o botão de submit durante o envio
        const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.add('btn-loading');
            const textoOriginal = submitBtn.textContent || submitBtn.value;
            submitBtn.textContent = 'Redefinindo...';
            submitBtn.value = 'Redefinindo...';
        }

        try {
            const response = await fetch('http://localhost:8080/api/usuarios/redefinir-senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token: token,
                    novaSenha: novaSenha
                })
            });

            if (response.ok) {
                // Sucesso - redireciona para o login
                alert('Senha redefinida com sucesso! Você será redirecionado para o login.');
                window.location.href = 'login.html';
            } else {
                // Trata diferentes tipos de erro
                const errorText = await response.text().catch(() => 'Erro desconhecido');

                if (response.status === 400) {
                    if (errorText.includes('Token')) {
                        alert('Token inválido ou expirado. Você será redirecionado para solicitar uma nova recuperação.');
                        setTimeout(() => {
                            window.location.href = 'recuperar.html';
                        }, 2000);
                    } else if (errorText.includes('senha')) {
                        exibirErro(campos.novaSenha, errorText);
                    } else {
                        alert(`Erro: ${errorText}`);
                    }
                } else {
                    alert(`Erro ao redefinir senha: ${errorText}`);
                }
            }
        } catch (error) {
            console.error('Erro ao redefinir a senha:', error);
            alert('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        } finally {
            // Reabilita o botão
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
                submitBtn.textContent = textoOriginal;
                submitBtn.value = textoOriginal;
            }
        }
    });

});