const STORAGE_KEYS = {
  filmes: "filmes",
  salas: "salas",
  sessoes: "sessoes",
  ingressos: "ingressos",
};

function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return d.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function money(v) {
  const n = Number(v || 0);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function currentPage() {
  return location.pathname.split("/").pop();
}

function showAlert(containerId, message, type = "success") {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>
  `;
}

function setOptions(select, items, { placeholder, labelFn, valueFn, selectedValue } = {}) {
  if (!select) return;
  select.innerHTML = "";
  if (placeholder) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = placeholder;
    select.appendChild(opt);
  }
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = valueFn ? valueFn(item) : item.id;
    option.textContent = labelFn ? labelFn(item) : item.nome;
    if (String(option.value) === String(selectedValue)) option.selected = true;
    select.appendChild(option);
  });
}

function renderMenu(activePage) {
  const menu = document.getElementById("menuPrincipal");
  if (!menu) return;
  const links = [
    ["index.html", "Início"],
    ["cadastro-filmes.html", "Filmes"],
    ["cadastro-salas.html", "Salas"],
    ["cadastro-sessoes.html", "Sessões"],
    ["venda-ingressos.html", "Vender Ingresso"],
    ["sessoes.html", "Sessões Disponíveis"],
  ];
  menu.innerHTML = links.map(([href, text]) => {
    const active = currentPage() === href || (activePage && activePage === href);
    return `
      <li class="nav-item">
        <a class="nav-link ${active ? "active fw-semibold" : ""}" href="${href}">${text}</a>
      </li>
    `;
  }).join("");
}

function renderCounts() {
  const counts = {
    filmes: getData(STORAGE_KEYS.filmes).length,
    salas: getData(STORAGE_KEYS.salas).length,
    sessoes: getData(STORAGE_KEYS.sessoes).length,
    ingressos: getData(STORAGE_KEYS.ingressos).length,
  };

  const ids = {
    filmes: "countFilmes",
    salas: "countSalas",
    sessoes: "countSessoes",
    ingressos: "countIngressos",
  };

  Object.entries(ids).forEach(([key, id]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = counts[key];
  });
}

function initFilmes() {
  const form = document.getElementById("formFilmes");
  if (!form) return;

  const lista = document.getElementById("listaFilmes");
  const submitButton = form.querySelector('button[type="submit"]');
  const cancelButton = document.getElementById("cancelarFilme");

  function resetForm() {
    form.reset();
    if (form.id) form.id.value = "";
    if (submitButton) submitButton.textContent = "Salvar Filme";
    if (cancelButton) cancelButton.classList.add("d-none");
  }

  function render() {
    const filmes = getData(STORAGE_KEYS.filmes);
    if (!lista) return;
    lista.innerHTML = filmes.length ? filmes.map((f, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${f.titulo}</td>
        <td>${f.genero}</td>
        <td>${f.classificacao}</td>
        <td>${f.duracao} min</td>
        <td>${f.dataEstreia}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-primary btn-edit-filme" data-id="${f.id}">Alterar</button>
          <button type="button" class="btn btn-sm btn-outline-danger btn-delete-filme ms-2" data-id="${f.id}">Excluir</button>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="7" class="text-center text-muted py-4">Nenhum filme cadastrado.</td></tr>`;
    renderCounts();
  }

  lista?.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;
    const filmes = getData(STORAGE_KEYS.filmes);
    const filme = filmes.find((item) => item.id === id);
    if (!filme) return;

    if (button.classList.contains("btn-edit-filme")) {
      form.id.value = filme.id;
      form.titulo.value = filme.titulo;
      form.genero.value = filme.genero;
      form.descricao.value = filme.descricao;
      form.classificacao.value = filme.classificacao;
      form.duracao.value = filme.duracao;
      form.dataEstreia.value = filme.dataEstreia;
      if (submitButton) submitButton.textContent = "Atualizar Filme";
      if (cancelButton) cancelButton.classList.remove("d-none");
      return;
    }

    if (button.classList.contains("btn-delete-filme")) {
      if (!confirm("Deseja excluir este filme?")) return;
      const atualizados = filmes.filter((item) => item.id !== id);
      saveData(STORAGE_KEYS.filmes, atualizados);
      if (form.id && form.id.value === id) resetForm();
      showAlert("alertaFilmes", "Filme excluído com sucesso!", "warning");
      render();
    }
  });

  cancelButton?.addEventListener("click", resetForm);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const filmes = getData(STORAGE_KEYS.filmes);
    const editedId = form.id.value;

    if (editedId) {
      const index = filmes.findIndex((item) => item.id === editedId);
      if (index !== -1) {
        filmes[index] = {
          ...filmes[index],
          titulo: form.titulo.value.trim(),
          genero: form.genero.value.trim(),
          descricao: form.descricao.value.trim(),
          classificacao: form.classificacao.value,
          duracao: form.duracao.value,
          dataEstreia: form.dataEstreia.value,
        };
        saveData(STORAGE_KEYS.filmes, filmes);
        showAlert("alertaFilmes", "Filme atualizado com sucesso!");
      }
    } else {
      const novo = {
        id: uid(),
        titulo: form.titulo.value.trim(),
        genero: form.genero.value.trim(),
        descricao: form.descricao.value.trim(),
        classificacao: form.classificacao.value,
        duracao: form.duracao.value,
        dataEstreia: form.dataEstreia.value,
      };
      filmes.push(novo);
      saveData(STORAGE_KEYS.filmes, filmes);
      showAlert("alertaFilmes", "Filme salvo com sucesso!");
    }

    resetForm();
    render();
  });

  render();
}

function initSalas() {
  const form = document.getElementById("formSalas");
  if (!form) return;

  const lista = document.getElementById("listaSalas");
  const submitButton = form.querySelector('button[type="submit"]');
  const cancelButton = document.getElementById("cancelarSala");

  function resetForm() {
    form.reset();
    if (form.id) form.id.value = "";
    if (submitButton) submitButton.textContent = "Salvar Sala";
    if (cancelButton) cancelButton.classList.add("d-none");
  }

  function render() {
    const salas = getData(STORAGE_KEYS.salas);
    if (!lista) return;
    lista.innerHTML = salas.length ? salas.map((s, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${s.nome}</td>
        <td>${s.capacidade}</td>
        <td>${s.tipo}</td>
        <td>
          <button type="button" class="btn btn-sm btn-outline-primary btn-edit-sala" data-id="${s.id}">Alterar</button>
          <button type="button" class="btn btn-sm btn-outline-danger btn-delete-sala ms-2" data-id="${s.id}">Excluir</button>
        </td>
      </tr>
    `).join("") : `<tr><td colspan="5" class="text-center text-muted py-4">Nenhuma sala cadastrada.</td></tr>`;
    renderCounts();
  }

  lista?.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;
    const salas = getData(STORAGE_KEYS.salas);
    const sala = salas.find((item) => item.id === id);
    if (!sala) return;

    if (button.classList.contains("btn-edit-sala")) {
      form.id.value = sala.id;
      form.nome.value = sala.nome;
      form.capacidade.value = sala.capacidade;
      form.tipo.value = sala.tipo;
      if (submitButton) submitButton.textContent = "Atualizar Sala";
      if (cancelButton) cancelButton.classList.remove("d-none");
      return;
    }

    if (button.classList.contains("btn-delete-sala")) {
      if (!confirm("Deseja excluir esta sala?")) return;
      const atualizados = salas.filter((item) => item.id !== id);
      saveData(STORAGE_KEYS.salas, atualizados);
      if (form.id && form.id.value === id) resetForm();
      showAlert("alertaSalas", "Sala excluída com sucesso!", "warning");
      render();
    }
  });

  cancelButton?.addEventListener("click", resetForm);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const salas = getData(STORAGE_KEYS.salas);
    const editedId = form.id.value;

    if (editedId) {
      const index = salas.findIndex((item) => item.id === editedId);
      if (index !== -1) {
        salas[index] = {
          ...salas[index],
          nome: form.nome.value.trim(),
          capacidade: form.capacidade.value,
          tipo: form.tipo.value,
        };
        saveData(STORAGE_KEYS.salas, salas);
        showAlert("alertaSalas", "Sala atualizada com sucesso!");
      }
    } else {
      const novo = {
        id: uid(),
        nome: form.nome.value.trim(),
        capacidade: form.capacidade.value,
        tipo: form.tipo.value,
      };
      salas.push(novo);
      saveData(STORAGE_KEYS.salas, salas);
      showAlert("alertaSalas", "Sala salva com sucesso!");
    }

    resetForm();
    render();
  });

  render();
}

function initSessoesCadastro() {
  const form = document.getElementById("formSessoes");
  if (!form) return;

  const filmeSelect = document.getElementById("filme");
  const salaSelect = document.getElementById("sala");
  const lista = document.getElementById("listaSessoesCadastro");
  const submitButton = form.querySelector('button[type="submit"]');
  const cancelButton = document.getElementById("cancelarSessao");

  function loadSelects(selectedFilme, selectedSala) {
    const filmes = getData(STORAGE_KEYS.filmes);
    const salas = getData(STORAGE_KEYS.salas);

    setOptions(filmeSelect, filmes, {
      placeholder: "Selecione um filme",
      labelFn: (f) => f.titulo,
      valueFn: (f) => f.id,
      selectedValue: selectedFilme,
    });

    setOptions(salaSelect, salas, {
      placeholder: "Selecione uma sala",
      labelFn: (s) => `${s.nome} (${s.tipo})`,
      valueFn: (s) => s.id,
      selectedValue: selectedSala,
    });
  }

  function resetForm() {
    form.reset();
    if (form.id) form.id.value = "";
    if (submitButton) submitButton.textContent = "Salvar Sessão";
    if (cancelButton) cancelButton.classList.add("d-none");
    loadSelects();
  }

  function render() {
    const sessoes = getData(STORAGE_KEYS.sessoes);
    const filmes = getData(STORAGE_KEYS.filmes);
    const salas = getData(STORAGE_KEYS.salas);

    if (lista) {
      lista.innerHTML = sessoes.length ? sessoes.map((s, index) => {
        const filme = filmes.find(f => f.id === s.filmeId);
        const sala = salas.find(x => x.id === s.salaId);
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${filme ? filme.titulo : "—"}</td>
            <td>${sala ? sala.nome : "—"}</td>
            <td>${formatDateTime(s.dataHora)}</td>
            <td>${money(s.preco)}</td>
            <td>${s.id}</td>
            <td>
              <button type="button" class="btn btn-sm btn-outline-primary btn-edit-sessao" data-id="${s.id}">Alterar</button>
              <button type="button" class="btn btn-sm btn-outline-danger btn-delete-sessao ms-2" data-id="${s.id}">Excluir</button>
            </td>
          </tr>
        `;
      }).join("") : `<tr><td colspan="7" class="text-center text-muted py-4">Nenhuma sessão cadastrada.</td></tr>`;
    }
    renderCounts();
  }

  lista?.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;

    const sessoes = getData(STORAGE_KEYS.sessoes);
    const sessao = sessoes.find((item) => item.id === id);
    if (!sessao) return;

    if (button.classList.contains("btn-edit-sessao")) {
      form.id.value = sessao.id;
      form.filme.value = sessao.filmeId;
      form.sala.value = sessao.salaId;
      form.dataHora.value = sessao.dataHora;
      form.preco.value = sessao.preco;
      form.idioma.value = sessao.idioma;
      form.formato.value = sessao.formato;
      if (submitButton) submitButton.textContent = "Atualizar Sessão";
      if (cancelButton) cancelButton.classList.remove("d-none");
      return;
    }

    if (button.classList.contains("btn-delete-sessao")) {
      if (!confirm("Deseja excluir esta sessão?")) return;
      const atualizados = sessoes.filter((item) => item.id !== id);
      saveData(STORAGE_KEYS.sessoes, atualizados);
      if (form.id && form.id.value === id) resetForm();
      showAlert("alertaSessoes", "Sessão excluída com sucesso!", "warning");
      render();
    }
  });

  cancelButton?.addEventListener("click", resetForm);

  const params = new URLSearchParams(location.search);
  const sessaoPreselecionada = params.get("sessao");
  loadSelects();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const sessoes = getData(STORAGE_KEYS.sessoes);
    const editedId = form.id.value;

    if (editedId) {
      const index = sessoes.findIndex((item) => item.id === editedId);
      if (index !== -1) {
        sessoes[index] = {
          ...sessoes[index],
          filmeId: form.filme.value,
          salaId: form.sala.value,
          dataHora: form.dataHora.value,
          preco: form.preco.value,
          idioma: form.idioma.value,
          formato: form.formato.value,
        };
        saveData(STORAGE_KEYS.sessoes, sessoes);
        showAlert("alertaSessoes", "Sessão atualizada com sucesso!");
      }
    } else {
      const novo = {
        id: uid(),
        filmeId: form.filme.value,
        salaId: form.sala.value,
        dataHora: form.dataHora.value,
        preco: form.preco.value,
        idioma: form.idioma.value,
        formato: form.formato.value,
      };
      sessoes.push(novo);
      saveData(STORAGE_KEYS.sessoes, sessoes);
      showAlert("alertaSessoes", "Sessão salva com sucesso!");
    }

    resetForm();
    render();
  });

  if (sessaoPreselecionada) {
    const sessoes = getData(STORAGE_KEYS.sessoes);
    const sessao = sessoes.find(s => s.id === sessaoPreselecionada);
    if (sessao) {
      form.filme.value = sessao.filmeId;
      form.sala.value = sessao.salaId;
      form.dataHora.value = sessao.dataHora;
      form.preco.value = sessao.preco;
      form.idioma.value = sessao.idioma;
      form.formato.value = sessao.formato;
    }
  }

  render();
}

function initVendaIngressos() {
  const form = document.getElementById("formIngressos");
  if (!form) return;

  const sessaoSelect = document.getElementById("sessao");
  const lista = document.getElementById("listaIngressos");
  const submitButton = form.querySelector('button[type="submit"]');
  const cancelButton = document.getElementById("cancelarIngresso");

  function loadSessaoSelect(selectedValue) {
    const sessoes = getData(STORAGE_KEYS.sessoes);
    const filmes = getData(STORAGE_KEYS.filmes);
    const salas = getData(STORAGE_KEYS.salas);

    setOptions(sessaoSelect, sessoes, {
      placeholder: "Selecione uma sessão",
      labelFn: (s) => {
        const filme = filmes.find(f => f.id === s.filmeId);
        const sala = salas.find(x => x.id === s.salaId);
        return `${filme ? filme.titulo : "Filme"} | ${sala ? sala.nome : "Sala"} | ${formatDateTime(s.dataHora)}`;
      },
      valueFn: (s) => s.id,
      selectedValue,
    });
  }

  function resetForm() {
    form.reset();
    if (form.id) form.id.value = "";
    if (submitButton) submitButton.textContent = "Confirmar Venda";
    if (cancelButton) cancelButton.classList.add("d-none");
    loadSessaoSelect();
  }

  function render() {
    const ingressos = getData(STORAGE_KEYS.ingressos);
    const sessoes = getData(STORAGE_KEYS.sessoes);
    const filmes = getData(STORAGE_KEYS.filmes);
    const salas = getData(STORAGE_KEYS.salas);

    if (lista) {
      lista.innerHTML = ingressos.length ? ingressos.map((i, index) => {
        const sessao = sessoes.find(s => s.id === i.sessaoId);
        const filme = sessao ? filmes.find(f => f.id === sessao.filmeId) : null;
        const sala = sessao ? salas.find(x => x.id === sessao.salaId) : null;
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${filme ? filme.titulo : "—"} / ${sala ? sala.nome : "—"} / ${sessao ? formatDateTime(sessao.dataHora) : "—"}</td>
            <td>${i.cliente}</td>
            <td>${i.cpf}</td>
            <td>${i.assento}</td>
            <td>${i.pagamento}</td>
            <td>
              <button type="button" class="btn btn-sm btn-outline-primary btn-edit-ingresso" data-id="${i.id}">Alterar</button>
              <button type="button" class="btn btn-sm btn-outline-danger btn-delete-ingresso ms-2" data-id="${i.id}">Excluir</button>
            </td>
          </tr>
        `;
      }).join("") : `<tr><td colspan="7" class="text-center text-muted py-4">Nenhuma venda registrada.</td></tr>`;
    }
    renderCounts();
  }

  lista?.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    const id = button.dataset.id;
    if (!id) return;

    const ingressos = getData(STORAGE_KEYS.ingressos);
    const ingresso = ingressos.find((item) => item.id === id);
    if (!ingresso) return;

    if (button.classList.contains("btn-edit-ingresso")) {
      form.id.value = ingresso.id;
      form.sessao.value = ingresso.sessaoId;
      form.cliente.value = ingresso.cliente;
      form.cpf.value = ingresso.cpf;
      form.assento.value = ingresso.assento;
      form.pagamento.value = ingresso.pagamento;
      if (submitButton) submitButton.textContent = "Atualizar Venda";
      if (cancelButton) cancelButton.classList.remove("d-none");
      return;
    }

    if (button.classList.contains("btn-delete-ingresso")) {
      if (!confirm("Deseja excluir esta venda?")) return;
      const atualizados = ingressos.filter((item) => item.id !== id);
      saveData(STORAGE_KEYS.ingressos, atualizados);
      if (form.id && form.id.value === id) resetForm();
      showAlert("alertaIngressos", "Venda excluída com sucesso!", "warning");
      render();
    }
  });

  cancelButton?.addEventListener("click", resetForm);

  const params = new URLSearchParams(location.search);
  const sessaoPreselecionada = params.get("sessao");
  loadSessaoSelect(sessaoPreselecionada);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ingressos = getData(STORAGE_KEYS.ingressos);
    const editedId = form.id.value;

    if (editedId) {
      const index = ingressos.findIndex((item) => item.id === editedId);
      if (index !== -1) {
        ingressos[index] = {
          ...ingressos[index],
          sessaoId: form.sessao.value,
          cliente: form.cliente.value.trim(),
          cpf: form.cpf.value.trim(),
          assento: form.assento.value.trim().toUpperCase(),
          pagamento: form.pagamento.value,
        };
        saveData(STORAGE_KEYS.ingressos, ingressos);
        showAlert("alertaIngressos", "Venda atualizada com sucesso!");
      }
    } else {
      const novo = {
        id: uid(),
        sessaoId: form.sessao.value,
        cliente: form.cliente.value.trim(),
        cpf: form.cpf.value.trim(),
        assento: form.assento.value.trim().toUpperCase(),
        pagamento: form.pagamento.value,
        criadoEm: new Date().toISOString(),
      };
      ingressos.push(novo);
      saveData(STORAGE_KEYS.ingressos, ingressos);
      showAlert("alertaIngressos", "Venda confirmada com sucesso!");
    }

    resetForm();
    render();
  });

  render();
}

function initSessoesDisponiveis() {
  const container = document.getElementById("listaDisponiveis");
  if (!container) return;

  const sessoes = getData(STORAGE_KEYS.sessoes);
  const filmes = getData(STORAGE_KEYS.filmes);
  const salas = getData(STORAGE_KEYS.salas);

  if (!sessoes.length) {
    container.innerHTML = `<div class="alert alert-warning">Nenhuma sessão disponível no momento.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="row g-4">
      ${sessoes.map(s => {
        const filme = filmes.find(f => f.id === s.filmeId);
        const sala = salas.find(x => x.id === s.salaId);
        return `
          <div class="col-12 col-lg-6">
            <div class="card card-shadow h-100">
              <div class="card-body">
                <h5 class="card-title mb-2">${filme ? filme.titulo : "Filme não encontrado"}</h5>
                <p class="mb-1"><strong>Sala:</strong> ${sala ? sala.nome : "—"}</p>
                <p class="mb-1"><strong>Data e hora:</strong> ${formatDateTime(s.dataHora)}</p>
                <p class="mb-3"><strong>Preço:</strong> ${money(s.preco)}</p>
                <a class="btn btn-primary" href="venda-ingressos.html?sessao=${s.id}">Comprar ingresso</a>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function initIndex() {
  renderCounts();
  const limpar = document.getElementById("btnLimparDados");
  if (limpar) {
    limpar.addEventListener("click", () => {
      if (confirm("Deseja apagar todos os dados salvos no navegador?")) {
        localStorage.removeItem(STORAGE_KEYS.filmes);
        localStorage.removeItem(STORAGE_KEYS.salas);
        localStorage.removeItem(STORAGE_KEYS.sessoes);
        localStorage.removeItem(STORAGE_KEYS.ingressos);
        renderCounts();
        alert("Dados apagados.");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderMenu();
  initIndex();
  initFilmes();
  initSalas();
  initSessoesCadastro();
  initVendaIngressos();
  initSessoesDisponiveis();
});
