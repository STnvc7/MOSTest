const { ipcRenderer } = require('electron');

const start_button = document.getElementById('start_button');
const setting_button = document.getElementById('setting_button');
const eval_button = document.getElementById('eval_button');
const test_selector = document.getElementById('test_selector');
const subject_name = document.getElementById('subject_name');

start_button.addEventListener('click', async() => {
    console.log("start clicked")
    console.log(test_selector.value, subject_name.value)
    if(test_selector.value == "null"){
        alert("テストを選択してください")
        return
    }
    else if(subject_name.value == ""){
        alert("名前を入力してください")
        return
    }
    else{
        await ipcRenderer.invoke('start_test', test_selector.value, subject_name.value)
        document.location.assign(`rate/index.html`)
    }
});

setting_button.addEventListener('click', async() => {
    console.log("setting clicked")
    document.location.assign(`setting/index.html`)
});

eval_button.addEventListener('click', async() => {
    console.log("eval clicked")
    document.location.assign(`eval/index.html`)
});


window.addEventListener("DOMContentLoaded", async () => {
    let test_list = await ipcRenderer.invoke('get_test_list');
    let option = document.createElement("option");
    option.text = "テストを選択"
    option.value = null
    test_selector.appendChild(option)

    for(let i = 0; i < test_list.length; i++){
        l = test_list[i]

        let option = document.createElement("option");
        option.text = l
        option.value = l
        test_selector.appendChild(option)
    }

});
// ------------------------------------------------------------------
