document.querySelector('.control > button').addEventListener('click',(e) => {
    location.href = `/docs/update/${document.querySelector('input[type=hidden]').value}`;
});
document.querySelector('form').addEventListener('submit',(e) => {
    e.preventDefault();
    if (confirm('Would you really delete document? Document is comes from one\'s hard effort!')) {
        e.target.submit();
    }
});