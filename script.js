(function() {
    'use strict';

    // ===== DATA =====
    const products = [{
        id: 1,
        name: 'Beras Premium',
        desc: '1 kg · pulen & wangi',
        price: 15000,
        icon: 'fa-solid fa-seedling',
        unit: 'kg'
    }, {
        id: 2,
        name: 'Telur Segar',
        desc: '1 kg · grade A',
        price: 20000,
        icon: 'fa-solid fa-egg',
        unit: 'kg'
    }, {
        id: 3,
        name: 'Bawang Merah & Putih',
        desc: '1 kg · campuran premium',
        price: 30000,
        icon: 'fa-solid fa-pepper',
        unit: 'kg'
    }];

    const testimonials = [{
        id: 1,
        name: 'Bu Ratna',
        role: 'Pemilik Warung Makan',
        text: 'Berasnya pulen, telur selalu segar. Pelayanan cepat dan ramah. Langganan banget!',
        avatar: 'R'
    }, {
        id: 2,
        name: 'Mas Andre',
        role: 'Chef & Hobi Masak',
        text: 'Bawang merah putihnya wangi dan berkualitas. Harga bersahabat untuk usaha kecil.',
        avatar: 'A'
    }];

    // ===== STATE =====
    let cart = {};
    let isDark = false;
    let toastTimer = null;

    // ===== DOM REFS =====
    const productsGrid = document.getElementById('productsGrid');
    const testimonialsGrid = document.getElementById('testimonialsGrid');
    const cartContent = document.getElementById('cartContent');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cartBadge = document.getElementById('cartBadge');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartPanel = document.getElementById('cartPanel');
    const cartOpenBtn = document.getElementById('cartOpenBtn');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const whatsappFloat = document.getElementById('whatsappFloat');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // ===== FORMAT RUPIAH =====
    function formatRupiah(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // ===== TOAST =====
    function showToast(msg, icon = 'fa-check-circle') {
        toastMessage.textContent = msg;
        toast.querySelector('i').className = 'fas ' + icon;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2400);
    }

    // ===== RENDER PRODUCTS =====
    function renderProducts() {
        productsGrid.innerHTML = products.map(p => {
            const qty = cart[p.id] || 0;
            return `
                <div class="product-card" data-id="${p.id}">
                    <div class="product-icon"><i class="${p.icon}"></i></div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <div class="desc">${p.desc}</div>
                        <div class="price">${formatRupiah(p.price)}</div>
                    </div>
                    <div class="product-actions">
                        ${qty === 0 ? `
                            <button class="btn-primary add-btn" data-id="${p.id}">
                                <i class="fas fa-plus"></i> Tambah
                            </button>
                        ` : `
                            <div class="qty-control">
                                <button class="qty-dec" data-id="${p.id}">−</button>
                                <span>${qty}</span>
                                <button class="qty-inc" data-id="${p.id}">+</button>
                            </div>
                            <div class="product-total">${formatRupiah(p.price * qty)}</div>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Event listeners for product buttons
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                addToCart(id);
            });
        });

        document.querySelectorAll('.qty-inc').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                addToCart(id);
            });
        });

        document.querySelectorAll('.qty-dec').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                removeFromCart(id);
            });
        });
    }

    // ===== RENDER TESTIMONIALS =====
    function renderTestimonials() {
        testimonialsGrid.innerHTML = testimonials.map(t => `
            <div class="testimonial-card">
                <div class="stars"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div>
                <blockquote>“${t.text}”</blockquote>
                <div class="author">
                    <div class="avatar">${t.avatar}</div>
                    <div>
                        <div class="name">${t.name}</div>
                        <div class="role">${t.role}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ===== CART OPERATIONS =====
    function addToCart(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        if (!cart[id]) cart[id] = 0;
        cart[id]++;
        updateUI();
        showToast(`${product.name} ditambahkan ke keranjang`);
        updateWhatsappLink();
    }

    function removeFromCart(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        if (cart[id] && cart[id] > 0) {
            cart[id]--;
            if (cart[id] === 0) delete cart[id];
            updateUI();
            if (cart[id] !== undefined) {
                showToast(`${product.name} dikurangi`);
            } else {
                showToast(`${product.name} dihapus dari keranjang`, 'fa-trash');
            }
            updateWhatsappLink();
        }
    }

    function removeItemCompletely(id) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        delete cart[id];
        updateUI();
        showToast(`${product.name} dihapus`, 'fa-trash');
        updateWhatsappLink();
    }

    function getTotalItems() {
        return Object.values(cart).reduce((a, b) => a + b, 0);
    }

    function getTotalPrice() {
        let total = 0;
        for (const [id, qty] of Object.entries(cart)) {
            const p = products.find(pr => pr.id === parseInt(id));
            if (p) total += p.price * qty;
        }
        return total;
    }

    function getCartItems() {
        const items = [];
        for (const [id, qty] of Object.entries(cart)) {
            const p = products.find(pr => pr.id === parseInt(id));
            if (p) items.push({ ...p, qty });
        }
        return items;
    }

    // ===== UPDATE UI =====
    function updateUI() {
        // Badge
        const totalItems = getTotalItems();
        if (totalItems > 0) {
            cartBadge.textContent = totalItems;
            cartBadge.classList.remove('hidden');
        } else {
            cartBadge.classList.add('hidden');
        }

        // Cart content
        const items = getCartItems();
        if (items.length === 0) {
            cartContent.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-basket"></i>
                    <p>Keranjang masih kosong.<br />Yuk, mulai belanja!</p>
                </div>
            `;
            cartFooter.classList.add('hidden');
        } else {
            cartContent.innerHTML = `
                <div class="cart-items">
                    ${items.map(item => `
                        <div class="cart-item">
                            <div class="ci-icon"><i class="${item.icon}"></i></div>
                            <div class="ci-info">
                                <h4>${item.name}</h4>
                                <div class="ci-price">${formatRupiah(item.price)}</div>
                            </div>
                            <div class="ci-qty">
                                <button class="ci-dec" data-id="${item.id}">−</button>
                                <span>${item.qty}</span>
                                <button class="ci-inc" data-id="${item.id}">+</button>
                            </div>
                            <button class="ci-remove" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                        </div>
                    `).join('')}
                </div>
            `;
            cartFooter.classList.remove('hidden');
            cartTotalPrice.textContent = formatRupiah(getTotalPrice());

            // Cart item events
            document.querySelectorAll('.ci-inc').forEach(btn => {
                btn.addEventListener('click', function() {
                    addToCart(parseInt(this.dataset.id));
                });
            });
            document.querySelectorAll('.ci-dec').forEach(btn => {
                btn.addEventListener('click', function() {
                    removeFromCart(parseInt(this.dataset.id));
                });
            });
            document.querySelectorAll('.ci-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    removeItemCompletely(parseInt(this.dataset.id));
                });
            });
        }

        // Re-render products to reflect qty
        renderProducts();
        updateWhatsappLink();
    }

    // ===== WHATSAPP LINK =====
    function updateWhatsappLink() {
        const items = getCartItems();
        if (items.length === 0) {
            whatsappFloat.href = '#';
            return;
        }
        let message = 'Halo Asa Sipaling Asa! Saya mau pesan:%0A%0A';
        let total = 0;
        items.forEach(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            message += `- ${item.name} (${item.qty} ${item.unit}) = ${formatRupiah(subtotal)}%0A`;
        });
        message += `%0A*Total: ${formatRupiah(total)}*%0A%0AMohon diproses ya, terima kasih! 🙏`;

        const encoded = encodeURIComponent(message);
        whatsappFloat.href = `https://wa.me/6281234567890?text=${encoded}`;
    }

    // ===== CART PANEL =====
    function openCart() {
        cartOverlay.classList.add('open');
        cartPanel.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartOverlay.classList.remove('open');
        cartPanel.classList.remove('open');
        document.body.style.overflow = '';
    }

    cartOpenBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Close on escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeCart();
    });

    // ===== CHECKOUT =====
    checkoutBtn.addEventListener('click', function() {
        const items = getCartItems();
        if (items.length === 0) return;
        const link = whatsappFloat.href;
        if (link && link !== '#') {
            window.open(link, '_blank');
            closeCart();
        } else {
            showToast('Tambahkan produk dulu ya!', 'fa-info-circle');
        }
    });

    // ===== THEME TOGGLE =====
    function setTheme(dark) {
        isDark = dark;
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        themeIcon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
        localStorage.setItem('asa-theme', dark ? 'dark' : 'light');
    }

    themeToggle.addEventListener('click', function() {
        setTheme(!isDark);
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('asa-theme');
    if (savedTheme === 'dark') {
        setTheme(true);
    } else if (savedTheme === 'light') {
        setTheme(false);
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme(true);
        } else {
            setTheme(false);
        }
    }

    // ===== INIT =====
    renderProducts();
    renderTestimonials();
    updateUI();

    console.log('🛒 Asa Sipaling Asa — Toko Sembako siap!');
})();