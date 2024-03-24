const { ipcRenderer } = require('electron');
const path = require('path');
const {glob} = require('glob')

const choose_button = document.getElementById("choose_button");
const back_button = document.getElementById("back_button");
const create_button = document.getElementById("create_button");
const test_name_input = document.getElementById("test_name")
const folder_list = document.getElementById("folder_list")

//テストの設定クラス===============================================================================
class TestSetting{
    constructor(){
        this.categories = {};
        this.current_idx = 0;
    };

    add_category(name, paths){
        //名前の重複ないか-------------------------------
        let _valid_idx = true
        Object.keys(this.categories).forEach((key) => {
            if(this.categories[key].name == name){
                _valid_idx = false
            }
        });
        if(_valid_idx == false){
            return false
        }
        //---------------------------------------------
        let _cate = {'name':name, 'num_files':paths.length, 'paths':paths};
        this.categories[this.current_idx] = _cate
        this.current_idx += 1;

        console.log(this.current_idx)
        console.log(this.categories)
        return true
    };

    delete_category(name){
        let del_id = null
        Object.keys(this.categories).forEach((key) => {
            if(this.categories[key].name == name){
                del_id = key
            }
        });
        if(del_id){
            delete this.categories[del_id]
            console.log(this.categories)
        }
    }
};
//=========================================================================================

window.addEventListener("DOMContentLoaded", () => {
    setting = new TestSetting()
});

back_button.addEventListener('click', () => {
    document.location.assign(`../index.html`)
})

create_button.addEventListener('click', async () => {
    let _test_name = test_name_input.value

    if(setting.categories = {}){
        alert("カテゴリを追加してください")
        return
    }
    await ipcRenderer.invoke('set_test', _test_name, setting.categories);
    console.log("test created")
    document.location.assign(`../index.html`)
})

choose_button.addEventListener('click', async () => {
    let _folder = await ipcRenderer.invoke("select_folder");

    if(_folder){
        _folder = path.relative(process.cwd(),_folder[0])
        let dir = path.basename(_folder);

        pattern = path.join(_folder, '*.wav').replace(/\\/g, "/")
        const paths = await glob(pattern)
        for(let i = 0; i < paths.length; i++){
            paths[i] = paths[i].replace(/\\/g, "/")
        }
        paths.sort();

        let _result = setting.add_category(dir, paths)

        if (_result){
            let folder = document.createElement('li');
            folder.innerHTML = `${dir} (${paths.length}files)`;
            folder.id = dir
            folder.className = "folder-element"
            
            let deleteButton = document.createElement('button');
            deleteButton.innerHTML = '削除';
            folder.appendChild(deleteButton);

            folder_list.appendChild(folder);

            deleteButton.addEventListener('click', () => {
                let chosen_folder = deleteButton.closest('li');
                folder_list.removeChild(chosen_folder);
                setting.delete_category(chosen_folder.id)
              });
        }
        else{
            alert("フォルダの名前被ってます...")
        }
    }
    else{
        alert("開けなかったっす...")
    }

})


