document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form.setAttribute('novalidate', '');

  // Função para validar email
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
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
    email: document.getElementById("email"),
    senha: document.getElementById("senha")
  };

  // Validação do email em tempo real
  campos.email.addEventListener('blur', () => {
    const email = campos.email.value.trim();
    if (!email) {
      exibirErro(campos.email, 'Email é obrigatório');
    } else if (!validarEmail(email)) {
      exibirErro(campos.email, 'Email inválido');
    } else {
      removerErro(campos.email);
    }
  });

  // Validação da senha em tempo real
  campos.senha.addEventListener('blur', () => {
    const senha = campos.senha.value;
    if (!senha) {
      exibirErro(campos.senha, 'Senha é obrigatória');
    } else if (senha.length < 6) {
      exibirErro(campos.senha, 'Senha deve ter pelo menos 6 caracteres');
    } else {
      removerErro(campos.senha);
    }
  });

  // Remove erros quando o usuário começa a digitar
  campos.email.addEventListener('input', () => {
    if (campos.email.classList.contains('campo-erro')) {
      removerErro(campos.email);
    }
  });

  campos.senha.addEventListener('input', () => {
    if (campos.senha.classList.contains('campo-erro')) {
      removerErro(campos.senha);
    }
  });

  form.addEventListener("submit", async (event) => {
    if (!localStorage.getItem("paginaDestino")) {
      localStorage.removeItem("paginaDestino");
    }
    event.preventDefault();

    // Limpa erros anteriores
    limparErros();

    const email = campos.email.value.trim();
    const senha = campos.senha.value;

    let temErro = false;

    // Validações
    if (!email) {
      exibirErro(campos.email, 'Email é obrigatório');
      temErro = true;
    } else if (!validarEmail(email)) {
      exibirErro(campos.email, 'Email inválido');
      temErro = true;
    }

    if (!senha) {
      exibirErro(campos.senha, 'Senha é obrigatória');
      temErro = true;
    } else if (senha.length < 6) {
      exibirErro(campos.senha, 'Senha deve ter pelo menos 6 caracteres');
      temErro = true;
    }

    // Se há erros, não envia o formulário
    if (temErro) {
      return;
    }

    // Desabilita o botão de submit durante o envio
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
      const textoOriginal = submitBtn.textContent || submitBtn.value;
      submitBtn.textContent = 'Entrando...';
      submitBtn.value = 'Entrando...';
    }

    try {
      const response = await fetch('http://127.0.0.1:8080/api/usuarios/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      if (response.ok) {
        const data = await response.json();

        // ================= INÍCIO DA ADIÇÃO =================
        // Tenta iniciar a sessão PHP em segundo plano, sem bloquear o fluxo principal.
        // Usamos um try/catch aqui para que, se o script PHP falhar, a experiência
        // do usuário no lado do JavaScript não seja interrompida.
        try {
          await fetch('http://127.0.0.1/seu-projeto/iniciar_sessao_php.php', { // Use a URL completa do seu script PHP
            method: 'POST',
            // ---- INÍCIO DA ADIÇÃO ----
            credentials: 'include', // ESSA É A LINHA MAIS IMPORTANTE
            // ---- FIM DA ADIÇÃO ----
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
        } catch (phpError) {
          console.error('Falha ao tentar iniciar a sessão PHP:', phpError);
          // Este erro não precisa ser mostrado ao usuário, pois o login principal já funcionou.
          // É apenas um log para o desenvolvedor.
        }
        // ================== FIM DA ADIÇÃO ===================

        // Armazena os dados do usuário logado (código original mantido)
        localStorage.setItem("usuarioLogado", JSON.stringify(data));

        alert("Login realizado com sucesso!");

        // Verifica se existe página de destino (código original mantido)
        const destino = localStorage.getItem("paginaDestino");
        if (destino) {
          localStorage.removeItem("paginaDestino"); // Limpa para não reutilizar
          window.location.href = destino;
        } else {
          window.location.href = "index.html";
        }
      } else {
        // Trata diferentes tipos de erro (código original mantido)
        const errorText = await response.text().catch(() => 'Erro desconhecido');

        if (response.status === 401) {
          // Erro de credenciais inválidas ou usuário inativo
          if (errorText.includes('inativo')) {
            alert('Sua conta está inativa. Entre em contato com o suporte.');
          } else {
            // Exibe erro nos campos específicos para credenciais inválidas
            exibirErro(campos.email, 'Email ou senha inválidos');
            exibirErro(campos.senha, 'Email ou senha inválidos');
          }
        } else if (response.status === 400) {
          // Erro de validação - pode ser campo específico
          if (errorText.includes('Email')) {
            exibirErro(campos.email, errorText);
          } else if (errorText.includes('Senha')) {
            exibirErro(campos.senha, errorText);
          } else {
            alert(`Erro: ${errorText}`);
          }
        } else {
          // Outros erros
          alert(`Erro ao fazer login: ${errorText}`);
        }
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão com o servidor. Verifique sua conexão e tente novamente.");
    } finally {
      // Reabilita o botão (código original mantido)
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        submitBtn.textContent = textoOriginal;
        submitBtn.value = textoOriginal;
      }
    }
  });
});