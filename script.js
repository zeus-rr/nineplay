// Gerenciamento de Estado
let playlists = JSON.parse(localStorage.getItem('mytube_data')) || [];
let currentPlaylistId = null;

const dashboard = document.getElementById('dashboard');
const videoList = document.getElementById('video-list');

// --- PERSISTÊNCIA ---
function salvar() {
    localStorage.setItem('mytube_data', JSON.stringify(playlists));
}

// --- DASHBOARD ---
function criarNovaPlaylist() {
    const nome = prompt("Nome do novo quadro:");
    if (!nome) return;
    
    playlists.push({ id: Date.now(), nome: nome, videos: [] });
    salvar();
    renderizarDashboard();
}

function renderizarDashboard() {
    dashboard.innerHTML = '';
    playlists.forEach(pl => {
        const div = document.createElement('div');
        div.className = 'playlist-card';
        div.innerHTML = `
            <h3>${pl.nome}</h3>
            <p>${pl.videos.length} vídeos</p>
            <button class="btn-main" onclick="abrirPlaylist(${pl.id})">Abrir</button>
            <button class="btn-delete" onclick="excluirPlaylist(${pl.id})">Excluir</button>
        `;
        dashboard.appendChild(div);
    });
}

function excluirPlaylist(id) {
    if(confirm("Excluir este quadro?")) {
        playlists = playlists.filter(p => p.id !== id);
        salvar();
        renderizarDashboard();
    }
}

// --- VISUALIZAÇÃO DE VÍDEOS ---
function abrirPlaylist(id) {
    currentPlaylistId = id;
    const pl = playlists.find(p => p.id === id);
    document.getElementById('current-playlist-title').innerText = pl.nome;
    document.getElementById('admin-view').classList.add('hidden');
    document.getElementById('playlist-view').classList.remove('hidden');
    renderizarVideos();
    inicializarSortable();
}

function voltarParaAdmin() {
    document.getElementById('admin-view').classList.remove('hidden');
    document.getElementById('playlist-view').classList.add('hidden');
    renderizarDashboard();
}

function formatarLink(url) {
    // Regex para capturar IDs de diversos formatos de link do YT
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        // Utilizamos o domínio youtube-nocookie para uma experiência mais limpa
        return `https://www.youtube-nocookie.com/embed/${match[2]}`;
    }
    return null;
}

function solicitarLinkYoutube() {
    const link = prompt("Cole o link do vídeo do YouTube:");
    const embed = formatarLink(link || "");
    
    if (embed) {
        const pl = playlists.find(p => p.id === currentPlaylistId);
        pl.videos.push(embed);
        salvar();
        renderizarVideos();
    } else {
        alert("Link inválido!");
    }
}

function renderizarVideos() {
    videoList.innerHTML = '';
    const pl = playlists.find(p => p.id === currentPlaylistId);
    
    pl.videos.forEach((src, index) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="iframe-wrapper">
                <iframe src="${src}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div style="padding:10px; text-align:center;">
                <button class="btn-delete" onclick="removerVideo(${index})">Remover</button>
            </div>
        `;
        videoList.appendChild(card);
    });
}

function removerVideo(index) {
    const pl = playlists.find(p => p.id === currentPlaylistId);
    pl.videos.splice(index, 1);
    salvar();
    renderizarVideos();
}

// --- DRAG & DROP ---
function inicializarSortable() {
    Sortable.create(videoList, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: () => {
            const pl = playlists.find(p => p.id === currentPlaylistId);
            const novosSrcs = Array.from(videoList.querySelectorAll('iframe')).map(f => f.src);
            pl.videos = novosSrcs;
            salvar();
        }
    });
}

// Início
renderizarDashboard();
