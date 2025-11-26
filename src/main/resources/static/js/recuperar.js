document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('recuperarSenhaForm');
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const email = document.getElementById('email').value.trim();
        const button = form.querySelector('button[type="submit"]');
        
        // Validação básica no frontend
        if (!email) {
            alert('Por favor, digite seu email.');
            return;
        }

        // Validação de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, digite um email válido.');
            return;
        }

        // Desabilita o botão para evitar múltiplos cliques
        button.disabled = true;
        const textoOriginal = button.textContent;
        button.textContent = 'Enviando...';

        try {
            const response = await fetch('http://localhost:8080/api/usuarios/recuperar-senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso - mostra mensagem e limpa o formulário
                alert('Instruções de recuperação enviadas para seu e-mail! Verifique sua caixa de entrada e spam.');
                document.getElementById('email').value = '';
            } else {
                // Erro do servidor (email não encontrado, conta desativada, etc.)
                alert(data.message || 'Erro ao processar solicitação.');
            }
        } catch (error) {
            // Erro de conexão ou outros erros
            console.error('Erro ao solicitar recuperação:', error);
            alert('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        } finally {
            // Reabilita o botão independente do resultado
            button.disabled = false;
            button.textContent = textoOriginal;
        }
    });
});
