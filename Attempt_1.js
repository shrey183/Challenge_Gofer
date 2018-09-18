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

var tasks_completed = 0;

function request_location(assigned) {

    for (var i = 0; i < assigned.length; i++) {

        var p_object = assigned[i];
        var p_id = Object.keys(p_object)[0];
        var theta = Math.atan2(p_object[p_id].x, p_object[p_id].y);
        var dist = p_object[p_id].d;
        
       // pi is on his way to the location
        if (p_object[p_id].leave <= cur_time && cur_time <= p_object[p_id].start) {
            var t_delta = cur_time - p_object[p_id].leave;
            people[p_id].x = 15 * (t_delta) * Math.cos(theta);
            people[p_id].y = 15 * (t_delta) * Math.sin(theta);
        }

        // pi is at the location
        else if (p_object[p_id].start <= cur_time && cur_time <= p_object[p_id].finish) {
            people[p_id].x = p_object[p_id].x;
            people[p_id].y = p_object[p_id].y;
        }

        // pi is returning from the location to the origin 
        else if (p_object[p_id].finish < cur_time && cur_time <= p_object[p_id].return_time) {
            // pi has finished the task and so it must be removed from assigned
            assigned.splice(assigned.indexOf(p_object), 1);
            var t_delta = cur_time - p_object[p_id].finish;
            people[p_id].x = (dist - 15 * (t_delta)) * Math.cos(theta);
            people[p_id].y = (dist - 15 * (t_delta)) * (t_delta) * Math.sin(theta);
            tasks_completed += 1;   
        }
        
        else if (cur_time > p_object[p_id].return_time) {
            // pi has returned to the origin. 
            available.push(p_id);
            people[p_id].x = 0;
            people[p_id].y = 0;   
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
            var task = buffer.pop();
            var dist = Math.pow(Math.pow(task.x, 2) + Math.pow(task.y, 2), 0.5);
            var obj = {};
            obj[person_index] = {
                leave: task.start - (dist / 15) * 60,
                return_time: task.start + task.length + (dist / 15) * 60,
                start: task.start,
                finish: task.start + task.length,
                d: dist,
                x: task.x,
                y: task.y
            };
            assigned.push(obj);
        }
    }
    else if (available.length >= buffer.length){
        // There are enough people to assign to all tasks. 
        for (var i = 0; i < tasks.length; i++) {
            var person_index = available.shift();
            var dist = Math.pow(Math.pow(tasks[i].x, 2) + Math.pow(tasks[i].y, 2), 0.5);
            var obj = {};
            obj[person_index] = {
                // The person should leave the origin at this time in order to reach at the destination on time. 
                leave: tasks[i].start - (dist / 15) * 60, 
                return_time: tasks[i].start + tasks[i].length + (dist / 15) * 60,
                start: tasks[i].start,
                finish: tasks[i].start + tasks[i].length,
                d: dist,
                x: tasks[i].x,
                y: tasks[i].y
            };
            assigned.push(obj);
        }
    }
    request_location(assigned);
    cur_time += 5;
    console.log("Tasks Completed:" + tasks_completed);
    return people;
}
