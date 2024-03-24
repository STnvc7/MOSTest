const { ipcRenderer } = require('electron');
const path = require('path')

const next_button = document.getElementById('next_button');
const back_button = document.getElementById('back_button')
const form = document.getElementById('score_form');
const audio = document.getElementById('elem:audio')
const elem_index = document.getElementById('elem:index')
const form_Fair = document.getElementById('form:Fair')

window.addEventListener("DOMContentLoaded", async () => {
    test_properties = await ipcRenderer.invoke('get_test_properties')
    current_idx = 0
    num_files = test_properties.length

    let wav_path = path.join(process.cwd(), test_properties[current_idx].path) 
    audio.src=wav_path
});

audio.addEventListener('ended', () => {
    next_button.removeAttribute("disabled");

    if(current_idx != 0){
        back_button.removeAttribute("disabled");
    }
});

next_button.addEventListener('click', async() => {

    next_button.setAttribute("disabled", true);
    back_button.setAttribute("disabled", true);

    let list = form.elements['score'];
    let value = list.value;

    await ipcRenderer.invoke('set_score', current_idx ,value);

    current_idx += 1;
    if(current_idx < num_files){
        elem_index.innerHTML=`${current_idx + 1}.`
    
        let wav_path = path.join(process.cwd(), test_properties[current_idx].path) 
        audio.src = wav_path
        
        let score = await ipcRenderer.invoke('get_score', current_idx)
        if(score){
            form[score-1].checked = true
        }
        else{
            form_Fair.checked = true
        }
    
        if(current_idx == num_files-1){
            next_button.textContent = "終了"
        }
        else{
            next_button.textContent = "次へ"
        }
        return
    }
    else{
        await ipcRenderer.invoke('finish_test')
        document.location.assign(`../review/index.html`)
    }    
});

back_button.addEventListener('click', async() => {

    next_button.setAttribute("disabled", true);
    back_button.setAttribute("disabled", true);

    current_idx -= 1;

    elem_index.innerHTML=`${current_idx + 1}`

    let wav_path = path.join(process.cwd(), test_properties[current_idx].path) 
    audio.src = wav_path

    let score = await ipcRenderer.invoke('get_score', current_idx)
    form[score-1].checked = true

    if(current_idx == num_files-1){
        next_button.textContent = "終了"
    }
    else{
        next_button.textContent = "次へ"
    }

    return
});


