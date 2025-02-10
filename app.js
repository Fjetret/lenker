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

// Save article
async function saveArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const productLink = document.getElementById('productLink').value;
    const imageUrl = document.getElementById('imageUrl').value;

    try {
        await addDoc(collection(db, 'articles'), {
            title,
            content,
            productLink,
            imageUrl,
            createdAt: new Date()
        });
        
        alert('Article saved successfully!');
        loadArticles();
        // Clear form
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('productLink').value = '';
        document.getElementById('imageUrl').value = '';
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
                <div class="article">
                    <h3>${article.title}</h3>
                    <p>${article.content}</p>
                    <a href="${article.productLink}">Product Link</a>
                    <img src="${article.imageUrl}" alt="${article.title}">
                    <button onclick="deleteArticle('${doc.id}')">Delete</button>
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
