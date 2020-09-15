if (JSON.parse(localStorage.getItem('login'))) {
    document.querySelector('.sidebar a').outerHTML = '<a href="/account">Account</a>';
}