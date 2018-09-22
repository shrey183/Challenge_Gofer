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
        else if (cur_time-5 < p_object[p_id].finish && p_object[p_id].finish <= cur_time) {
            
            // Make p_id available
            available.push(p_id);
            // Unassign p_id
            assigned.splice(p_object, 1);
            count = count + 1;
        }

    }
    return people;
}

function closest_task(person, buffer) {
    // This function will return the closest task to the current person

    // Something like a dictionary with key being the task and the value being the distance between the task and person 
    dist_array = []; 
    for (var i = 0; i < buffer.length; i++) {
        x1 = person.x;
        x2 = buffer[i].x;
        y1 = person.y;
        y2 = buffer[i].y;
        dist_array[i] = { task: buffer[i], distance: Math.pow(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2), 0.5) };
    }
    dist_array.sort(function (a, b) {
        return a.distance - b.distance;
    });
    return dist_array[0];
}

function closest_person(task, available) {
    // This function will return the closest person to the current task 

    // Something like a dictionary with key being the task and the value being the distance between the task and person 
    dist_array = [];
    for (var i = 0; i < available.length; i++) {
        person = people[available[i]];
        x1 = person.x;
        x2 = task.x;
        y1 = person.y;
        y2 = task.y;
        dist_array[i] = {person_index: available[i], distance: Math.pow(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2), 0.5) };
    }
    dist_array.sort(function (a, b) {
        return a.distance - b.distance;
    });
    return dist_array[0];
}


function attributeMissions(tasks) {
    buffer = buffer.concat(tasks);
    if (0 < available.length && available.length < buffer.length) {
        // Then there aren't enough people available to assign to all tasks.
        
        for (var i = 0; i < available.length; i++) {
            var person_index = available[i];
            var p_object = people[person_index];
            // Find the closest task to this person 
            var td_object = closest_task(p_object, buffer);
            var task = td_object.task;
            var dist = td_object.distance;
            // Remove the object from the buffer
            buffer.splice(task, 1);
            // Assign the task to the person 
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
            var task = buffer[i];
            // Find the closest person to the current task 
            var pd_object = closest_person(task, available);
            var dist = pd_object.distance;
            var p_id = pd_object.person_index;
            // Remove the person from available people
            available.splice(p_id, 1);
            // Assign that person to the current task 
            var obj = {};
            obj[p_id] = {
                // The person should leave the origin at this time in order to reach at the destination on time. 
                leave: task.start - (dist / 15) * 60,
                finish: task.start + task.length,
                x: task.x,
                y: task.y
            };
            assigned.push(obj);
        }
        // All tasks in buffer have been assigned
        buffer = [];
    }
    request_location(assigned);
    cur_time += 5;

    return people;
}
