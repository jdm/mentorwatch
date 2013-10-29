var mentorGroups = {
                     "": [],
                     "js": ["waldo", "terrence", "evilpie", "nbp", "jorendorff", "luke"],
                     "gecko": ["jdm", "bholley", "bz", "ms2ger", "bsmedberg", "ted",
                               "dholbert", "seth", "dbaron", "tn", "yoric"],
                     "gfx": ["jrmuizel", "bjacob", "benwa", "vlad", "mattwoodrow"],
                     "devtools": ["msucan", "vporof", "paul", "robcee", "bgrinstead",
                                  "optimizer", "jimb"],
                     "mobile": ["capella", "margaret", "wesj", "botond", "kats", "sriram",
                                "nalexander", "liuche"],
                     "gaia": ["jlal", ":julienw", "alive", "etienne", "dkuo", "timdream",
                              "evelyn", ":rik"],
                     "webdev": ["adrian@mozilla.com", "andym", "chris.lonnen@gmail.com",
                                "clouserw", "cvan", "giorgos@mozilla.com", "groovecoder",
                                "laura@mozilla.com", "mythmon", "openjck",
                                "pmac@mozilla.com", "rhelmer@rhelmer.org", "r1cky",
                                "robhudson", "sancus@off.net", "willkg"]
                   };

function processResult(msg, results, row) {
  var open_bugs = results.filter(function(bug) {
    return ["RESOLVED", "VERIFIED"].indexOf(bug.status) == -1;
  });
  var cols = $("td", row);
  cols[1].textContent = results.length;
  cols[2].textContent = results.length - open_bugs.length;
  cols[3].textContent = open_bugs.length;

  var active_within_two_weeks = open_bugs.filter(function(bug) {
    return (Date.now() - Date.parse(bug.last_change_time)) < (1000 * 60 * 60 * 24 * 14);
  });
  cols[4].textContent = active_within_two_weeks.length +
    ' (' + active_within_two_weeks.filter(function(bug) {
      return bug.assigned_to.name != "nobody" && bug.assigned_to.name != "general";
    }).length  + ')';

  var fixed_bugs = results.filter(function(bug) {
    return open_bugs.map(function(bug) { return bug.id; }).indexOf(bug.id) == -1;
  });
  var fixed_assignees = Object.create({});
  fixed_bugs.forEach(function(bug) {
    fixed_assignees[bug.assigned_to.real_name || bug.assigned_to.name] = true;
  });
  cols[5].textContent = Object.keys(fixed_assignees).length;
}

function updateGroup() {
  var mentorsHolder = $('#mentors')[0];
  var rows = $('tr:not([class="header"])', mentorsHolder);
  for (var i = 0; i < rows.length; i++) {
    mentorsHolder.removeChild(rows[i]);
  }
  var spinner = new Image();
  spinner.src = "loading.gif";
  var mentors = mentorGroups[$('#group')[0].value];
  for (var i = 0; i < mentors.length; i++) {
    var row = document.createElement('tr');

    var name = document.createElement('td');
    name.textContent = mentors[i];
    row.appendChild(name);

    for (var j = 0; j < $('.header th').length - 1; j++) {
      var col = document.createElement('td');
      col.appendChild(spinner.cloneNode());
      row.appendChild(col);
    }

    mentorsHolder.appendChild(row);

    bugzilla.searchBugs({status_whiteboard: 'mentor=' + mentors[i],
                         whiteboard_type: 'contains_all',
                         bug_status: ["NEW","ASSIGNED","REOPENED",
                                      "UNCONFIRMED", "RESOLVED"]},
                         function(msg, results) {
                           processResult(msg, results, this);
                         }.bind(row));
  }
}

var bugzilla;
$(document).ready(function() {
  bugzilla = bz.createClient();

  for (var i in mentorGroups) {
    var opt = document.createElement('option');
    opt.textContent = i;
    $('#group')[0].appendChild(opt);
  }
  updateGroup();
});