# 🎬 Toon Meet

Um "Google Meet" caseiro, com tema cartoon preto e branco, chat com rolagem
de dados de RPG, música do YouTube sincronizada e tudo rodando **sem
back-end próprio**.

## Como funciona sem back-end

Chamadas de vídeo (WebRTC) sempre precisam de alguma forma de dois
navegadores se "encontrarem" na internet antes de conseguirem conversar
diretamente (isso se chama sinalização). Esse projeto usa a biblioteca
[Trystero](https://github.com/dmotz/trystero), que faz essa sinalização
usando redes públicas já existentes (trackers de torrent), então **você
não precisa hospedar nenhum servidor**. Depois desse "aperto de mão"
inicial, vídeo, áudio, tela e chat trafegam **direto entre os
participantes** (P2P).

Isso é ótimo pra hospedar de graça em qualquer lugar estático (Vercel,
Netlify, GitHub Pages, Cloudflare Pages), mas tem limitações reais — leia
"Limitações" abaixo antes de usar com muita gente ou em produção séria.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o link que aparecer (algo como `http://localhost:5173`).

## Gerando a versão de produção

```bash
npm run build
```

Isso cria a pasta `dist/` — é só subir o conteúdo dela em qualquer
hospedagem de site estático (Vercel, Netlify, GitHub Pages, Cloudflare
Pages, um S3, etc). Não precisa de Node rodando no servidor, é só HTML/JS/CSS
estático.

**Importante:** câmera, microfone e compartilhamento de tela só funcionam
em `https://` (ou em `localhost`). Ao hospedar, use um serviço que já te dá
HTTPS de graça (Vercel/Netlify/Cloudflare Pages já fazem isso
automaticamente).

## Funcionalidades

- Criar conta (nome, e-mail, senha, foto) ou entrar como convidado só com nome — tudo salvo em `localStorage`, no navegador de cada pessoa.
- Criar sala (gera um código) ou entrar em uma sala existente por código ou por link compartilhável.
- Vídeo de câmera + compartilhamento de tela simultâneos.
- Áudio: ligar/desligar microfone, escolher dispositivos de entrada/saída de áudio e câmera na tela de Configurações.
- Botão direito em um participante → silenciar ou ajustar o volume **só para você** (não afeta os outros).
- Destaque visual em quem está falando.
- Sons de entrada/saída de participantes.
- Duplo clique (ou botão ⛶) em um vídeo para maximizá-lo.
- Chat de texto com rolagem de dados: digite algo como `2d20 3d10 1d6` e o chat calcula os resultados automaticamente.
- Player de música do YouTube sincronizado entre os participantes (link → toca pra todo mundo), que continua tocando mesmo com a barra de música minimizada.
- Visual "cartoon preto e branco": bordas grossas, sombras deslocadas, fontes desenhadas à mão, vídeos com filtro P&B.

## Limitações importantes (leia antes de divulgar pra muita gente)

- **Rede P2P em malha:** cada participante se conecta diretamente com todos os outros. Funciona bem para grupos pequenos (até uns 4-6 participantes). Com muita gente, o upload de cada pessoa vira o gargalo.
- **Sem servidor TURN:** em redes muito restritivas (Wi-Fi corporativo, algumas redes 4G/5G com NAT simétrico), a conexão direta pode falhar. A solução de verdade pra isso é um servidor TURN, que é justamente o tipo de "infraestrutura hospedada" que este projeto propositalmente evita. Se isso acontecer com frequência para seus usuários, a única forma de resolver de verdade é configurar um TURN (ex: um serviço como o Twilio, Cloudflare Calls ou seu próprio `coturn`), o que exigiria algum backend/infra.
- **Sinalização via rede pública de torrents:** normalmente é rápida e estável, mas, por não ser algo que você controla, pode eventualmente ficar lenta ou instável — é o preço de não ter servidor próprio.
- **"Chamada continua minimizada":** isso funciona porque é só uma aba do navegador rodando em segundo plano — o navegador continua processando áudio/vídeo normalmente. Se a pessoa **fechar a aba** ou o computador **suspender/dormir**, a chamada cai, como em qualquer outro site.
- **Conta local:** como não há servidor, a "conta" (nome/e-mail/senha/foto) fica salva só no navegador onde foi criada — não sincroniza entre dispositivos.
- **Seleção de saída de áudio:** nem todo navegador suporta trocar o alto-falante/fone via código (funciona bem no Chrome/Edge; no Firefox e Safari pode não ter efeito).

## Estrutura do projeto

```
src/
  lib/         → funções puras (dados, sons, YouTube, localStorage, código de sala)
  hooks/       → useAudioLevel (detecção de quem fala), useMediaDevices
  context/     → AccountContext (conta local) e RoomContext (WebRTC via Trystero)
  components/  → Avatar, VideoTile, ChatPanel, MusicBar, SettingsModal, ContextMenu
  pages/       → Home (login/criar/entrar em sala) e Room (tela da chamada)
```
