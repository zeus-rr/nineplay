// Gerenciamento de Dados Profissional
let state = {
    playlists: JSON.parse(localStorage.getItem('mytube_pro_data')) || [],
    currentId: null
};

// --- FUNÇÕES DE NAVEGAÇÃO ---
const renderDashboard = () => {
    const container = document.getElementById('dashboard');
    container.innerHTML = '';

    state.playlists.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.innerHTML = `
            <h3>${pl.nome}</h3>
            <p style="color: var(--text-dim); font-size: 0.9rem; margin: 10px 0;">${pl.videos.length} Vídeos</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-outline" onclick="abrirPlaylist(${pl.id})">Abrir</button>
                <button class="btn-delete-small" onclick="excluirPlaylist(${pl.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
};

const abrirPlaylist = (id) => {
    state.currentId = id;
    const pl = state.playlists.find(p => p.id === id);
    document.getElementById('current-playlist-title').innerText = pl.nome;
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderVideos();
    initSortable();
};

const voltarParaAdmin = () => {
    document.getElementById('admin-view').classList.remove('hidden');
    document.getElementById('playlist-view').classList.add('hidden');
    renderDashboard();
};

// --- GERENCIAMENTO DE VÍDEOS ---
const solicitarLinkYoutube = () => {
    const link = prompt("Insira a URL do vídeo do YouTube:");
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link?.match(regExp);

    if (match && match[2].length === 11) {
        // Aplicação do modo youtube-nocookie para reduzir anúncios
        const embedUrl = `https://www.youtube-nocookie.com/embed/${match[2]}`;
        const pl = state.playlists.find(p => p.id === state.currentId);
        pl.videos.push(embedUrl);
        saveState();
        renderVideos();
    } else if(link) {
        alert("Link inválido! Tente copiar a URL da barra de endereços.");
    }
};

const renderVideos = () => {
    const container = document.getElementById('video-list');
    container.innerHTML = '';
    const pl = state.playlists.find(p => p.id === state.currentId);

    pl.videos.forEach((src, idx) => {
        const div = document.createElement('div');
        div.className = 'video-card';
        div.innerHTML = `
            <div class="iframe-container">
                <iframe src="${src}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="video-info">
                <span>Vídeo ${idx + 1}</span>
                <button class="btn-delete-small" onclick="removerVideo(${idx})"><i class="fas fa-times"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
};

// --- UTILITÁRIOS ---
const saveState = () => localStorage.setItem('mytube_pro_data', JSON.stringify(state.playlists));

const initSortable = () => {
    Sortable.create(document.getElementById('video-list'), {
        animation: 200,
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            const pl = state.playlists.find(p => p.id === state.currentId);
            pl.videos = Array.from(document.querySelectorAll('iframe')).map(f => f.src);
            saveState();
        }
    });
};

// Exportar e Importar (Backup)
const exportarDados = () => {
    const blob = new Blob([JSON.stringify(state.playlists)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'backup_playlists.json'; a.click();
};

const importarDados = (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        state.playlists = JSON.parse(ev.target.result);
        saveState();
        renderDashboard();
    };
    reader.readAsText(e.target.files[0]);
};

// Inicialização
function criarNovaPlaylist() {
    const nome = prompt("Nome do Quadro:");
    if(nome) {
        state.playlists.push({id: Date.now(), nome, videos: []});
        saveState();
        renderDashboard();
    }
}

function excluirPlaylist(id) {
    if(confirm("Deseja excluir este quadro?")) {
        state.playlists = state.playlists.filter(p => p.id !== id);
        saveState();
        renderDashboard();
    }
}

function removerVideo(idx) {
    const pl = state.playlists.find(p => p.id === state.currentId);
    pl.videos.splice(idx, 1);
    saveState();
    renderVideos();
}

renderDashboard();