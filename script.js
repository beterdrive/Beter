document.addEventListener('DOMContentLoaded', () => {

    const products = [
        { id: 1, name: 'NovaBook Pro 15', price: 1499.99, image: 'assets/laptop1.WebP', brand: 'NovaBook', processor: 'Core i7', ram: 16, description: 'The NovaBook Pro 15 is a powerhouse for creative professionals. With its stunning 15-inch Retina display, it handles demanding tasks with ease.' },
        { id: 2, name: 'TechLord Blade X', price: 2199.99, image: 'assets/laptop2.WebP', brand: 'TechLord', processor: 'Core i9', ram: 32, description: 'Unleash peak gaming performance with the Blade X. Featuring a top-tier Core i9 CPU and advanced cooling, it\'s built for victory.' },
        { id: 3, name: 'Quantum Lite 13', price: 999.99, image: 'assets/laptop3.WebP', brand: 'Quantum', processor: 'Core i5', ram: 8, description: 'Sleek, lightweight, and powerful. The Quantum Lite 13 is the perfect companion for productivity on the go, with all-day battery life.' },
        { id: 4, name: 'FusionPad Ultra', price: 1899.00, image: 'assets/laptop4.WebP', brand: 'Fusion', processor: 'Core i7', ram: 16, description: 'Versatility meets performance. The FusionPad Ultra is a 2-in-1 convertible that adapts to your workflow, from laptop to tablet in a flip.' },
        { id: 5, name: 'NovaBook Air', price: 1250.00, image: 'assets/laptop5.WebP', brand: 'NovaBook', processor: 'Core i5', ram: 8, description: 'Experience elegance and efficiency with the impossibly thin NovaBook Air. Perfect for everyday tasks with a touch of luxury.' },
        { id: 6, name: 'TechLord Stealth', price: 2500.00, image: 'assets/laptop6.WebP', brand: 'TechLord', processor: 'Core i9', ram: 32, description: 'A creator\'s dream machine. The TechLord Stealth offers a massive high-resolution screen and immense power for video editing and 3D rendering.' },
    ];

    let cart = [];

    const container = document.querySelector('.container');
    const productGrid = document.querySelector('.product-grid');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const cartSummary = document.querySelector('.cart-summary');
    const cartCountElement = document.querySelector('.cart-count');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const totalPriceElement = document.getElementById('total-price');
    const filters = document.querySelectorAll('.filters input[type="checkbox"]');
    const priceRange = document.getElementById('price-range');
    const priceRangeValue = document.getElementById('price-range-value');
    const sortBy = document.getElementById('sort-by');
    const clearFiltersBtn = document.querySelector('.clear-filters-btn');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCartBtn = document.querySelector('.close-cart-btn');

    // Modal elements
    const modal = document.getElementById('product-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Audio context for sound effects
    let audioContext;
    let addToCartBuffer;

    function initAudio() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch('add-to-cart.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                addToCartBuffer = audioBuffer;
            });
    }

    function playSound(buffer) {
        if (!audioContext || !buffer) return;
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
    
    document.body.addEventListener('click', initAudio, { once: true });

    // Filter and Sort Products
    function updateProductDisplay() {
        renderSkeletonLoader();

        setTimeout(() => {
            let filteredProducts = [...products];

            // Filtering logic
            const activeFilters = {};
            document.querySelectorAll('.filters input[type="checkbox"]:checked').forEach(input => {
                const filterType = input.dataset.filter;
                if (!activeFilters[filterType]) {
                    activeFilters[filterType] = [];
                }
                activeFilters[filterType].push(input.value);
            });

            const maxPrice = parseFloat(priceRange.value);

            filteredProducts = filteredProducts.filter(product => {
                if (product.price > maxPrice) return false;

                for (const type in activeFilters) {
                    let value = product[type];
                    if (type === 'ram') value = value.toString();
                    if (activeFilters[type].length > 0 && !activeFilters[type].includes(value)) {
                        return false;
                    }
                }
                return true;
            });
            
            // Sorting logic
            const sortValue = sortBy.value;
            if (sortValue === 'price-asc') {
                filteredProducts.sort((a, b) => a.price - b.price);
            } else if (sortValue === 'price-desc') {
                filteredProducts.sort((a, b) => b.price - a.price);
            } else if (sortValue === 'name-asc') {
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortValue === 'name-desc') {
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            }

            renderProducts(filteredProducts);
        }, 300); // Simulate loading
    }

    function renderSkeletonLoader() {
        productGrid.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'product-card skeleton';
            skeletonCard.innerHTML = `
                <div class="skeleton-img"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-btn"></div>
            `;
            productGrid.appendChild(skeletonCard);
        }
    }

    // Render Products
    function renderProducts(productsToRender) {
        productGrid.innerHTML = '';
        if (productsToRender.length === 0) {
            productGrid.innerHTML = `<p class="no-products-found">No products match your criteria.</p>`;
            return;
        }
        productsToRender.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.animationDelay = `${index * 0.05}s`;
            productCard.dataset.productId = product.id;
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            `;
            productGrid.appendChild(productCard);
        });
    }

    // Render Cart
    function renderCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = ''; // Clear items
            if (!cartItemsContainer.contains(emptyCartMessage)) {
                cartItemsContainer.appendChild(emptyCartMessage);
            }
            emptyCartMessage.style.display = 'flex';
            cartSummary.classList.add('hidden');
        } else {
            if (cartItemsContainer.contains(emptyCartMessage)) {
                emptyCartMessage.style.display = 'none';
            }
            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const product = products.find(p => p.id === item.id);
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.dataset.id = product.id;
                cartItem.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <p>$${product.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn" data-action="decrease">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" data-action="increase">+</button>
                        </div>
                    </div>
                    <button class="remove-item-btn" data-id="${product.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });
            cartSummary.classList.remove('hidden');
        }
        updateCartInfo();
    }
    
    // Update Cart Info (Count and Totals)
    function updateCartInfo() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        if (totalItems > 0) {
            cartCountElement.classList.add('visible');
        } else {
            cartCountElement.classList.remove('visible');
        }

        const subtotal = cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.id);
            return total + (product.price * item.quantity);
        }, 0);
        subtotalPriceElement.textContent = `$${subtotal.toFixed(2)}`;
        totalPriceElement.textContent = `$${subtotal.toFixed(2)}`; // Assuming shipping is free
    }

    function flyToCartAnimation(targetElement) {
        const productCard = targetElement.closest('.product-card') || document.querySelector(`[data-product-id='${targetElement.dataset.id}']`);
        const productImg = productCard.querySelector('.product-image');
        
        // Handle animation from modal
        if (modal.classList.contains('active')) {
             const modalImg = document.getElementById('modal-img');
             const imgRect = modalImg.getBoundingClientRect();
             const cartIconRect = document.querySelector('.cart-icon').getBoundingClientRect();
             createFlyingImage(modalImg.src, imgRect, cartIconRect);
        } else {
            const imgRect = productImg.getBoundingClientRect();
            const cartIconRect = document.querySelector('.cart-icon').getBoundingClientRect();
            createFlyingImage(productImg.src, imgRect, cartIconRect);
        }
    }

    function createFlyingImage(src, startRect, endRect) {
        const flyingImg = document.createElement('img');
        flyingImg.src = src;
        flyingImg.className = 'flying-image';
        flyingImg.style.top = `${startRect.top}px`;
        flyingImg.style.left = `${startRect.left}px`;
        flyingImg.style.width = `${startRect.width}px`;
        flyingImg.style.height = `${startRect.height}px`;

        document.body.appendChild(flyingImg);

        requestAnimationFrame(() => {
            flyingImg.style.transform = `translate(${endRect.left - startRect.left}px, ${endRect.top - startRect.top}px) scale(0.1)`;
            flyingImg.style.opacity = '0';
        });

        flyingImg.addEventListener('transitionend', () => {
            flyingImg.remove();
            cartCountElement.classList.add('updated');
            setTimeout(() => cartCountElement.classList.remove('updated'), 300);
        });
    }

    function openModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('modal-img').src = product.image;
        document.getElementById('modal-name').textContent = product.name;
        document.getElementById('modal-brand').textContent = `Brand: ${product.brand}`;
        document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
        document.getElementById('modal-desc').textContent = product.description;
        
        const specsList = document.getElementById('modal-specs-list');
        specsList.innerHTML = `
            <li><strong>Processor:</strong> ${product.processor}</li>
            <li><strong>RAM:</strong> ${product.ram}GB</li>
        `;

        modal.querySelector('.add-to-cart-btn').dataset.id = product.id;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => modal.classList.add('active'), 10);
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    // Event Delegation
    document.body.addEventListener('click', (e) => {
        // Add to Cart
        if (e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(e.target.dataset.id);
            const cartItem = cart.find(item => item.id === productId);

            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ id: productId, quantity: 1 });
            }
            
            flyToCartAnimation(e.target);
            playSound(addToCartBuffer);
            renderCart();
            if (!container.classList.contains('cart-open')) {
                container.classList.add('cart-open');
            }
        }

        // Open product modal
        const productCard = e.target.closest('.product-card:not(.skeleton)');
        if (productCard && !e.target.classList.contains('add-to-cart-btn')) {
            const productId = parseInt(productCard.dataset.productId);
            openModal(productId);
        }

        // Remove from Cart
        if (e.target.classList.contains('remove-item-btn')) {
            const productId = parseInt(e.target.dataset.id);
            cart = cart.filter(item => item.id !== productId);
            renderCart();
        }

        // Quantity controls
        if (e.target.classList.contains('quantity-btn')) {
            const action = e.target.dataset.action;
            const cartItemDiv = e.target.closest('.cart-item');
            const productId = parseInt(cartItemDiv.dataset.id);
            const itemInCart = cart.find(item => item.id === productId);

            if (itemInCart) {
                if (action === 'increase') {
                    itemInCart.quantity++;
                } else if (action === 'decrease') {
                    itemInCart.quantity--;
                    if (itemInCart.quantity <= 0) {
                        cart = cart.filter(item => item.id !== productId);
                    }
                }
                renderCart();
            }
        }
    });
    
    // Filter and Sort Event Listeners
    filters.forEach(input => input.addEventListener('change', updateProductDisplay));
    sortBy.addEventListener('change', updateProductDisplay);
    priceRange.addEventListener('input', () => {
        priceRangeValue.textContent = `$${priceRange.value}`;
    });
    priceRange.addEventListener('change', updateProductDisplay);

    clearFiltersBtn.addEventListener('click', () => {
        filters.forEach(input => input.checked = false);
        priceRange.value = priceRange.max;
        priceRangeValue.textContent = `$${priceRange.max}`;
        sortBy.value = 'default';
        updateProductDisplay();
    });

    // Cart Toggle Listeners
    cartIcon.addEventListener('click', () => container.classList.add('cart-open'));
    closeCartBtn.addEventListener('click', () => container.classList.remove('cart-open'));

    // Modal Close Listeners
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Initial Render
    updateProductDisplay();
    renderCart();
});