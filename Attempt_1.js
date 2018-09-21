//Initialize
var cur_time = 0;
// Everyone starts out at the origin
var people = {};
for (var i = 1; i <= 50; i++) {
    people[i] = { x: 0, y: 0 };
}
// Everyone is available
var available = [];
for (var i = 1; i <= 50; i++) {
    available.push(i);
}
// No one is assigned
var assigned = [];
// Buffer to hold tasks in the case when they cannot be immediately assigned
var buffer = [];

var count = 0;
var ic = 0;

function request_location(assigned) {
    var assigned_copy = assigned; 

    for (var i = 0; i < assigned_copy.length; i++) {

        var p_object = assigned_copy[i];
        var p_id = Object.keys(p_object)[0];

        if (cur_time <= p_object[p_id].leave && p_object[p_id].leave < cur_time + 5) {
            // send p_id to the destination
            people[p_id].x = p_object[p_id].x;
            people[p_id].y = p_object[p_id].y;
            ic = ic + 1;
        }
        else if (cur_time-5 <= p_object[p_id].finish && p_object[p_id].finish < cur_time) {
            // send p_id to the origin  
            people[p_id].x = 0;
            people[p_id].y = 0;
            // Make p_id available
            available.push(p_id);
            // Unassign p_id
            assigned.splice(p_object, 1);
            count = count + 1;
        }

    }
    return people;
}

function attributeMissions(tasks) {
    buffer = buffer.concat(tasks);

    if (0 < available.length && available.length < buffer.length) {
        // Then there aren't enough people available to assign to all tasks.
        for (var i = 0; i < available.length; i++) {
            var person_index = available[i];
            var task = buffer.shift();
            var dist = Math.pow(Math.pow(task.x, 2) + Math.pow(task.y, 2), 0.5);
            var obj = {};
            obj[person_index] = {
                leave: task.start - (dist / 15) * 60,
                finish: task.start + task.length,
                x: task.x,
                y: task.y
            };
            assigned.push(obj);
        }
        // Everyone has been assigned so no one is available. 
        available = [];
    }
    else if (available.length >= buffer.length) {
        // There are enough people to assign to all tasks. 
        for (var i = 0; i < buffer.length; i++) {
            var person_index = available.shift();
            var dist = Math.pow(Math.pow(tasks[i].x, 2) + Math.pow(tasks[i].y, 2), 0.5);
            var obj = {};
            obj[person_index] = {
                // The person should leave the origin at this time in order to reach at the destination on time. 
                leave: tasks[i].start - (dist / 15) * 60,
                finish: tasks[i].start + tasks[i].length,
                x: tasks[i].x,
                y: tasks[i].y
            };
            assigned.push(obj);
        }
        // All tasks in buffer have been assigned
        buffer = [];
    }
    request_location(assigned);
    cur_time += 5;
    console.log("Initiation Count " + ic);
    console.log("Termination Count " + count);
    return people;
}
