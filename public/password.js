const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
const pw = document.querySelectorAll('input[type=password]');
pw.forEach((input) => {
    input.addEventListener('input',(e) => {
        if (location.href.includes('signup')) {
            if (pw[0].value === pw[1].value && pw[0].value !== '' && regex.test(pw[0].value)) {
                document.querySelector('input[type=submit]').classList.remove('unav');
            } else {
                document.querySelector('input[type=submit]').classList.add('unav');
            }
        } else {
            if (pw[0].value === pw[1].value) {
                if (pw[0].value === '' || (regex.test(pw[0].value) && pw[0].value !== '')) {
                    document.querySelector('input[type=submit]').classList.remove('unav');
                } else {
                    document.querySelector('input[type=submit]').classList.add('unav');
                }
            } else {
                document.querySelector('input[type=submit]').classList.add('unav');
            }
        }
    });
});