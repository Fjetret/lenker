// Login
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminSection').style.display = 'block';
            loadArticles();
        })
        .catch(error => alert('Login error: ' + error.message));
}

// Save article
function saveArticle() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const productLink = document.getElementById('productLink').value;
    const imageUrl = document.getElementById('imageUrl').value;

    db.collection('articles').add({
        title,
        content,
        productLink,
        imageUrl,
        createdAt: new Date()
    })
    .then(() => {
        alert('Article saved successfully!');
        loadArticles();
        // Clear form
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('productLink').value = '';
        document.getElementById('imageUrl').value = '';
    })
    .catch(error => alert('Error saving article: ' + error.message));
}

// Load articles
function loadArticles() {
    const articlesList = document.getElementById('articlesList');
    articlesList.innerHTML = '';

    db.collection('articles').orderBy('createdAt', 'desc').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
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
        });
}

// Delete article
function deleteArticle(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        db.collection('articles').doc(id).delete()
            .then(() => {
                alert('Article deleted successfully!');
                loadArticles();
            })
            .catch(error => alert('Error deleting article: ' + error.message));
    }
}

// Check login status
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminSection').style.display = 'block';
        loadArticles();
    } else {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('adminSection').style.display = 'none';
    }
});
