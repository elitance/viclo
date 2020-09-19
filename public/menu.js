const tgg = document.querySelector('.toggle');
const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('.content');

tgg.addEventListener('click',(e) => {
    tgg.classList.toggle('toggle-on');
    sidebar.classList.toggle('sidebar-hidden');
    content.classList.toggle('content-expand')
});