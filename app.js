// Global variables for managing state
let currentTags = new Set();
let productLinks = [];

// Login
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        loadArticles();
    } catch (error) {
        alert('Login error: ' + error.message);
    }
}

// Show new article form
function showNewArticleForm() {
    document.getElementById('articleForm').style.display = 'block';
    // Reset form
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('featuredImage').value = '';
    tinymce.get('content').setContent('');
    document.getElementById('featuredImagePreview').innerHTML = '';
    document.getElementById('seoTitle').value = '';
    document.getElementById('seoDescription').value = '';
    document.getElementById('seoKeywords').value = '';
    currentTags.clear();
    productLinks = [];
    updateTagsDisplay();
    updateProductLinksDisplay();
}

// Handle image URL preview
function handleImageUrl() {
    const imageUrl = document.getElementById('featuredImage').value;
    if (imageUrl) {
        document.getElementById('featuredImagePreview').innerHTML = `
            <img src="${imageUrl}" alt="Featured image preview">
        `;
    }
}

// Add product link
function addProductLink() {
    const nameInput = document.querySelector('.product-link-item .product-name');
    const urlInput = document.querySelector('.product-link-item .product-url');
    const priceInput = document.querySelector('.product-link-item .product-price');

    if (nameInput.value && urlInput.value) {
        productLinks.push({
            name: nameInput.value,
            url: urlInput.value,
            price: priceInput.value
        });

        nameInput.value = '';
        urlInput.value = '';
        priceInput.value = '';

        updateProductLinksDisplay();
    }
}

// Update product links display
function updateProductLinksDisplay() {
    const container = document.getElementById('productLinksContainer');
    const linksHtml = productLinks.map((link, index) => `
        <div class="product-link-display">
            <span>${link.name} - ${link.price}</span>
            <button onclick="removeProductLink(${index})" class="btn-remove">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="product-links-list">${linksHtml}</div>
        <div class="product-link-item">
            <input type="text" placeholder="Product Name" class="product-name">
            <input type="url" placeholder="Product URL" class="product-url">
            <input type="text" placeholder="Price" class="product-price">
            <button onclick="addProductLink()" class="btn-add">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
}

// Remove product link
function removeProductLink(index) {
    productLinks.splice(index, 1);
    updateProductLinksDisplay();
}

// Handle tags
function handleTagInput(event) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const tagInput = document.getElementById('tagInput');
        const tag = tagInput.value.trim().replace(',', '');
        
        if (tag && !currentTags.has(tag)) {
            currentTags.add(tag);
            updateTagsDisplay();
        }
        
        tagInput.value = '';
    }
}

// Update tags display
function updateTagsDisplay() {
    const container = document.getElementById('tagsContainer');
    container.innerHTML = Array.from(currentTags).map(tag => `
        <span class="tag">
            ${tag}
            <button onclick="removeTag('${tag}')" class="btn-remove-tag">
                <i class="fas fa-times"></i>
            </button>
        </span>
    `).join('');
}

// Remove tag
function removeTag(tag) {
    currentTags.delete(tag);
    updateTagsDisplay();
}

// Preview article
function previewArticle() {
    const title = document.getElementById('title').value;
    const content = tinymce.get('content').getContent();
    const description = document.getElementById('description').value;
    const featuredImage = document.getElementById('featuredImage').value;

    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <html>
            <head>
                <title>${title}</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
                <div class="article-preview">
                    ${featuredImage ? `<img src="${featuredImage}" alt="${title}" class="featured-image">` : ''}
                    <h1>${title}</h1>
                    <div class="article-description">${description}</div>
                    <div class="article-content">${content}</div>
                    
                    ${productLinks.length > 0 ? `
                        <div class="product-links-section">
                            <h2>Related Products</h2>
                            ${productLinks.map(link => `
                                <div class="product-link">
                                    <a href="${link.url}" target="_blank">${link.name}</a>
                                    ${link.price ? `<span class="price">${link.price}</span>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </body>
        </html>
    `);
}

// Save article
async function saveArticle() {
    const title = document.getElementById('title').value;
    const content = tinymce.get('content').getContent();
    const description = document.getElementById('description').value;
    const featuredImage = document.getElementById('featuredImage').value;
    const seoTitle = document.getElementById('seoTitle').value;
    const seoDescription = document.getElementById('seoDescription').value;
    const seoKeywords = document.getElementById('seoKeywords').value;

    if (!title || !content) {
        alert('Please fill in at least the title and content');
        return;
    }

    try {
        await addDoc(collection(db, 'articles'), {
            title,
            content,
            description,
            featuredImage,
            productLinks,
            tags: Array.from(currentTags),
            seo: {
                title: seoTitle,
                description: seoDescription,
                keywords: seoKeywords
            },
            createdAt: new Date()
        });

        alert('Article saved successfully!');
        loadArticles();
        document.getElementById('articleForm').style.display = 'none';
    } catch (error) {
        alert('Error saving article: ' + error.message);
    }
}

// Load articles
async function loadArticles() {
    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = '';

    try {
        const querySnapshot = await getDocs(query(collection(db, 'articles'), orderBy('createdAt', 'desc')));
        querySnapshot.forEach((doc) => {
            const article = doc.data();
            articlesList.innerHTML += `
                <div class="article-card">
                    ${article.featuredImage ? `
                        <img src="${article.featuredImage}" alt="${article.title}">
                    ` : ''}
                    <div class="article-card-content">
                        <h3>${article.title}</h3>
                        <p>${article.description || ''}</p>
                        <div class="article-tags">
                            ${(article.tags || []).map(tag => `
                                <span class="tag">${tag}</span>
                            `).join('')}
                        </div>
                        <div class="article-actions">
                            <button onclick="editArticle('${doc.id}')" class="btn-secondary">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="deleteArticle('${doc.id}')" class="btn-danger">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading articles:', error);
    }
}

// Delete article
async function deleteArticle(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        try {
            await deleteDoc(doc(db, 'articles', id));
            alert('Article deleted successfully!');
            loadArticles();
        } catch (error) {
            alert('Error deleting article: ' + error.message);
        }
    }
}

// Edit article (to be implemented)
async function editArticle(id) {
    // Implementation for editing existing articles
    alert('Edit functionality coming soon!');
}

// Check login status
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        loadArticles();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('adminSection').style.display = 'none';
    }
});

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('featuredImage').addEventListener('input', handleImageUrl);
    document.getElementById('tagInput').addEventListener('keydown', handleTagInput);
});
