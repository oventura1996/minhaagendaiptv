
        // Lógica JavaScript
        document.addEventListener('DOMContentLoaded', () => {
            const loginScreen = document.getElementById('loginScreen');
            const mainApp = document.getElementById('mainApp');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const loginButton = document.getElementById('loginButton');
            const loginError = document.getElementById('loginError');
            const togglePassword = document.getElementById('togglePassword'); // Elemento para mostrar/ocultar senha

            const subscriberForm = document.getElementById('subscriberForm');
            const subscriberList = document.getElementById('subscriberList');
            const subscriberNameInput = document.getElementById('subscriberName');
            const subscriberPhoneInput = document.getElementById('subscriberPhone');
            const dueDateInput = document.getElementById('dueDate');
            const startDateInput = document.getElementById('startDate');
            const isMonthlyCheckbox = document.getElementById('isMonthly');
            const showAllBtn = document.getElementById('showAll');
            const showDueSoonBtn = document.getElementById('showDueSoon');
            const showNormalBtn = document.getElementById('showNormal');
            const toggleSecurityBtn = document.getElementById('toggleSecurity');
            const logoutButton = document.getElementById('logoutButton'); // Botão de sair

            let subscribers = loadSubscribers();
            let dataHidden = false;

            // Credenciais de login
            const correctUsername = 'Ocristiano';
            const correctPassword = '@LuaneLucca18';

            // Mensagem padrão para o WhatsApp (já codificada para URL)
            const alertMessage = "Oi%2C%20tudo%20bem%3F%20Passando%20pra%20te%20lembrar%20que%20sua%20assinatura%20OVE%20IPTV%20est%C3%A1%20prestes%20a%20vencer.%20Evite%20o%20cancelamento%20autom%C3%A1tico%20mantendo%20seu%20plano%20em%20dia.%0A%0A%F0%9F%92%B0%20Pagamento%20via%20PIX%3A%20430.408.398-88%20%28Banco%20Neon%29.%0A%0AAgradecemos%20por%20ser%20nosso%20cliente%21%20Qualquer%20d%C3%BAvida%2C%20estamos%20%C3%A0%20disposi%C3%A7%C3%A3o.%20%F0%9F%91%8D";
            
            // Nova mensagem de aviso para o WhatsApp (já codificada para URL)
            const noticeMessage = "Oi%2C%20estamos%20passando%20por%20uma%20atualiza%C3%A7%C3%A3o%20no%20sistema%20e%20pode%20ocorrer%20quedas%20tempor%C3%A1rias.%20Voltamos%20em%20breve%20e%20agradecemos%20a%20compreens%C3%A3o%20%28prazo%20de%20no%20m%C3%A1ximo%201%20hora%20para%20o%20retorno%29.";

            // Função para carregar assinantes do localStorage
            function loadSubscribers() {
                const storedSubscribers = localStorage.getItem('subscribers');
                return storedSubscribers ? JSON.parse(storedSubscribers) : [];
            }

            // Função para salvar assinantes no localStorage
            function saveSubscribers() {
                localStorage.setItem('subscribers', JSON.stringify(subscribers));
            }

            // Função para calcular a diferença de dias para o vencimento
            function calculateDaysUntilDue(subscriberDueDate, isMonthly) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let dueDate;
                if (isMonthly) {
                    const dueDay = new Date(subscriberDueDate).getDate(); // Pega apenas o dia
                    dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
                    // Se o dia de vencimento já passou neste mês, verifica o próximo mês
                    if (dueDate < today) {
                        dueDate.setMonth(dueDate.getMonth() + 1);
                    }
                } else {
                    dueDate = new Date(subscriberDueDate + 'T00:00:00');
                }

                const diffTime = dueDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays;
            }

            // Função para exibir os assinantes na lista
            function displaySubscribers(filter = 'all') {
                subscriberList.innerHTML = ''; // Limpa a lista antes de adicionar
                
                let filteredSubscribers = [];

                if (filter === 'all') {
                    filteredSubscribers = subscribers;
                } else if (filter === 'dueSoon') {
                    filteredSubscribers = subscribers.filter(subscriber => {
                        const diffDays = calculateDaysUntilDue(subscriber.dueDate, subscriber.isMonthly);
                        return diffDays >= 0 && diffDays <= 2; // Vencimento hoje ou nos próximos 2 dias
                    });
                } else if (filter === 'normal') {
                    filteredSubscribers = subscribers.filter(subscriber => {
                        const diffDays = calculateDaysUntilDue(subscriber.dueDate, subscriber.isMonthly);
                        return diffDays > 2; // Vencimento em mais de 2 dias
                    });
                }

                // Ordena os assinantes para exibir os mais próximos ao vencimento primeiro
                filteredSubscribers.sort((a, b) => {
                    const diffA = calculateDaysUntilDue(a.dueDate, a.isMonthly);
                    const diffB = calculateDaysUntilDue(b.dueDate, b.isMonthly);
                    return diffA - diffB;
                });

                filteredSubscribers.forEach((subscriber, index) => {
                    const listItem = document.createElement('li');
                    
                    // Adiciona um atributo de dados para o índice original do assinante, para facilitar a exclusão
                    // O data-original-index agora guarda o índice no array 'subscribers' original, não o do 'filteredSubscribers'
                    listItem.dataset.originalIndex = subscribers.indexOf(subscriber); 

                    const diffDays = calculateDaysUntilDue(subscriber.dueDate, subscriber.isMonthly);

                    if (diffDays >= 0 && diffDays <= 2) {
                        listItem.classList.add('due-soon'); // Adiciona a classe para ficar vermelho
                    }

                    if (dataHidden) {
                        listItem.classList.add('hide-data'); // Esconde os dados se a segurança estiver ativada
                    }

                    // Formatação da data de vencimento
                    let displayDueDate;
                    if (subscriber.isMonthly) {
                        // Se for mensal, mostra apenas o dia
                        displayDueDate = `Todo dia ${new Date(subscriber.dueDate).getDate()}`;
                    } else {
                        // Caso contrário, mostra a data completa
                        displayDueDate = new Date(subscriber.dueDate + 'T00:00:00').toLocaleDateString('pt-BR');
                    }

                    listItem.innerHTML = `
                        <span class="name">Nome: ${subscriber.name}</span>
                        <span class="phone">Telefone: ${subscriber.phone}</span>
                        <span class="due-date">Vencimento: ${displayDueDate}</span>
                        <span class="start-date">Assinante desde: ${new Date(subscriber.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        ${subscriber.isMonthly ? '<span class="is-monthly">(Mensal)</span>' : ''}
                        <div class="list-actions">
                            <button class="alert-button" data-phone="${subscriber.phone}">Enviar Alerta</button>
                            <button class="notice-button" data-phone="${subscriber.phone}">Enviar Aviso</button>
                            <button class="delete-button">Excluir</button>
                        </div>
                    `;
                    subscriberList.appendChild(listItem);
                });
            }

            // Lógica de Login
            loginButton.addEventListener('click', () => {
                const enteredUsername = usernameInput.value;
                const enteredPassword = passwordInput.value;

                if (enteredUsername === correctUsername && enteredPassword === correctPassword) {
                    loginScreen.style.display = 'none'; // Esconde a tela de login
                    mainApp.style.display = 'block'; // Mostra o conteúdo principal
                    displaySubscribers(); // Exibe os assinantes ao logar
                } else {
                    loginError.style.display = 'block'; // Mostra mensagem de erro
                }
            });

            // Lógica para mostrar/ocultar senha
            togglePassword.addEventListener('click', () => {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    togglePassword.textContent = 'Ocultar';
                } else {
                    passwordInput.type = 'password';
                    togglePassword.textContent = 'Mostrar';
                }
            });

            // Adiciona um novo assinante
            subscriberForm.addEventListener('submit', (e) => {
                e.preventDefault(); // Impede o recarregamento da página

                const name = subscriberNameInput.value.trim();
                const phone = subscriberPhoneInput.value.trim();
                const dueDate = dueDateInput.value;
                const startDate = startDateInput.value;
                const isMonthly = isMonthlyCheckbox.checked;

                // Validação para garantir que os campos não estão vazios
                if (!name || !phone || !dueDate || !startDate) {
                    console.error('Por favor, preencha todos os campos.');
                    return;
                }

                // Validação básica do telefone (apenas números)
                if (!/^[0-9]+$/.test(phone)) {
                    console.error('Por favor, insira apenas números no campo Telefone.');
                    return;
                }

                const newSubscriber = { name, phone, dueDate, startDate, isMonthly };
                subscribers.push(newSubscriber);
                saveSubscribers();
                displaySubscribers();
                subscriberForm.reset();
            });

            // Delegando eventos de clique para os botões dentro da lista
            subscriberList.addEventListener('click', (e) => {
                // Botão "Enviar Alerta"
                if (e.target.classList.contains('alert-button')) {
                    const phoneNumber = e.target.dataset.phone;
                    const waLink = `https://wa.me/${phoneNumber}?text=${alertMessage}`;
                    window.open(waLink, '_blank');
                }
                // Botão "Enviar Aviso"
                else if (e.target.classList.contains('notice-button')) {
                    const phoneNumber = e.target.dataset.phone;
                    const waLink = `https://wa.me/${phoneNumber}?text=${noticeMessage}`;
                    window.open(waLink, '_blank');
                }
                // Botão "Excluir"
                else if (e.target.classList.contains('delete-button')) {
                    const listItem = e.target.closest('li'); // Pega o elemento <li> pai
                    const originalIndex = parseInt(listItem.dataset.originalIndex); // Obtém o índice original

                    if (!isNaN(originalIndex) && originalIndex >= 0 && originalIndex < subscribers.length) {
                        console.log('Confirmar exclusão de assinante.');
                        subscribers.splice(originalIndex, 1); // Remove o assinante pelo índice original
                        saveSubscribers(); // Salva as mudanças
                        displaySubscribers(); // Atualiza a lista
                    } else {
                        console.error('Erro ao excluir assinante. Por favor, tente novamente.');
                    }
                }
            });

            // Eventos para os botões de filtro
            showAllBtn.addEventListener('click', () => displaySubscribers('all'));
            showDueSoonBtn.addEventListener('click', () => displaySubscribers('dueSoon'));
            showNormalBtn.addEventListener('click', () => displaySubscribers('normal'));

            // Alternar segurança (mostrar/ocultar dados)
            toggleSecurityBtn.addEventListener('click', () => {
                dataHidden = !dataHidden; // Inverte o estado
                toggleSecurityBtn.textContent = dataHidden ? 'Mostrar Dados' : 'Ocultar Dados';
                
                document.querySelectorAll('#subscriberList li').forEach(item => {
                    if (dataHidden) {
                        item.classList.add('hide-data');
                    } else {
                        item.classList.remove('hide-data');
                    }
                });
            });

            // Lógica para o botão de Sair
            logoutButton.addEventListener('click', () => {
                mainApp.style.display = 'none'; // Esconde o conteúdo principal
                loginScreen.style.display = 'flex'; // Mostra a tela de login
                usernameInput.value = ''; // Limpa o campo de usuário
                passwordInput.value = ''; // Limpa o campo de senha
                loginError.style.display = 'none'; // Esconde qualquer mensagem de erro
                passwordInput.type = 'password'; // Garante que a senha volte a ser oculta
                togglePassword.textContent = 'Mostrar'; // Reseta o texto do toggle
            });
        });
    