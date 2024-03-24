const { ipcRenderer } = require('electron');

const quit_button = document.getElementById("quit_button");
const back_button = document.getElementById("back_button");
const result = document.getElementById("result");

quit_button.addEventListener('click', async () => {
    await ipcRenderer.invoke('quit_test')
})

back_button.addEventListener('click', () => {
    document.location.assign("../index.html")
})

window.addEventListener("DOMContentLoaded", async () => {
    let test_result = await ipcRenderer.invoke('get_test_result')
    console.log(test_result)

    for(let i = 0; i < test_result.length; i++){
        let category = document.createElement('li');
        category.id = test_result[i].category
        category.innerHTML = `${test_result[i].category} : ${test_result[i].score}`;
        result.appendChild(category);
    }

});