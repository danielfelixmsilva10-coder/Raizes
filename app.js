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

  // ---------- Formulário genérico com confirmação (triagem / conversar) ----------
  function initDemoForm() {
    const form = document.querySelector("[data-demo-form]");
    if (!form) return;
    const confirmBox = document.querySelector("[data-confirm]");
    const bucket = form.getAttribute("data-demo-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {};
      new FormData(form).forEach((v, k) => {
        data[k] = data[k] ? [].concat(data[k], v) : v;
      });
      saveRecord(bucket, data);
      form.reset();
      document.querySelectorAll(".chip.selected").forEach((c) => c.classList.remove("selected"));
      if (confirmBox) confirmBox.classList.add("show");
    });
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

  // ---------- CEP demo (localização) ----------
  function initCepDemo() {
    const form = document.querySelector("[data-cep-form]");
    if (!form) return;
    const result = document.querySelector("[data-cep-result]");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const cep = form.querySelector("input").value.trim();
      if (result) {
        result.classList.add("show");
        result.innerHTML =
          "Em uma versão de produção, aqui apareceriam a Delegacia da Mulher (DEAM), o CREAS e a casa-abrigo mais próximos do CEP <strong>" +
          (cep || "informado") +
          "</strong>, puxados de uma base de dados oficial atualizada por município.";
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
  });
})();
