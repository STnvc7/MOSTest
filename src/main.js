const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs')
const path = require('path');
const {glob} = require('glob')
const {createObjectCsvWriter} = require('csv-writer')
const {parse} = require('csv-parse/sync')
require('date-utils')

function shuffleArray(array) {
  const cloneArray = [...array]
  for (let i = cloneArray.length - 1; i >= 0; i--) {
    let rand = Math.floor(Math.random() * (i + 1))
    // 配列の要素の順番を入れ替える
    let tmpStorage = cloneArray[i]
    cloneArray[i] = cloneArray[rand]
    cloneArray[rand] = tmpStorage
  }
  return cloneArray
}

//MOSTestクラス=========================================================================================
class MOSTest{
  constructor(test_name, subject_name){
    this.test_name = test_name
    this.list = []
    this.category_list = []

    if(subject_name != ""){
      this.subject_name = subject_name
    }
    else{
      let date = new Date()                   //名前の入力がない場合はとりあえず日付
      date = date.toFormat('YYYY-MM-DD_HH-MI-SS')
      this.subject_name = date
    }
    console.log(`subject : ${this.subject_name}`)
    this.create_test()
  }

  create_test(){
    let files = JSON.parse(fs.readFileSync(`${process.cwd()}/TestConfig/${this.test_name}.json`, 'utf8'));
    let cate = Object.keys(files)

    for(let i = 0; i < cate.length;i++){
      let idx = cate[i]
      let _f = files[idx]

      this.category_list = [...this.category_list, _f.name]

      let _len = _f.paths.length
      for(let j = 0; j < _len; j++){
        let _d = {"category":_f.name, "path":_f.paths[j], "score":null}
        this.list = [...this.list, _d]
      }
    }
    this.list = shuffleArray(this.list)
    console.log(`test created : ${this.test_name}`)
  }

  set_score(idx, score){
    this.list[idx].score = Number(score)
    console.log(this.list)
    return
  }
  get_score(idx){
    return this.list[idx].score
  }

  get_list(){
    return this.list
  }
  finish_test(){
    let result_dir = `${process.cwd()}/Result/${this.test_name}`
    fs.mkdirSync(result_dir, {recursive:true},(err) => {
      if (err) { console.log(err); }
    });
    
    let score_out_path = path.join(result_dir, `${this.subject_name}.csv`)
    let csvWriter = createObjectCsvWriter({
      path: score_out_path,
      header: [{id:'category', title:'category'},
               {id:'path', title:'path'},
               {id:'score', title:'score'}]
    })
    csvWriter.writeRecords(this.list).then(() => {
      console.log('test finished and score exported')
    })
    
  }
  get_result(){
    let result = []

    for(let i = 0; i < this.category_list.length; i++){
      let score = 0
      let counter = 0
      for(let j = 0; j < this.list.length; j++){
        if(this.list[j].category == this.category_list[i]){
          score = score + this.list[j].score
          counter += 1
        }
      }
      score = score / counter
      result = [...result, {category:this.category_list[i], score:score}]
    }

    return result
  }
}

//================================================================================

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => app.quit());

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    title: '実験用',
    webPreferences: {
        nodeIntegration : true,
        contextIsolation : false,
        preload : path.join(__dirname, 'preload.js'),
    }
  });

  // mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.loadFile(`src/index.html`);

};



//ipcMain handler ==================================================================================================
ipcMain.handle('select_folder', async (event) => {
  const path = dialog.showOpenDialogSync(mainWindow, {  //open dialog
    buttonLabel: '開く', 
    properties:[
      'openDirectory'
    ]
  });
  if( path === undefined ){                      //cancelled
    return false;
  }
  else{
    return path
  }
});

ipcMain.handle('set_score', async(event, idx, score) => {
  test.set_score(idx, score)
  return
});

ipcMain.handle('get_score', async (event, idx) => {
  return test.get_score(idx)
})

ipcMain.handle('set_test', async (event, test_name, test_setting) => {
  let test_dir = `${process.cwd()}/TestConfig`
  fs.mkdir(test_dir, (err) => {
    if (err) { console.log("test config dir has already created"); }
    console.log('create test config directry');
  });

  let json_data = JSON.stringify(test_setting, null, 2);
  let json_out_path = path.join(test_dir, `${test_name}.json`)
  fs.writeFileSync(json_out_path, json_data);
  return
});

ipcMain.handle('get_test_list', async (event) => {

  let config_dir = `${process.cwd()}/TestConfig`

  pattern = path.join(config_dir, '*.json').replace(/\\/g, "/")
  const paths = await glob(pattern)

  let names = []
  for(let i=0; i<paths.length;i++){
    p = paths[i]
    names = [...names, path.basename(p, '.json')]
  }
  return names
});

ipcMain.handle('start_test', async (event, test_name, subject_name) => {
  console.log(test_name, subject_name)
  test = new MOSTest(test_name, subject_name)
  return
})

ipcMain.handle('finish_test', async () => {
  test.finish_test()
  return
})

ipcMain.handle('get_test_properties', async (event) => {
  return test.get_list()
})

ipcMain.handle('quit_test', () => {
  app.quit()
})

ipcMain.handle('get_test_result', () => { //テスト後のレビュー用　個人の結果を取ってくるのみ
  return test.get_result()
})

ipcMain.handle('get_subject_list', async (event, test_name) => { //集計用　最終的な参加者のリストを取ってくる
  let test_result_path = `${process.cwd()}/Result/${test_name}`
  let pattern = `${test_result_path}/*.csv`.replace(/\\/g, "/")
  let paths = await glob(pattern)
  
  for(let i = 0; i < paths.length; i++){
    paths[i] = path.basename(paths[i].replace(/\\/g, "/"), '.csv')
  }
  paths = paths.toSorted()
  console.log('all subject list', paths)
  return paths
})

ipcMain.handle('get_evaluation', async (event, test_name, eval_list) => {

  console.log('eval subject list', eval_list)
  let path_list = []
  for(let i = 0; i < eval_list.length; i++){
    let _p = `${process.cwd()}/Result/${test_name}/${eval_list[i]}.csv`.replace(/\\/g, "/");
    path_list = [...path_list, _p]
  }

  let scores = {}

  for(let i=0; i < path_list.length; i++){
    let _p = path_list[i]
    let _d = fs.readFileSync(_p);
    _d = parse(_d, {columns:true})
    
    for(let j = 0; j < _d.length; j++){
      let _c = _d[j].category

      if(scores[_c] == undefined){
        scores[_c] = {}
      }

      let _s = Number(_d[j].score)

      if(scores[_c].score == undefined){
        scores[_c].score = _s
        scores[_c].num = 1
      }
      else{
        scores[_c].score += _s
        scores[_c].num += 1
      }
    }
  }

  console.log('score sum', scores)

  let categories = Object.keys(scores)
  let result = {}
  for(let i = 0; i < categories.length; i++){
    let _c = categories[i]
    result[_c] = scores[_c].score / scores[_c].num
  }

  console.log('eval result', result)
  return result
})