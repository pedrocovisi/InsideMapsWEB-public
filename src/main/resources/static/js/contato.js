document.addEventListener("DOMContentLoaded", () => {
    // --- FUNÇÃO PARA ROLAR E SELECIONAR (NOVO) ---
    function scrollToFormAndSelect() {
        const formSection = document.getElementById('contact-form-section');
        const tipoContatoSelect = document.getElementById('tipoContato');

        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (tipoContatoSelect) {
                // Preenche o campo e dispara o evento de 'change' para validação
                tipoContatoSelect.value = 'estabelecimento';
                tipoContatoSelect.dispatchEvent(new Event('change'));

                // Animação de destaque
                tipoContatoSelect.style.transition = 'all 0.3s ease';
                tipoContatoSelect.style.transform = 'scale(1.03)';
                tipoContatoSelect.style.boxShadow = '0 0 15px rgba(31, 177, 131, 0.5)';
                setTimeout(() => {
                    tipoContatoSelect.style.transform = 'scale(1)';
                    tipoContatoSelect.style.boxShadow = '';
                }, 1500);
            }
        }
    }

    // Adiciona o listener ao botão de parceria (NOVO)
    const btnParceria = document.getElementById('btnQueroParceria');
    if (btnParceria) {
        btnParceria.addEventListener('click', scrollToFormAndSelect);
    }
    // --- FIM DA NOVA SEÇÃO ---


    const form = document.getElementById("contatoForm");
    if (!form) return; // Sai se o formulário não existir

    form.setAttribute('novalidate', '');

    // Funções de validação (sem alteração)
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function exibirErro(campo, mensagem) {
        const erroAnterior = campo.parentNode.querySelector('.erro-mensagem');
        if (erroAnterior) erroAnterior.remove();
        campo.classList.add('campo-erro');
        const divErro = document.createElement('div');
        divErro.className = 'erro-mensagem';
        divErro.textContent = mensagem;
        divErro.style.color = 'red';
        divErro.style.fontSize = '12px';
        divErro.style.marginTop = '2px';
        campo.parentNode.insertBefore(divErro, campo.nextSibling);
    }

    function removerErro(campo) {
        campo.classList.remove('campo-erro');
        const erro = campo.parentNode.querySelector('.erro-mensagem');
        if (erro) erro.remove();
    }

    // Referências dos campos (ATUALIZADO)
    const campos = {
        tipoContato: document.getElementById("tipoContato"), // NOVO
        nome: document.getElementById("name"),
        email: document.getElementById("email"),
        assunto: document.getElementById("subject"),
        mensagem: document.getElementById("message")
    };

    // Validações em tempo real
    campos.tipoContato.addEventListener('change', () => { // NOVO
        if (!campos.tipoContato.value) {
            exibirErro(campos.tipoContato, 'Por favor, selecione o motivo do contato.');
        } else {
            removerErro(campos.tipoContato);
        }
    });

    campos.nome.addEventListener('blur', () => {
        if (campos.nome.value.trim().length < 2) {
            exibirErro(campos.nome, 'Nome deve ter pelo menos 2 caracteres');
        } else {
            removerErro(campos.nome);
        }
    });

    campos.email.addEventListener('blur', () => {
        if (!validarEmail(campos.email.value)) {
            exibirErro(campos.email, 'Email inválido');
        } else {
            removerErro(campos.email);
        }
    });

    campos.assunto.addEventListener('blur', () => {
        if (campos.assunto.value.trim().length < 3) {
            exibirErro(campos.assunto, 'Assunto deve ter pelo menos 3 caracteres');
        } else {
            removerErro(campos.assunto);
        }
    });

    campos.mensagem.addEventListener('blur', () => {
        const mensagem = campos.mensagem.value.trim();
        if (mensagem.length < 10) {
            exibirErro(campos.mensagem, 'Mensagem deve ter pelo menos 10 caracteres');
        } else if (mensagem.length >= 5000) {
            exibirErro(campos.mensagem, 'Mensagem deve ter no máximo 5.000 caracteres');
        } else {
            removerErro(campos.mensagem);
        }
    });

    // Submit do formulário (ATUALIZADO)
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        let temErro = false;
        
        // Validação final de todos os campos
        if (!campos.tipoContato.value) { // NOVO
            exibirErro(campos.tipoContato, 'Por favor, selecione o motivo do contato.');
            temErro = true;
        }
        if (campos.nome.value.trim().length < 2) {
            exibirErro(campos.nome, 'Nome é obrigatório');
            temErro = true;
        }
        if (!validarEmail(campos.email.value)) {
            exibirErro(campos.email, 'Email inválido é obrigatório');
            temErro = true;
        }
        if (campos.assunto.value.trim().length < 3) {
            exibirErro(campos.assunto, 'Assunto é obrigatório');
            temErro = true;
        }
        if (campos.mensagem.value.trim().length < 10) {
            exibirErro(campos.mensagem, 'Mensagem é obrigatória');
            temErro = true;
        }
        if (campos.mensagem.value.trim().length > 5000) {
            exibirErro(campos.mensagem, 'Mensagem muito longa');
            temErro = true;
        }

        if (temErro) return;

        // Desabilitar botão
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        const textoOriginal = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';

        try {
            const response = await fetch('http://localhost:8080/api/contatos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipoContato: campos.tipoContato.value, // NOVO
                    nome: campos.nome.value.trim(),
                    email: campos.email.value.trim(),
                    assunto: campos.assunto.value.trim(),
                    mensagem: campos.mensagem.value.trim()
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Mensagem enviada com sucesso! Protocolo: #${data.protocolo}`);
                form.reset();
                Object.values(campos).forEach(removerErro);
            } else {
                alert(data.message || 'Erro ao enviar mensagem');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro de conexão com o servidor');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = textoOriginal;
        }
    });
});
