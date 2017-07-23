var CHECKPOINTS = [];

function Checkpoint(date, total_value, total_running_pl, total_realised_pl) {
    this.date = date;
    this.total_value = total_value;
    this.total_running_pl = total_running_pl;
    this.total_realised_pl = total_realised_pl;
}

function addCheckPoint(total_value, total_running_pl, total_realised_pl) {
    CHECKPOINTS.push(new Checkpoint(new Date()/1000, total_value, total_running_pl, total_realised_pl));
    autoSave();
}
