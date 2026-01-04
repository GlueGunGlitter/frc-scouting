let score = 0;

const scoreSpan = document.getElementById("score");
const addPointBtn = document.getElementById("addPointBtn");
const removePointBtn =  document.getElementById("removePointBtn");

addPointBtn.addEventListener("click", () => {
    score++;
    scoreSpan.textContent = score;
    
});
removePointBtn.addEventListener("click", () => {
    if(score <= 0){
      
        return
    }else{    score--;
}
    
    scoreSpan.textContent = score;
    
});
