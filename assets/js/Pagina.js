// ==========================================
// 1. ESTADO GLOBAL E DADOS
// ==========================================
let PRODUCTS = []; // Começa vazio, os dados virão da API Node.js

const state = {
  cart: [],
  query: '',
  sort: 'default'
};

// ==========================================
// 2. BUSCAR PRODUTOS NA API
// ==========================================
async function carregarProdutosDoBanco() {
    try {
        const resposta = await fetch('http://localhost:3000/api/produtos');
        if (!resposta.ok) throw new Error('Erro ao buscar produtos');
        
        PRODUCTS = await resposta.json();
        render(); // Atualiza a tela com os produtos que chegaram do banco
    } catch (erro) {
        console.error("Falha ao carregar o catálogo:", erro);
        toast("Erro ao carregar produtos. O servidor Node.js está ligado?");
    }
}

// Chama a função logo que a página abre
carregarProdutosDoBanco();

// ==========================================
// 3. UTILITÁRIOS (Formatadores e Toasts)
// ==========================================
const el = id => document.getElementById(id);
const formatPrice = val => 'R$ ' + Number(val).toFixed(2).replace('.', ',');

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg; 
  t.style.position = 'fixed'; 
  t.style.right = '18px'; 
  t.style.bottom = '18px'; 
  t.style.background = 'rgba(17,24,39,0.95)'; 
  t.style.color = 'white'; 
  t.style.padding = '10px 14px'; 
  t.style.borderRadius = '8px'; 
  t.style.zIndex = 9999; 
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = 0, 1200); 
  setTimeout(() => t.remove(), 2000);
}

// ==========================================
// 4. RENDERIZAÇÃO DA TELA
// ==========================================
function render() {
  // Filtrar e ordenar produtos pelo termo de busca
  let filtered = PRODUCTS.filter(p => 
      p.nome.toLowerCase().includes(state.query.toLowerCase())
  );
  
  const grid = el('productGrid');
  if (grid) {
      grid.innerHTML = '';
      filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
          <img src="${p.imagem_url || 'https://via.placeholder.com/640x400?text=Sem+Imagem'}" alt="${p.nome}">
          <div class="content">
            <h3>${p.nome}</h3>
            <p class="price">${formatPrice(p.preco)}</p>
            <div class="actions">
              <button class="botaoAdcionarAoCarrinho" onclick="addToCart(${p.id})">Adicionar ao carrinho</button>
            </div>
          </div>
        `;
        grid.appendChild(div);
      });
  }

  // Renderizar Carrinho
  const cList = el('cartList');
  if (cList) {
      cList.innerHTML = '';
      let total = 0;
      
      state.cart.forEach(item => {
        total += item.preco * item.qty;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
          <div>
            <h4>${item.nome}</h4>
            <p>${formatPrice(item.preco)} x ${item.qty}</p>
          </div>
          <button onclick="removeFromCart(${item.id})">Remover</button>
        `;
        cList.appendChild(div);
      });

      if(el('cartTotal')) el('cartTotal').textContent = formatPrice(total);
      if(el('cartCount')) el('cartCount').textContent = state.cart.reduce((s,i) => s + i.qty, 0);
  }
}

// ==========================================
// 5. LÓGICA DO CARRINHO (Adicionar/Remover)
// ==========================================
window.addToCart = function(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;
  
  const existing = state.cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...prod, qty: 1 });
  }
  toast('Adicionado ao carrinho!');
  render();
};

window.removeFromCart = function(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  render();
};

// ==========================================
// 6. AÇÕES DA INTERFACE E CHECKOUT (API)
// ==========================================
if(el('search')) el('search').addEventListener('input', (e) => { state.query = e.target.value; render(); });
if(el('sort')) el('sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
if(el('openCart')) el('openCart').addEventListener('click', () => { el('cartDrawer').style.display = 'flex'; });
if(el('closeCart')) el('closeCart').addEventListener('click', () => { el('cartDrawer').style.display = 'none'; });

// 🟢 BOTÃO DE FINALIZAR COMPRA PROTEGIDO
if(el('checkoutBtn')) el('checkoutBtn').addEventListener('click', async () => {
    if (state.cart.length === 0) return alert('Seu carrinho está vazio!');

    // Pega a pulseira VIP (Token JWT) salva no navegador do cliente
    const tokenDoUsuario = localStorage.getItem('glap_token');

    // Se ele não tiver o token, barra e manda pro login
    if (!tokenDoUsuario) {
        alert('Você precisa fazer login antes de finalizar a compra!');
        window.location.href = 'login.html';
        return;
    }

    const totalDoCarrinho = state.cart.reduce((s, i) => s + (i.preco * i.qty), 0);

    // Prepara o pacote de dados do pedido
    const dadosDoPedido = {
        valor_total: totalDoCarrinho,
        carrinho: state.cart.map(item => ({
            id: item.id,
            qty: item.qty,
            price: item.preco 
        }))
    };

    try {
        // Manda o pedido para o Segurança (API) avaliar
        const resposta = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': tokenDoUsuario // Mostrando a pulseira VIP!
            },
            body: JSON.stringify(dadosDoPedido)
        });

        const resultado = await resposta.json();

        // Se o segurança aprovar (Código 201)
        if (resposta.status === 201) {
            alert(`🎉 ${resultado.mensagem}\nO número do seu pedido é: #${resultado.numero_pedido}`);
            state.cart = []; // Esvazia o carrinho
            render();        // Atualiza a tela
            el('cartDrawer').style.display = 'none'; // Fecha a aba do carrinho
            
        // Se a pulseira for falsa ou tiver vencido (Código 401 ou 403)
        } else if (resposta.status === 401 || resposta.status === 403) {
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            localStorage.removeItem('glap_token'); // Arranca a pulseira vencida
            window.location.href = 'login.html';   // Manda logar de novo
            
        // Se der algum outro erro no servidor
        } else {
            alert("❌ Ocorreu um erro: " + (resultado.erro || "Falha desconhecida."));
        }
    } catch (erro) {
        console.error("Erro no checkout:", erro);
        alert("Erro de comunicação com o servidor. O back-end Node.js está rodando?");
    }
});