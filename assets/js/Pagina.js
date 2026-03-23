 // Dados iniciais de produtos (você pode substituir por uma chamada API)
    const PRODUCTS = [
      { id:1, title:'Notebook Gamer ZX-15', category:'Notebooks', price:5999.90, stock:5, img:'https://via.placeholder.com/640x400?text=Notebook+ZX-15' },
      { id:2, title:'Mouse Óptico RGB X200', category:'Periféricos', price:129.90, stock:25, img:'https://via.placeholder.com/640x400?text=Mouse+RGB+X200' },
      { id:3, title:'Teclado Mecânico TKL', category:'Periféricos', price:349.00, stock:12, img:'https://via.placeholder.com/640x400?text=Teclado+Mecânico' },
      { id:4, title:'Monitor 27" 144Hz', category:'Monitores', price:1499.00, stock:8, img:'https://via.placeholder.com/640x400?text=Monitor+27' },
      { id:5, title:'SSD NVMe 1TB', category:'Armazenamento', price:499.90, stock:20, img:'https://via.placeholder.com/640x400?text=SSD+1TB' },
      { id:6, title:'Placa de Vídeo RTX Z', category:'Componentes', price:3499.00, stock:2, img:'https://via.placeholder.com/640x400?text=GPU+RTX+Z' },
      { id:7, title:'Fonte 650W 80+ Bronze', category:'Componentes', price:399.90, stock:10, img:'https://via.placeholder.com/640x400?text=Fonte+650W' },
      { id:8, title:'Headset Bluetooth Pro', category:'Áudio', price:249.90, stock:15, img:'https://via.placeholder.com/640x400?text=Headset+BT+Pro' }
    ];

    // estado simples em memória (poderia ser localStorage)
    let state = {
      query: '',
      category: 'Todos',
      sort: 'default',
      cart: JSON.parse(localStorage.getItem('demo_cart') || '[]')
    };

    const el = id => document.getElementById(id);

    // util para formatar preço em BRL
    function formatPrice(v){
      return v.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
    }

    // montar categorias
    function renderCategories(){
      const cats = ['Todos', ...Array.from(new Set(PRODUCTS.map(p=>p.category)))];
      const node = el('categories'); node.innerHTML='';
      cats.forEach(c=>{
        const btn = document.createElement('button');
        btn.textContent = c;
        btn.className = state.category === c ? 'active' : '';
        btn.onclick = ()=>{ state.category = c; render(); }
        node.appendChild(btn);
      })
    }

    // filtrar, ordenar e renderizar produtos
    function renderProducts(){
      const grid = el('productGrid');
      let list = PRODUCTS.slice();
      // busca
      if(state.query){
        const q = state.query.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      }
      // categoria
      if(state.category && state.category !== 'Todos') list = list.filter(p=>p.category===state.category);
      // ordenação
      if(state.sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
      if(state.sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
      if(state.sort === 'name') list.sort((a,b)=>a.title.localeCompare(b.title));

      el('shownCount').textContent = list.length;
      grid.innerHTML = '';
      list.forEach(p=>{
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = `
          <img src="${p.img}" alt="${p.title}">
          <h3>${p.title}</h3>
          <div class="meta"><div class="small">${p.category}</div><div class="price">${formatPrice(p.price)}</div></div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
            <div class="small">Estoque: ${p.stock}</div>
            <button class="add">Adicionar</button>
          </div>
        `;
        const btn = card.querySelector('.add');
        btn.onclick = ()=> addToCart(p.id);
        grid.appendChild(card);
      })
    }

    // carrinho
    function saveCart(){ localStorage.setItem('demo_cart', JSON.stringify(state.cart)); }
    function addToCart(productId){
      const prod = PRODUCTS.find(p=>p.id===productId);
      if(!prod) return alert('Produto não encontrado');
      const inCart = state.cart.find(it=>it.id===productId);
      if(inCart){
        if(inCart.qty + 1 > prod.stock) { alert('Sem estoque suficiente'); return }
        inCart.qty += 1;
      } else {
        state.cart.push({ id:prod.id, title:prod.title, price:prod.price, img:prod.img, qty:1, stock:prod.stock });
      }
      saveCart(); renderCart(); toast('Adicionado ao carrinho');
    }

    function removeFromCart(productId){ state.cart = state.cart.filter(i=>i.id!==productId); saveCart(); renderCart(); }
    function changeQty(productId, qty){
      const it = state.cart.find(i=>i.id===productId); if(!it) return;
      qty = Number(qty); if(qty < 1) return removeFromCart(productId);
      if(qty > it.stock){ alert('Quantidade maior que estoque.'); return }
      it.qty = qty; saveCart(); renderCart();
    }

    function renderCart(){
      el('cartCount').textContent = state.cart.reduce((s,i)=>s+i.qty,0);
      const list = el('cartList'); list.innerHTML='';
      if(state.cart.length === 0) list.innerHTML = '<div class="small">Seu carrinho está vazio.</div>';
      state.cart.forEach(item => {
        const row = document.createElement('div'); row.className='item';
        row.innerHTML = `
          <img src="${item.img}" alt="${item.title}" />
          <div style="flex:1">
            <div style="font-weight:600">${item.title}</div>
            <div class="small">${formatPrice(item.price)} • ${item.stock} em estoque</div>
            <div style="margin-top:6px;display:flex;gap:8px;align-items:center">
              <div class="qty">
                <button data-action="dec">-</button>
                <input type="number" value="${item.qty}" min="1" max="${item.stock}" style="width:56px;padding:6px;border-radius:6px;border:1px solid #e6eef7" />
                <button data-action="inc">+</button>
              </div>
              <button data-action="rm" style="background:transparent;border:0;color:#ef4444;cursor:pointer">Remover</button>
            </div>
          </div>
        `;
        // events
        row.querySelector('[data-action="dec"]').onclick = ()=> changeQty(item.id, item.qty - 1);
        row.querySelector('[data-action="inc"]').onclick = ()=> changeQty(item.id, item.qty + 1);
        row.querySelector('[data-action="rm"]').onclick = ()=> removeFromCart(item.id);
        row.querySelector('input').onchange = (e)=> changeQty(item.id, e.target.value);
        list.appendChild(row);
      });

      const total = state.cart.reduce((s,i)=>s + (i.price * i.qty), 0);
      el('cartTotal').textContent = formatPrice(total);
      el('cartCount').textContent = state.cart.reduce((s,i)=>s+i.qty,0);
    }

    // simples toast
    function toast(msg){
      const t = document.createElement('div');
      t.textContent = msg; t.style.position='fixed'; t.style.right='18px'; t.style.bottom='18px'; t.style.background='rgba(17,24,39,0.95)'; t.style.color='white'; t.style.padding='10px 14px'; t.style.borderRadius='8px'; t.style.zIndex=9999; document.body.appendChild(t);
      setTimeout(()=> t.style.opacity=0,1200); setTimeout(()=> t.remove(),2000);
    }

    // ações UI
    el('search').addEventListener('input', (e)=>{ state.query = e.target.value; render(); });
    el('sort').addEventListener('change', (e)=>{ state.sort = e.target.value; render(); });
    el('openCart').addEventListener('click', ()=> { el('cartDrawer').style.display='flex'; });
    el('closeCart').addEventListener('click', ()=> { el('cartDrawer').style.display='none'; });
    el('checkoutBtn').addEventListener('click', ()=>{
      if(state.cart.length===0) return alert('Seu carrinho está vazio');
      // checkout demo — aqui você poderia integrar com API de pagamento
      alert('Checkout (demo)\nTotal: ' + el('cartTotal').textContent + '\n\nObrigado pela sua compra fictícia!');
      state.cart = []; saveCart(); renderCart(); el('cartDrawer').style.display='none';
    });

    // render inicial
    function render(){ renderCategories(); renderProducts(); renderCart(); }
    render();