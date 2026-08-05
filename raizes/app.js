/*
  app.js — Raízes (protótipo)
  -----------------------------------------------------------------
  ARMAZENAMENTO: este protótipo usa localStorage (só no navegador
  de quem está usando) para simular login e envio de formulários.
  Isso é só para demonstrar o fluxo da interface.

  Isso NÃO é um banco de dados de produção. Nada aqui sai do
  navegador, nada é criptografado de verdade, e não deve ser usado
  com dados reais de pessoas em situação de violência. Ver
  NOTAS-TECNICAS.md na raiz do projeto para o que uma versão real
  precisaria (backend próprio, criptografia em repouso, conformidade
  com a LGPD, controle de acesso, etc.).

  Princípio de discrição aplicado mesmo no protótipo:
  - Nunca gravamos nome, e-mail ou senha em texto puro junto dos
    dados de triagem/pedido de conversa.
  - Cada envio vira um registro com um ID aleatório, sem vínculo
    visível com a identidade da pessoa.
  - O modo "Continuar anônima" não pede nenhum dado identificável.
-----------------------------------------------------------------*/

(function () {
  "use strict";

  const NS = "rl_"; // prefixo curto e discreto para as chaves

  function uid() {
    return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(NS + "session") || "null");
    } catch (e) {
      return null;
    }
  }

  function setSession(mode) {
    // mode: "anon" | "named" — nunca guardamos e-mail/senha aqui
    const session = { mode: mode, pseudo: uid().slice(0, 8), since: Date.now() };
    localStorage.setItem(NS + "session", JSON.stringify(session));
    return session;
  }

  function saveRecord(bucket, data) {
    const key = NS + bucket + "_" + uid();
    localStorage.setItem(key, JSON.stringify({ ...data, ts: Date.now() }));
    return key;
  }

  // ---------- Nav (hamburger) ----------
  function initNav() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-nav-panel]");
    const scrim = document.querySelector("[data-nav-scrim]");
    const close = document.querySelector("[data-nav-close]");
    if (!toggle || !panel) return;

    function open() {
      panel.classList.add("open");
      scrim.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
    function closeNav() {
      panel.classList.remove("open");
      scrim.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", open);
    close && close.addEventListener("click", closeNav);
    scrim && scrim.addEventListener("click", closeNav);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });
  }

  // ---------- Saída rápida ----------
  function initExit() {
    document.querySelectorAll("[data-exit]").forEach((btn) => {
      btn.addEventListener("click", () => window.location.replace("https://www.google.com"));
    });
  }

  // ---------- Sessão / pílula no topo ----------
  function initSessionPill() {
    const pill = document.querySelector("[data-session-pill]");
    if (!pill) return;
    const s = getSession();
    pill.textContent = s ? (s.mode === "anon" ? "Sessão anônima" : "Sessão iniciada") : "Visitante";
  }

  // ---------- Login ----------
  function initLogin() {
    const form = document.querySelector("[data-login-form]");
    const anonBtn = document.querySelector("[data-anon-btn]");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        setSession("named");
        window.location.href = "inicio.html";
      });
    }
    if (anonBtn) {
      anonBtn.addEventListener("click", () => {
        setSession("anon");
        window.location.href = "inicio.html";
      });
    }
  }

  // ---------- Chips (seleção visual em botões/checkbox) ----------
  function initChips() {
    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const input = chip.querySelector("input");
        if (!input) return;
        if (input.type === "radio") {
          document.querySelectorAll(`.chip input[name="${input.name}"]`).forEach((i) => {
            i.closest(".chip").classList.remove("selected");
          });
          input.checked = true;
          chip.classList.add("selected");
        } else {
          input.checked = !input.checked;
          chip.classList.toggle("selected", input.checked);
        }
      });
    });
  }

  // ---------- Formulário genérico com confirmação (triagem / conversar / cadastro) ----------
  function initDemoForm() {
    document.querySelectorAll("[data-demo-form]").forEach((form) => {
      const confirmBox = form.querySelector("[data-confirm]") || document.querySelector("[data-confirm]");
      const bucket = form.getAttribute("data-demo-form");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = {};
        new FormData(form).forEach((v, k) => {
          data[k] = data[k] ? [].concat(data[k], v) : v;
        });
        saveRecord(bucket, data);
        form.reset();
        form.querySelectorAll(".chip.selected").forEach((c) => c.classList.remove("selected"));
        if (confirmBox) confirmBox.classList.add("show");
      });
    });
  }

  // ---------- Abas (ex.: psicólogas → Buscar / Cadastrar-se) ----------
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach((tabGroup) => {
      const buttons = tabGroup.querySelectorAll("[data-tab-btn]");
      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-tab-btn");
          buttons.forEach((b) => b.classList.toggle("active", b === btn));
          tabGroup.querySelectorAll("[data-tab-panel]").forEach((panel) => {
            panel.classList.toggle("active", panel.getAttribute("data-tab-panel") === target);
          });
        });
      });
    });
  }

  // ---------- Chat de exemplo (conversar.html) ----------
  // IMPORTANTE: isto é uma simulação com respostas roteirizadas (sem IA real e
  // sem digitação livre), só para mostrar como a experiência de conversa
  // funcionaria dentro do produto final. Nunca deve ser confundido com
  // atendimento profissional real.
  const CHAT_SCRIPTS = {
    psicologa: {
      persona: "Psicóloga da rede (exemplo)",
      avatar: "P",
      start: "ola",
      nodes: {
        ola: {
          bot: ["Oi, seja bem-vinda. Sou um exemplo de como uma primeira conversa com uma psicóloga da rede poderia começar por aqui.", "Não precisa contar tudo agora — só o que for confortável. Como você está se sentindo hoje?"],
          options: [
            { label: "Ansiosa e sem saber por onde começar", next: "ansiosa" },
            { label: "Quero entender como funciona o atendimento", next: "como_funciona" },
            { label: "Prefiro só olhar por enquanto", next: "so_olhar" },
          ],
        },
        ansiosa: {
          bot: ["Faz sentido se sentir assim — buscar ajuda já é um passo grande.", "Numa conversa real, a psicóloga te ouviria com calma, no seu tempo, sem pressa e sem julgamento."],
          options: [
            { label: "Quero pedir uma conversa de verdade", next: "cta_real" },
            { label: "Ver como funciona o atendimento", next: "como_funciona" },
          ],
        },
        como_funciona: {
          bot: ["O atendimento é individual, com uma psicóloga com CRP verificado e formação em trauma e violência de gênero.", "Pode ser online ou presencial, e existem vagas gratuitas e a preço social."],
          options: [
            { label: "Quero pedir uma conversa de verdade", next: "cta_real" },
            { label: "E se eu estiver em risco agora?", next: "risco" },
          ],
        },
        so_olhar: {
          bot: ["Sem problema nenhum. Você pode voltar aqui quando quiser, no seu tempo — não existe pressa."],
          options: [
            { label: "Ver como funciona o atendimento", next: "como_funciona" },
            { label: "E se eu estiver em risco agora?", next: "risco" },
          ],
        },
        risco: {
          bot: ["Se você corre risco agora, não espere um formulário ou uma conversa: ligue 190 (emergência policial) ou 180 (Central de Atendimento à Mulher, 24h)."],
          options: [
            { label: "Entendi, voltar", next: "ola" },
          ],
        },
        cta_real: {
          bot: ["Boa. Isso aqui foi só um exemplo — o pedido de conversa de verdade fica no formulário desta página, logo abaixo."],
          options: [
            { label: "Recomeçar exemplo", next: "ola" },
          ],
        },
      },
    },
    sobrevivente: {
      persona: "Mulher que já venceu (exemplo)",
      avatar: "S",
      start: "ola",
      nodes: {
        ola: {
          bot: ["Oi. Este é um exemplo de como seria uma conversa com uma voluntária que já passou pelo que você está passando.", "A gente não substitui terapia, só divide experiência. O que você gostaria de saber?"],
          options: [
            { label: "Como foi pra você sair dessa situação?", next: "saida" },
            { label: "Tenho medo de não ser acreditada", next: "medo" },
            { label: "Só queria saber que não estou sozinha", next: "sozinha" },
          ],
        },
        saida: {
          bot: ["Cada história é diferente, e numa conversa real eu contaria a minha com calma.", "O que ajudou muita gente foi ter uma rede: psicóloga, uma amiga de confiança, e informação sobre direitos."],
          options: [
            { label: "Quero pedir uma conversa de verdade", next: "cta_real" },
          ],
        },
        medo: {
          bot: ["Esse medo é muito comum, e eu também senti isso. Mas aqui você é acreditada, sempre."],
          options: [
            { label: "Quero pedir uma conversa de verdade", next: "cta_real" },
          ],
        },
        sozinha: {
          bot: ["Você não está. Tem muita gente que já passou por isso e está do outro lado, pronta pra ouvir."],
          options: [
            { label: "Quero pedir uma conversa de verdade", next: "cta_real" },
          ],
        },
        cta_real: {
          bot: ["Isso aqui foi só um exemplo — o pedido de conversa de verdade fica no formulário desta página, logo abaixo."],
          options: [
            { label: "Recomeçar exemplo", next: "ola" },
          ],
        },
      },
    },
  };

  function renderChatNode(nodeKey, script, chatWindow, quickReplies) {
    const node = script.nodes[nodeKey];
    if (!node) return;
    node.bot.forEach((line) => {
      const b = document.createElement("div");
      b.className = "bubble bot";
      b.textContent = line;
      chatWindow.appendChild(b);
    });
    chatWindow.scrollTop = chatWindow.scrollHeight;
    quickReplies.innerHTML = "";
    node.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "qr-btn";
      btn.type = "button";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        const me = document.createElement("div");
        me.className = "bubble me";
        me.textContent = opt.label;
        chatWindow.appendChild(me);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        setTimeout(() => renderChatNode(opt.next, script, chatWindow, quickReplies), 250);
      });
      quickReplies.appendChild(btn);
    });
  }

  function initChatDemo() {
    const demo = document.querySelector("[data-chat-demo]");
    if (!demo) return;
    const picker = demo.querySelector("[data-chat-picker]");
    const chatWindow = demo.querySelector("[data-chat-window]");
    const quickReplies = demo.querySelector("[data-chat-quick-replies]");
    const who = demo.querySelector("[data-chat-who]");
    const avatar = demo.querySelector("[data-chat-avatar]");

    function loadPersona(key) {
      const script = CHAT_SCRIPTS[key];
      if (!script) return;
      chatWindow.innerHTML = "";
      who.textContent = script.persona;
      avatar.textContent = script.avatar;
      renderChatNode(script.start, script, chatWindow, quickReplies);
    }

    picker.querySelectorAll("[data-persona]").forEach((btn) => {
      btn.addEventListener("click", () => {
        picker.querySelectorAll("[data-persona]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        loadPersona(btn.getAttribute("data-persona"));
      });
    });

    loadPersona(picker.querySelector("[data-persona]").getAttribute("data-persona"));
  }

  // ---------- Filtros de perfis (psicólogas / sobreviventes) ----------
  function initFilters() {
    const filterBar = document.querySelector("[data-filters]");
    if (!filterBar) return;
    const buttons = filterBar.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll("[data-tags]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const tag = btn.getAttribute("data-filter");
        cards.forEach((card) => {
          const tags = (card.getAttribute("data-tags") || "").split(",");
          card.style.display = tag === "todas" || tags.includes(tag) ? "" : "none";
        });
      });
    });
  }

  // ---------- Busca por CEP (localização) ----------
  // Usa a API pública ViaCEP (sem chave) para resolver o CEP em endereço real.
  // A partir do endereço, montamos links de busca do Google Maps para os
  // serviços de apoio — os resultados do Maps são reais e atualizados; nós
  // não inventamos endereços de delegacias/CREAS, só geramos a busca certa.
  function mapsSearchLink(query) {
    return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query);
  }

  function initCepDemo() {
    const form = document.querySelector("[data-cep-form]");
    if (!form) return;
    const result = document.querySelector("[data-cep-result]");
    const input = form.querySelector("input");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!result) return;
      const raw = input.value.replace(/\D/g, "");
      result.classList.add("show");

      if (raw.length !== 8) {
        result.innerHTML = '<div class="cep-error">Digite um CEP válido, com 8 números (ex.: 42800-000).</div>';
        return;
      }

      result.innerHTML = '<div class="cep-address">Buscando seu endereço…</div>';

      try {
        const resp = await fetch("https://viacep.com.br/ws/" + raw + "/json/");
        const data = await resp.json();

        if (data.erro) {
          result.innerHTML = '<div class="cep-error">Não encontramos esse CEP. Confira os números e tente de novo.</div>';
          return;
        }

        const cidade = data.localidade + " - " + data.uf;
        const enderecoBase = (data.bairro ? data.bairro + ", " : "") + cidade;

        const locais = [
          { name: "Delegacia da Mulher (DEAM)", desc: "Delegacia especializada em crimes contra a mulher", q: "Delegacia da Mulher perto de " + enderecoBase },
          { name: "Casa da Mulher Brasileira", desc: "Atendimento integrado: acolhimento, saúde, assistência social e polícia no mesmo lugar", q: "Casa da Mulher Brasileira perto de " + enderecoBase },
          { name: "CREAS", desc: "Centro de Referência Especializado de Assistência Social", q: "CREAS perto de " + enderecoBase },
          { name: "Defensoria Pública", desc: "Orientação jurídica gratuita", q: "Defensoria Pública perto de " + enderecoBase },
        ];

        let html = '<div class="cep-address">Endereço encontrado: <strong>' +
          (data.logradouro ? data.logradouro + ", " : "") + enderecoBase + '</strong></div>';
        html += '<div class="cep-results">';
        locais.forEach((l) => {
          html += '<a class="cep-result-item" target="_blank" rel="noopener" href="' + mapsSearchLink(l.q) + '">' +
            '<div><div class="name">' + l.name + '</div><div class="desc">' + l.desc + '</div></div>' +
            '<div class="go">Ver no mapa ↗</div></a>';
        });
        html += "</div>";
        html += '<div class="loc-note" style="margin-top:16px;">Os resultados abrem o Google Maps com uma busca real perto do seu endereço — confira sempre o endereço e telefone diretamente no local antes de ir, pois a disponibilidade pode mudar por cidade.</div>';
        result.innerHTML = html;
      } catch (err) {
        result.innerHTML = '<div class="cep-error">Não foi possível buscar agora. Verifique sua conexão e tente novamente, ou use os canais nacionais acima (180 / 190).</div>';
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initExit();
    initSessionPill();
    initLogin();
    initChips();
    initDemoForm();
    initFilters();
    initCepDemo();
    initTabs();
    initChatDemo();
  });
})();
