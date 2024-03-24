const {ipcRenderer} = require('electron');

window.set_test = (path) => {
    return ipcRenderer.invoke('set_test', path);
}

window.set_score = (rate) => {
    return ipcRenderer.invoke('set_score', idx, rate)
}

window.get_score = (rate) => {
    return ipcRenderer.invoke('get_score', idx)
}

window.get_test_list = () => {
    return ipcRenderer.invoke('get_test_list')
}

window.start_test = (test_name, subject_name) => {
    return ipcRenderer.invoke('start_test', test_name, subject_name)
}

window.finish_test = () => {
    return ipcRenderer.invoke('finish_test')
}

window.get_test_properties = () => {
    return ipcRenderer.invoke('get_test_properties')
}

window.get_test_result = () => {
    return ipcRenderer.invoke('get_test_result')
}

window.get_subject_list = (test_name) => {
    return ipcRenderer.invoke('get_subject_list')
}

window.get_evaluation = (test_name, eval_list) => {
    return ipcRenderer.invoke('get_evaluation')
}

window.quit_test = () => {
    return ipcRenderer.invoke("quit_test")
}