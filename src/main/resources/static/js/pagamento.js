document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM carregado, iniciando pagamento.js");

  const usuarioLogadoJSON = localStorage.getItem("usuarioLogado");
  if (!usuarioLogadoJSON) {
    alert("Você precisa estar logado para realizar um pagamento.");
    // Salva a página atual para redirecionar de volta após o login
    localStorage.setItem("paginaDestino", window.location.href);
    window.location.href = "login.html";
    return; // Para a execução do script se não houver usuário
  }
  const usuarioLogado = JSON.parse(usuarioLogadoJSON);

  async function verificarStatusPremium() {
    try {
        const response = await fetch(`http://localhost:8080/api/usuarios/buscar/Id/${usuarioLogado.id}`);

        if (!response.ok) {
            console.error("Não foi possível verificar o status do usuário. Status:", response.status);
            // Permite continuar para não bloquear o usuário por um erro de API,
            // a verificação final no backend ainda impedirá o pagamento.
            return false;
        }

        const usuarioAtualizado = await response.json();

        // Boa prática: atualiza o localStorage com os dados mais recentes do usuário.
        localStorage.setItem("usuarioLogado", JSON.stringify(usuarioAtualizado));

        if (usuarioAtualizado.premium) {
            alert("Você já é um usuário Premium. Você será redirecionado.");
            window.location.href = "index.html"; // Redireciona para a página inicial ou um dashboard.
            return true; // Indica que o usuário é premium.
        }

    } catch (error) {
        console.error("Erro de rede ao verificar o status premium:", error);
    }
    return false; // Usuário não é premium ou ocorreu um erro de rede.
}

// Executa a verificação e só continua se o usuário não for premium.
verificarStatusPremium().then(isPremium => {
    // Se isPremium for true, a página já foi redirecionada e nada mais precisa ser feito.
    if (isPremium) {
        return;
    }

    // Se o usuário NÃO for premium, o resto do script da página é executado.
    inicializarFormulario();
});


  const form = document.querySelector("form");
  if (!form) {
    console.error("❌ Formulário não encontrado!");
    return;
  }
  form.setAttribute("novalidate", "");



  const campos = {
    nomeCompleto: form.querySelector('input[placeholder="Ex: João da Silva"]'),
    // email: form.querySelector('input[type="email"]'),
    endereco: form.querySelector('input[placeholder="Endereço"]'),
    cidade: form.querySelector('input[placeholder="Cidade"]'),
    estado: form.querySelector('input[placeholder="Estado"]'),
    cep: form.querySelector('input[placeholder="00000-000"]'),
    nomeCartao: form.querySelector('input[placeholder="Como impresso no cartão"]'),
    numeroCartao: form.querySelector('input[placeholder="0000 0000 0000 0000"]'),
    mesValidade: form.querySelector('input[placeholder="MM"]'),
    anoValidade: form.querySelector('input[placeholder="AA"]'),
    cvv: form.querySelector('input[placeholder="\\*\\*\\*"]') // correto para arquivo .js
  };

  // ====== MÁSCARAS IMask (opcional) ======
  let cepMask, numeroCartaoMask, mesMask, anoMask, cvvMask;

  if (campos.cep) {
    cepMask = IMask(campos.cep, { mask: "00000-000" });
  }

  if (campos.numeroCartao) {
    numeroCartaoMask = IMask(campos.numeroCartao, { mask: "0000 0000 0000 0000" });
  }

  if (campos.mesValidade) {
    mesMask = IMask(campos.mesValidade, {
      mask: IMask.MaskedRange,
      from: 1,
      to: 12,
      maxLength: 2,
      autofix: true,
      pad: true
    });
  }

  if (campos.anoValidade) {
    anoMask = IMask(campos.anoValidade, { mask: "00" });
  }

  if (campos.cvv) {
    cvvMask = IMask(campos.cvv, { mask: [{ mask: "000" }, { mask: "0000" }] });
  }
  // ====== FIM MÁSCARAS ======

  // Utilitário: valida um campo e mostra/limpa erro
  function exibirErro(campo, mensagem) {
    removerErro(campo);
    const divErro = document.createElement("div");
    divErro.className = "erro-mensagem";
    divErro.style.color = "red";
    divErro.style.fontSize = "12px";
    divErro.textContent = mensagem;
    campo.classList.add("campo-erro");
    campo.parentNode.appendChild(divErro);
  }

  function removerErro(campo) {
    campo.classList.remove("campo-erro");
    const erro = campo.parentNode.querySelector(".erro-mensagem");
    if (erro) erro.remove();
  }

  function validarCampo(campo, condicao, mensagem) {
    if (condicao) {
      removerErro(campo);
      return true;
    } else {
      exibirErro(campo, mensagem);
      return false;
    }
  }

  // Validadores
  // function validarEmail(email) {
  //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // }
  function validarNumeroCartao(num) {
    return /^\d{16}$/.test(num.replace(/\s/g, ""));
  }
  function validarCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }
  function validarCEP(cep) {
    return /^\d{5}-\d{3}$/.test(cep);
  }

  // NOME COMPLETO
  if (campos.nomeCompleto) {
    campos.nomeCompleto.addEventListener('blur', () => {
      validarCampo(campos.nomeCompleto, campos.nomeCompleto.value.trim().length >= 3, 'Informe seu nome completo');
    });
    campos.nomeCompleto.addEventListener('input', () => {
      if (campos.nomeCompleto.classList.contains('campo-erro')) removerErro(campos.nomeCompleto);
      if (campos.nomeCompleto.value.trim().length >= 3) removerErro(campos.nomeCompleto);
    });
  }

  // EMAIL
  // if (campos.email) {
  //   campos.email.addEventListener('blur', () => {
  //     const email = campos.email.value.trim();
  //     validarCampo(campos.email, email && validarEmail(email), 'E-mail inválido');
  //   });
  //   campos.email.addEventListener('input', () => {
  //     if (campos.email.classList.contains('campo-erro')) removerErro(campos.email);
  //   });
  // }

  // ENDEREÇO
  if (campos.endereco) {
    campos.endereco.addEventListener('blur', () => {
      validarCampo(campos.endereco, campos.endereco.value.trim().length >= 5, 'Endereço inválido');
    });
    campos.endereco.addEventListener('input', () => {
      if (campos.endereco.classList.contains('campo-erro')) removerErro(campos.endereco);
      if (campos.endereco.value.trim().length >= 5) removerErro(campos.endereco);
    });
  }

  // CIDADE
  if (campos.cidade) {
    campos.cidade.addEventListener('blur', () => {
      validarCampo(campos.cidade, campos.cidade.value.trim().length >= 2, 'Cidade inválida');
    });
    campos.cidade.addEventListener('input', () => {
      if (campos.cidade.classList.contains('campo-erro')) removerErro(campos.cidade);
      if (campos.cidade.value.trim().length >= 2) removerErro(campos.cidade);
    });
  }

  // ESTADO
  if (campos.estado) {
    campos.estado.addEventListener('blur', () => {
      validarCampo(campos.estado, campos.estado.value.trim().length >= 2, 'Estado inválido');
    });
    campos.estado.addEventListener('input', () => {
      if (campos.estado.classList.contains('campo-erro')) removerErro(campos.estado);
      if (campos.estado.value.trim().length >= 2) removerErro(campos.estado);
    });
  }

  // CEP (tempo real)
  if (campos.cep) {
    campos.cep.addEventListener('blur', () => {
      validarCampo(campos.cep, validarCEP(campos.cep.value), 'CEP inválido (formato 00000-000)');
    });
    campos.cep.addEventListener('input', () => {
      if (campos.cep.classList.contains('campo-erro')) removerErro(campos.cep);
      const digits = campos.cep.value.replace(/\D/g, '');
      if (digits.length === 8 && validarCEP(campos.cep.value)) removerErro(campos.cep);
    });
  }

  // NOME NO CARTÃO
  if (campos.nomeCartao) {
    campos.nomeCartao.addEventListener('blur', () => {
      validarCampo(campos.nomeCartao, campos.nomeCartao.value.trim().length >= 3, 'Nome no cartão inválido');
    });
    campos.nomeCartao.addEventListener('input', () => {
      if (campos.nomeCartao.classList.contains('campo-erro')) removerErro(campos.nomeCartao);
      if (campos.nomeCartao.value.trim().length >= 3) removerErro(campos.nomeCartao);
    });
  }

  // NÚMERO DO CARTÃO
  if (campos.numeroCartao) {
    campos.numeroCartao.addEventListener('blur', () => {
      validarCampo(campos.numeroCartao, validarNumeroCartao(campos.numeroCartao.value), 'Número do cartão inválido');
    });
    campos.numeroCartao.addEventListener('input', () => {
      if (campos.numeroCartao.classList.contains('campo-erro')) removerErro(campos.numeroCartao);
      const digits = campos.numeroCartao.value.replace(/\D/g, '');
      if (digits.length === 16 && validarNumeroCartao(campos.numeroCartao.value)) removerErro(campos.numeroCartao);
    });
  }

  // MÊS (MM)
  if (campos.mesValidade) {
    const validaMes = v => /^(0[1-9]|1[0-2])$/.test(v);
    campos.mesValidade.addEventListener('blur', () => {
      validarCampo(campos.mesValidade, validaMes(campos.mesValidade.value), 'Mês inválido');
    });
    campos.mesValidade.addEventListener('input', () => {
      if (campos.mesValidade.classList.contains('campo-erro')) removerErro(campos.mesValidade);
      if (campos.mesValidade.value.length === 2 && validaMes(campos.mesValidade.value)) removerErro(campos.mesValidade);
    });
  }

  // ANO (AA)
  if (campos.anoValidade) {
    const validaAno = v => /^\d{2}$/.test(v);
    campos.anoValidade.addEventListener('blur', () => {
      validarCampo(campos.anoValidade, validaAno(campos.anoValidade.value), 'Ano inválido');
    });
    campos.anoValidade.addEventListener('input', () => {
      if (campos.anoValidade.classList.contains('campo-erro')) removerErro(campos.anoValidade);
      if (validaAno(campos.anoValidade.value)) removerErro(campos.anoValidade);
    });
  }

  // CVV
  if (campos.cvv) {
    campos.cvv.addEventListener('blur', () => {
      validarCampo(campos.cvv, validarCVV(campos.cvv.value), 'CVV inválido');
    });
    campos.cvv.addEventListener('input', () => {
      if (campos.cvv.classList.contains('campo-erro')) removerErro(campos.cvv);
      const v = campos.cvv.value.replace(/\D/g, '');
      if (v.length >= 3 && v.length <= 4 && validarCVV(v)) removerErro(campos.cvv);
    });
  }

  // ViaCEP (um único bloco, sem duplicações)
  if (campos.cep) {
    const consultarViaCEP = async () => {
      const digits = campos.cep.value.replace(/\D/g, '');
      if (digits.length !== 8) return;
      try {
        const resp = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await resp.json();
        if (!data.erro) {
          campos.endereco.value = [data.logradouro || '', data.bairro || ''].filter(Boolean).join(', ');
          campos.cidade.value = data.localidade || '';
          campos.estado.value = data.uf || '';
        }
      } catch (e) {
        console.warn('Falha ViaCEP:', e);
      }
    };

    // Dispara quando completar 8 dígitos válidos
    campos.cep.addEventListener('input', () => {
      const digits = campos.cep.value.replace(/\D/g, '');
      if (digits.length === 8 && validarCEP(campos.cep.value)) {
        removerErro(campos.cep);
        consultarViaCEP();
      }
    });

    // E no blur
    campos.cep.addEventListener('blur', () => {
      if (!validarCEP(campos.cep.value)) {
        exibirErro(campos.cep, 'CEP inválido (formato 00000-000)');
      } else {
        removerErro(campos.cep);
        consultarViaCEP();
      }
    });
  }

  // Submit: checagem final
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    let temErro = false;

    if (campos.nomeCompleto.value.trim().length < 3) {
      exibirErro(campos.nomeCompleto, "Informe seu nome completo");
      temErro = true;
    } else removerErro(campos.nomeCompleto);

    // if (!validarEmail(campos.email.value)) {
    //   exibirErro(campos.email, "E-mail inválido");
    //   temErro = true;
    // } else removerErro(campos.email);

    if (campos.endereco.value.trim().length < 5) {
      exibirErro(campos.endereco, "Endereço inválido");
      temErro = true;
    } else removerErro(campos.endereco);

    if (campos.cidade.value.trim().length < 2) {
      exibirErro(campos.cidade, "Cidade inválida");
      temErro = true;
    } else removerErro(campos.cidade);

    if (campos.estado.value.trim().length < 2) {
      exibirErro(campos.estado, "Estado inválido");
      temErro = true;
    } else removerErro(campos.estado);

    if (!validarCEP(campos.cep.value)) {
      exibirErro(campos.cep, "CEP inválido (formato 00000-000)");
      temErro = true;
    } else removerErro(campos.cep);

    if (campos.nomeCartao.value.trim().length < 3) {
      exibirErro(campos.nomeCartao, "Nome no cartão inválido");
      temErro = true;
    } else removerErro(campos.nomeCartao);

    if (!validarNumeroCartao(campos.numeroCartao.value)) {
      exibirErro(campos.numeroCartao, "Número do cartão inválido");
      temErro = true;
    } else removerErro(campos.numeroCartao);

    if (!/^(0[1-9]|1[0-2])$/.test(campos.mesValidade.value)) {
      exibirErro(campos.mesValidade, "Mês inválido");
      temErro = true;
    } else removerErro(campos.mesValidade);

    if (!/^\d{2}$/.test(campos.anoValidade.value)) {
      exibirErro(campos.anoValidade, "Ano inválido");
      temErro = true;
    } else removerErro(campos.anoValidade);

    if (!validarCVV(campos.cvv.value)) {
      exibirErro(campos.cvv, "CVV inválido");
      temErro = true;
    } else removerErro(campos.cvv);

    if (temErro) {
      console.log("❌ Erros encontrados, abortando envio");
      return;
    }

    const dadosPagamento = {
      usuario: { id: usuarioLogado.id },
      nomeCompleto: campos.nomeCompleto.value.trim(),
      // email: campos.email.value.trim(),
      endereco: campos.endereco.value.trim(),
      cidade: campos.cidade.value.trim(),
      estado: campos.estado.value.trim(),
      cep: campos.cep.value.trim(),
      nomeCartao: campos.nomeCartao.value.trim(),
      numeroCartao: campos.numeroCartao.value.replace(/\s/g, ""),
      mesValidade: campos.mesValidade.value.trim(),
      anoValidade: campos.anoValidade.value.trim(),
      cvv: campos.cvv.value.trim()
    };

    try {
      const resp = await fetch("http://localhost:8080/api/pagamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosPagamento)
      });

      if (resp.ok) {
        alert("Pagamento processado com sucesso!");
        window.location.href = "confirmacao.html";
      } else {
        const erro = await resp.text();
        alert(`Erro ao processar pagamento: ${erro}`);
      }
    } catch (e) {
      console.error("Erro de conexão:", e);
      alert("Não foi possível conectar ao servidor.");
    }
  });
});
