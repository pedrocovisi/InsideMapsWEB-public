document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM carregado, iniciando cadastro.js");

  const form = document.querySelector("form");
  if (!form) {
    console.error("❌ Formulário não encontrado!");
    return;
  }

  console.log("✅ Formulário encontrado");
  form.setAttribute('novalidate', '');

  // Função para validar email
  function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

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


  // Função para validar idade (mínimo 13 anos) - CORRIGIDA
  function validarIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear(); // ← CORRIGIDO: const para let
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--; // ← AGORA FUNCIONA: pode alterar porque é let
    }

    return idade >= 13;
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

  // Validação em tempo real
  const campos = {
    nome: document.getElementById("nome"),
    email: document.getElementById("email"),
    senha: document.getElementById("senha"),
    dataNascimento: document.getElementById("data-nascimento")
  };

  // Verificar se todos os elementos foram encontrados
  console.log("🔍 Elementos encontrados:", {
    nome: !!campos.nome,
    email: !!campos.email,
    senha: !!campos.senha,
    dataNascimento: !!campos.dataNascimento
  });

  // Verificação de segurança - parar se algum elemento não foi encontrado
  if (!campos.nome || !campos.email || !campos.senha || !campos.dataNascimento) {
    console.error("❌ Alguns elementos do formulário não foram encontrados!");
    console.error("Elementos faltando:", {
      nome: !campos.nome ? "FALTANDO" : "OK",
      email: !campos.email ? "FALTANDO" : "OK",
      senha: !campos.senha ? "FALTANDO" : "OK",
      dataNascimento: !campos.dataNascimento ? "FALTANDO" : "OK"
    });
    return;
  }

  console.log("✅ Todos os elementos encontrados, configurando validações");

  // Validação do nome em tempo real
  campos.nome.addEventListener('blur', () => {
    if (campos.nome.value.trim().length < 2) {
      exibirErro(campos.nome, 'Nome deve ter pelo menos 2 caracteres');
    } else {
      removerErro(campos.nome);
    }
  });

  // Validação do email em tempo real
  campos.email.addEventListener('blur', () => {
    if (!validarEmail(campos.email.value)) {
      exibirErro(campos.email, 'Email inválido');
    } else {
      removerErro(campos.email);
    }
  });

  // Validação da senha em tempo real
  campos.senha.addEventListener('blur', () => {
    const validacao = validarSenha(campos.senha.value);
    if (!validacao.valido) {
      exibirErro(campos.senha, validacao.mensagem);
    } else {
      removerErro(campos.senha);
    }
  });

  // Validação da data de nascimento em tempo real
  campos.dataNascimento.addEventListener('blur', () => {
    if (!campos.dataNascimento.value) {
      exibirErro(campos.dataNascimento, 'Data de nascimento é obrigatória');
    } else if (!validarIdade(campos.dataNascimento.value)) {
      exibirErro(campos.dataNascimento, 'Você deve ter pelo menos 13 anos');
    } else {
      removerErro(campos.dataNascimento);
    }
  });

  console.log("✅ Event listeners de validação configurados");

  // Event listener do formulário
  form.addEventListener("submit", async (event) => {
    console.log("🚀 Submit do formulário iniciado");
    event.preventDefault();

    // Limpa erros anteriores
    limparErros();
    console.log("✅ Erros anteriores limpos");

    const nome = campos.nome.value.trim();
    const email = campos.email.value.trim();
    const senha = campos.senha.value;
    const dataNascimento = campos.dataNascimento.value;

    console.log("📝 Dados capturados:", {
      nome: nome,
      email: email,
      senha: senha ? "***" : "VAZIO", // Não mostrar senha real no log
      dataNascimento: dataNascimento
    });

    let temErro = false;

    // Validações
    if (!nome || nome.length < 2) {
      console.log("❌ Erro: Nome inválido");
      exibirErro(campos.nome, 'Nome é obrigatório e deve ter pelo menos 2 caracteres');
      temErro = true;
    }

    if (!email || !validarEmail(email)) {
      console.log("❌ Erro: Email inválido");
      exibirErro(campos.email, 'Email válido é obrigatório');
      temErro = true;
    }

    const validacaoSenha = validarSenha(senha);
    if (!validacaoSenha.valido) {
      exibirErro(campos.senha, validacaoSenha.mensagem);
      temErro = true;
    }

    if (!dataNascimento) {
      console.log("❌ Erro: Data de nascimento não informada");
      exibirErro(campos.dataNascimento, 'Data de nascimento é obrigatória');
      temErro = true;
    } else if (!validarIdade(dataNascimento)) {
      console.log("❌ Erro: Idade menor que 13 anos");
      exibirErro(campos.dataNascimento, 'Você deve ter pelo menos 13 anos');
      temErro = true;
    }

    console.log("🔍 Resultado da validação - Tem erro:", temErro);

    // Se há erros, não envia o formulário
    if (temErro) {
      console.log("❌ Parando execução devido a erros de validação");
      return;
    }

    const usuario = {
      nome,
      email,
      senha,
      dataNascimento,
      administrador: 0,
      status: 1
    };

    console.log("📦 Objeto usuário criado:", {
      ...usuario,
      senha: "***" // Não mostrar senha real no log
    });

    // Desabilita o botão de submit durante o envio
    const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('btn-loading');
      const textoOriginal = submitBtn.textContent || submitBtn.value;
      submitBtn.textContent = 'Cadastrando...';
      submitBtn.value = 'Cadastrando...';
      console.log("🔒 Botão desabilitado, texto alterado para 'Cadastrando...'");
    }

    try {
      console.log("🌐 Iniciando requisição para API...");

      const response = await fetch("http://localhost:8080/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
      });

      console.log("📡 Resposta recebida - Status:", response.status);

      if (response.ok) {
        console.log("✅ Cadastro realizado com sucesso!");
        alert("Cadastro realizado com sucesso!");
        window.location.href = "login.html";
      } else {
        console.log("❌ Erro na resposta da API - Status:", response.status);

        let errorData;
        try {
          errorData = await response.json();
          console.log("📄 Dados do erro (JSON):", errorData);
        } catch (jsonError) {
          console.log("⚠️ Erro não é JSON, tentando como texto");
          errorData = await response.text();
          console.log("📄 Dados do erro (texto):", errorData);
        }

        // Se o erro for um objeto com campos específicos (do backend)
        if (typeof errorData === 'object' && errorData !== null) {
          console.log("🔍 Processando erros específicos por campo");

          // Limpa erros anteriores
          limparErros();

          // Exibe erros específicos para cada campo
          if (errorData.nome) {
            console.log("❌ Erro no campo nome:", errorData.nome);
            exibirErro(campos.nome, errorData.nome);
          }
          if (errorData.email) {
            console.log("❌ Erro no campo email:", errorData.email);
            exibirErro(campos.email, errorData.email);
          }
          if (errorData.senha) {
            console.log("❌ Erro no campo senha:", errorData.senha);
            exibirErro(campos.senha, errorData.senha);
          }
          if (errorData.dataNascimento) {
            console.log("❌ Erro no campo dataNascimento:", errorData.dataNascimento);
            exibirErro(campos.dataNascimento, errorData.dataNascimento);
          }

          // Se houver outros erros não específicos
          const outrosErros = Object.keys(errorData).filter(key =>
            !['nome', 'email', 'senha', 'dataNascimento'].includes(key)
          );

          if (outrosErros.length > 0) {
            console.log("⚠️ Outros erros encontrados:", outrosErros);
            alert(`Erro ao cadastrar: ${Object.values(errorData).join(', ')}`);
          }
        } else {
          // Erro genérico ou string
          console.log("⚠️ Erro genérico:", errorData);
          alert(`Erro ao cadastrar: ${errorData}`);
        }
      }
    } catch (error) {
      console.error("💥 Erro na requisição (catch):", error);
      alert("Erro de conexão com o servidor.");
    } finally {
      // Reabilita o botão
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
        const textoOriginal = submitBtn.getAttribute('data-texto-original') || 'Cadastrar';
        submitBtn.textContent = textoOriginal;
        submitBtn.value = textoOriginal;
        console.log("🔓 Botão reabilitado");
      }
    }
  });

  console.log("✅ Event listener do submit configurado");
  console.log("🎯 Cadastro.js totalmente carregado e configurado");
});
