
// Elementos DOM
const jsonInput = document.getElementById('jsonInput');
const loadSampleBtn = document.getElementById('loadSample');
const validateJsonBtn = document.getElementById('validateJson');
const validationMessage = document.getElementById('validationMessage');
const previewContent = document.getElementById('previewContent');
const trelloOutput = document.getElementById('trelloOutput');
const copyOutputBtn = document.getElementById('copyOutput');
const toast = document.getElementById('toast');

// JSON de exemplo
const sampleJson = {
    board: {
        name: "Fin Aii - MVP",
        lists: [
            {
                name: "To Do",
                cards: [
                    "🔐 Autenticação (Firebase)",
                    "Implementar cadastro de usuário"
                ]
            },
            {
                name: "Doing",
                cards: []
            },
            {
                name: "Done",
                cards: []
            }
        ]
    }
};

// Funções utilitárias
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showMessage(message, type = 'success') {
    validationMessage.textContent = message;
    validationMessage.className = `message ${type}`;
}

function clearMessage() {
    validationMessage.textContent = '';
    validationMessage.className = 'message';
}

// Validar JSON
function validateJson(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        // Validações básicas
        if (!data.board) {
            throw new Error('JSON deve conter um objeto "board"');
        }
        
        if (!data.board.name) {
            throw new Error('Board deve ter um "name"');
        }
        
        if (!Array.isArray(data.board.lists)) {
            throw new Error('Board deve ter um array "lists"');
        }
        
        // Validar cada lista
        data.board.lists.forEach((list, index) => {
            if (!list.name) {
                throw new Error(`Lista ${index + 1} deve ter um "name"`);
            }
            
            if (!Array.isArray(list.cards)) {
                throw new Error(`Lista "${list.name}" deve ter um array "cards"`);
            }
        });
        
        return { valid: true, data };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

// Gerar preview do board
function generatePreview(data) {
    const boardHtml = `
        <div class="board-preview">
            <div class="board-title">📋 ${data.board.name}</div>
            <div class="lists-container">
                ${data.board.lists.map(list => `
                    <div class="list-item">
                        <div class="list-title">${list.name} (${list.cards.length})</div>
                        ${list.cards.map(card => `
                            <div class="card-item">${card}</div>
                        `).join('')}
                        ${list.cards.length === 0 ? '<div style="color: #64748b; font-style: italic; text-align: center; padding: 20px;">Sem cards</div>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    return boardHtml;
}

// Converter para formato Trello
function convertToTrelloFormat(data) {
    const trelloData = {
        name: data.board.name,
        desc: `Board criado via importador JSON - ${new Date().toLocaleDateString('pt-BR')}`,
        defaultLists: false,
        prefs_permissionLevel: "private",
        prefs_voting: "disabled",
        prefs_comments: "members",
        prefs_invitations: "members",
        prefs_selfJoin: true,
        prefs_cardCovers: true,
        prefs_background: "blue",
        lists: data.board.lists.map((list, index) => ({
            name: list.name,
            pos: (index + 1) * 16384
        })),
        cards: []
    };
    
    // Adicionar cards
    data.board.lists.forEach((list, listIndex) => {
        list.cards.forEach((cardName, cardIndex) => {
            trelloData.cards.push({
                name: cardName,
                desc: "",
                pos: (cardIndex + 1) * 16384,
                idList: listIndex,
                due: null,
                labels: []
            });
        });
    });
    
    return trelloData;
}

// Event Listeners
loadSampleBtn.addEventListener('click', () => {
    jsonInput.value = JSON.stringify(sampleJson, null, 2);
    showToast('Exemplo carregado com sucesso!');
    validateJsonBtn.click(); // Auto-validar
});

validateJsonBtn.addEventListener('click', () => {
    const jsonString = jsonInput.value.trim();
    
    if (!jsonString) {
        showMessage('Por favor, cole um JSON válido', 'error');
        previewContent.innerHTML = '<p class="empty-state">Cole um JSON válido para ver a pré-visualização</p>';
        trelloOutput.value = '';
        copyOutputBtn.disabled = true;
        return;
    }
    
    const validation = validateJson(jsonString);
    
    if (validation.valid) {
        showMessage('✅ JSON válido! Dados processados com sucesso.', 'success');
        
        // Gerar preview
        previewContent.innerHTML = generatePreview(validation.data);
        
        // Converter para formato Trello
        const trelloData = convertToTrelloFormat(validation.data);
        trelloOutput.value = JSON.stringify(trelloData, null, 2);
        
        copyOutputBtn.disabled = false;
        showToast('JSON processado com sucesso!');
    } else {
        showMessage(`❌ Erro no JSON: ${validation.error}`, 'error');
        previewContent.innerHTML = '<p class="empty-state">JSON inválido - corrija os erros acima</p>';
        trelloOutput.value = '';
        copyOutputBtn.disabled = true;
    }
});

copyOutputBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(trelloOutput.value);
        showToast('Resultado copiado para a área de transferência!');
    } catch (error) {
        // Fallback para navegadores mais antigos
        trelloOutput.select();
        document.execCommand('copy');
        showToast('Resultado copiado para a área de transferência!');
    }
});

// Auto-validar quando o usuário para de digitar
let timeoutId;
jsonInput.addEventListener('input', () => {
    clearTimeout(timeoutId);
    clearMessage();
    
    timeoutId = setTimeout(() => {
        if (jsonInput.value.trim()) {
            validateJsonBtn.click();
        }
    }, 1000);
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Importador JSON para Trello carregado!');
});
