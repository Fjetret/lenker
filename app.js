// Innlogging
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminSection').style.display = 'block';
            loadArticles();
        })
        .catch(error => alert('Feil ved innlogging: ' + error.message));
}

// Lagre artikkel
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
        alert('Artikkel lagret!');
        loadArticles();
        // Tøm skjema
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('productLink').value = '';
        document.getElementById('imageUrl').value = '';
    })
    .catch(error => alert('Feil ved lagring: ' + error.message));
}

// Last artikler
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
                        <a href="${article.productLink}">Produktlenke</a>
                        <img src="${article.imageUrl}" alt="${article.title}">
                        <button onclick="deleteArticle('${doc.id}')">Slett</button>
                    </div>
                `;
            });
        });
}

// Slett artikkel
function deleteArticle(id) {
    if (confirm('Er du sikker på at du vil slette denne artikkelen?')) {
        db.collection('articles').doc(id).delete()
            .then(() => {
                alert('Artikkel slettet!');
                loadArticles();
            })
            .catch(error => alert('Feil ved sletting: ' + error.message));
    }
}

// Sjekk innloggingsstatus
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
