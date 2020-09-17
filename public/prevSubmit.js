document.querySelectorAll('input').forEach((inp) => {
    inp.addEventListener('keypress',(e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
});