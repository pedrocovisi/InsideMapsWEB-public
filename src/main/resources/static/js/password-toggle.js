// Função para criar botão de toggle de senha
function createPasswordToggle(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.warn(`Campo de senha com ID '${inputId}' não encontrado`);
        return;
    }

    // Adicionar classe para padding
    input.classList.add('password-input');

    // Criar container se não existir
    let container = input.parentElement;
    if (!container.classList.contains('password-container')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'password-container';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        container = wrapper;
    }

    // Criar botão de toggle
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'password-toggle';
    toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
    toggleButton.setAttribute('aria-label', 'Mostrar senha');

    // Adicionar evento de clique
    toggleButton.addEventListener('click', function() {
        if (input.type === 'password') {
            // Mostrar senha
            input.type = 'text';
            toggleButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
            toggleButton.setAttribute('aria-label', 'Esconder senha');
        } else {
            // Esconder senha
            input.type = 'password';
            toggleButton.innerHTML = '<i class="bi bi-eye"></i>';
            toggleButton.setAttribute('aria-label', 'Mostrar senha');
        }
    });

    // Adicionar botão ao container
    container.appendChild(toggleButton);
}

// Função para inicializar todos os campos de senha de uma página
function initPasswordToggles(inputIds) {
    document.addEventListener('DOMContentLoaded', function() {
        inputIds.forEach(id => createPasswordToggle(id));
    });
}
