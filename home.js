const readmorebtn = document.querySelector('.readmorebtn');
const text = document.querySelector('.text');

readmorebtn.addEventListener('click',(e)=>{
text.classList.toggle('showmore');
if(readmorebtn.innerHTML === '<span></span>Read More'){
    readmorebtn.innerHTML = '<span></span>Read Less';
    }else{
    readmorebtn.innerHTML = '<span></span>Read More';
    }
})
