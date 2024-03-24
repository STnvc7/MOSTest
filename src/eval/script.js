const {ipcRenderer} = require('electron');
const path = require('path');

const back_button = document.getElementById('back_button');
const test_selector = document.getElementById('test_selector');
const subject_list = document.getElementById('subject_list');
const eval_button = document.getElementById('eval_button')
const result_list = document.getElementById('result_list')
const export_button = document.getElementById('export_button')

back_button.addEventListener('click', () => {
    console.log("back clicked");
    document.location.assign(`../index.html`);
})

eval_button.addEventListener('click', async () => {

    if(test_selector.value == 'null'){
        alert("テストを選択してください")
        return
    }



    while( result_list.firstChild ){     //remove previous result
        result_list.removeChild( result_list.firstChild );
    }

    let eval_list = []
    let test_name = test_selector.value

    let inputs = subject_list.getElementsByTagName('input')

    for(let i = 0; i < Subjects.length; i++){
        if(inputs[i].checked){
            eval_list = [...eval_list, Subjects[i]]
        }
    }
    console.log("test name",test_name, "\neval list", eval_list)
    let result = await ipcRenderer.invoke('get_evaluation', test_name, eval_list)    //{category1 : result, category2 ; result2, ...}

    let categories = Object.keys(result)
    for(let i = 0; i < categories.length; i++){
        _c = categories[i]

        let result_elem = document.createElement('li')
        result_elem.innerHTML = `${_c} : ${result[_c]}`
        result_elem.id = `result_${_c}`
        result_elem.className = 'result'

        result_list.appendChild(result_elem)
    }
})

test_selector.addEventListener('change', async () => {
    show_subjects_list()
    while( result_list.firstChild ){     //remove previous result
        result_list.removeChild( result_list.firstChild );
    }
})


window.addEventListener("DOMContentLoaded", async () => {
    let test_list = await ipcRenderer.invoke('get_test_list');

    let option = document.createElement("option");
    option.text = "テストを選択"
    option.value = null
    test_selector.appendChild(option)

    for(let i = 0; i < test_list.length; i++){
        l = test_list[i];

        let option = document.createElement("option");
        option.text = l;
        option.value = l;
        test_selector.appendChild(option);
    }

    show_subjects_list()

});

async function show_subjects_list(){

    while( subject_list.firstChild ){     //remove previous test subjects
        subject_list.removeChild( subject_list.firstChild );
    }

    let test_name = test_selector.value
    Subjects = await ipcRenderer.invoke('get_subject_list', test_name) //  [subject1 score path, subject2 score path, ...]
    console.log('subjects list', Subjects)

    for(let i = 0; i < Subjects.length; i++){
        let _subject_name = Subjects[i];

        let _checkbox = document.createElement('input')
        _checkbox.setAttribute("type", "checkbox")
        _checkbox.id =  `subject-${i}`
        _checkbox.className = "subject-element"
        _checkbox.setAttribute("checked", true)

        let _label = document.createElement('label')
        _label.setAttribute('for', `subject-${i}`);
        _label.appendChild(document.createTextNode(_subject_name));

        subject_list.appendChild(_checkbox)
        subject_list.appendChild(_label)

    }
}