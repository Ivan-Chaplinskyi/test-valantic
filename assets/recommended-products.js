class RecommendedProducts extends HTMLElement {
    constructor() {
        super();
        this.url = this.dataset.url;
        this.sectionId = this.dataset.sectionId;
        this.recommendBlock = '#recommended-products';
    }

    removeSection() {
        const section = document.querySelector(this.sectionId);
        if (section) {
            section.remove();
        } else {
            console.warn('Section not found for removal.');
        }
    }

    parseDom(text) {
        const newDom = new DOMParser().parseFromString(text, 'text/html').querySelector(this.recommendBlock);
        const targetElement = this.querySelector(this.recommendBlock);
        
        if (newDom && targetElement) {
            targetElement.innerHTML = newDom.innerHTML;
        } else {
            console.warn('Recommended products block or target element not found.');
            this.removeSection();
        }
    }

    async fetchProducts() {
        try {
            const res = await fetch(this.url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.text();
        } catch(e) {
            console.error(`Error in fetchProducts(): ${e}`);
            this.removeSection();
        }
    }

    connectedCallback() {
        const loadingSpinner = document.querySelector(`${this.sectionId} .loading__spinner`);
        
        if (!loadingSpinner) {
            console.warn('Loading spinner not found.');
            return;
        }

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.fetchProducts()
                        .then(text => {
                            if (text) {
                                this.parseDom(text);
                                loadingSpinner.remove();
                                this.classList.remove('hidden');
                            }
                        })
                        .catch(error => console.error(`Error loading products: ${error}`));
                    
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        observer.observe(loadingSpinner);
    }
}

customElements.define('recommended-products', RecommendedProducts);
