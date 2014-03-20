var mentorGroups = {
                     "": [],
                     "desktop": ["adw", "dao", "dolske", "Enn", "felipe", "gavin", "gijs",
                                 "jaws", "mak", "mano", "markh", "MattN", "mconley",
                                 "mikedeboer","paolo", "smacleod", "ttaubert", "Unfocused"],
                     "js": ["waldo", "terrence", "evilpie", "nbp", "jorendorff", "luke"],
                     "gecko": ["jdm", "bholley", "bz", "ms2ger", "bsmedberg", "ted",
                               "dholbert", "seth", "dbaron", "tn", "yoric", ":tdz"],
                     "gfx": ["jrmuizel", "bjacob", "benwa", "vlad", "mattwoodrow"],
                     "devtools": ["msucan", "vporof", "paul", "robcee", "bgrinstead",
                                  "optimizer", "jimb", "past", "harth", "jwalker",
                                  "mratcliffe", "benvie", "nfitzgerald@mozilla.com", "anton", "jryans"],
                     "mobile": ["blassey", "bnicholson", "capella", "jchen", "kats", "liuche", "lucasr",
                                "margaret", "mbrubeck", "mcomella", "mfinkle", "nalexander",  "rnewman",
                                "snorp", "sriram", "wesj"],
                     "gaia": ["jlal", ":julienw", "alive", "etienne", "dkuo", "timdream",
                              "evelyn", ":rik", ":gsvelto", ":drs"],
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
    name.innerHTML = '<a href="' + window.location.protocol + window.location.pathname +
                       '?mentor=' + mentors[i] + '">' + mentors[i] + '</a>';
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
                                      "UNCONFIRMED", "RESOLVED"],
                         include_fields: "id,last_change_time,status,assigned_to"},
                         function(msg, results) {
                           processResult(msg, results, this);
                         }.bind(row));
  }
}

function showMentor(name) {
  $('#team')[0].style.display = 'none';
  $('#mentor')[0].style.display = 'block';
  $('#mentor .name')[0].textContent = name;

  function hideSpinner(classname) {
    var content = $('.' + classname)[0];
    var spinner = $('.spinner', content)[0];
    spinner.parentNode.removeChild(spinner);
  }

  /*function processResults(msg, results) {
  }
  bugzilla.searchBugs({status_whiteboard: 'mentor=' + name,
                       whiteboard_type: 'contains_all',
                       bug_status: ["NEW","ASSIGNED","REOPENED",
                                      "UNCONFIRMED", "RESOLVED"],
                       include_fields: "id,last_change_time,status,assigned_to,product," +
                                       "component"},
                      processResults);*/

  function timeFromModified(lastChangeTime) {
    var lastModified = new Date(lastChangeTime);
    var today = new Date();
    var one_day = 1000*60*60*24;
    return(Math.ceil((today.getTime() - lastModified.getTime()) / (one_day)));
  }

  function processIdleResults(msg, results) {
    hideSpinner('idle');
    var content = $('.idle > table')[0];
    var filtered = results.filter(function(bug) {
      return timeFromModified(bug.last_change_time) > 14;
    });
    var sorted = filtered.sort(function(a, b) {
      return a.last_change_time < b.last_change_time;
    });
    sorted.forEach(function(bug) {
      var row = document.createElement('tr');
      var description = document.createElement('td');
      var assignee = document.createElement('td');
      var idle = document.createElement('td');
      description.innerHTML = "<a href='http://bugzil.la/" + bug.id + "'>" + bug.id + "</a> - " + bug.summary;
      assignee.textContent = bug.assigned_to.name;
      idle.textContent = timeFromModified(bug.last_change_time);
      row.appendChild(description);
      row.appendChild(assignee);
      row.appendChild(idle);
      content.appendChild(row);
    });
  }
  bugzilla.searchBugs({status_whiteboard: 'mentor=' + name,
                       whiteboard_type: 'contains_all',
                       bug_status: ["NEW","ASSIGNED","REOPENED","UNCONFIRMED"],
                       assigned_to: 'nobody@mozilla.org,general@js.bugs',
                       assigned_to_type: 'not_contains_any',
                       include_fields: "id,last_change_time,assigned_to,summary",
                       /*assignee_idle: '2w'*/},
                      processIdleResults);

  function processAssigned(msg, results) {
    hideSpinner('mentorable');
    var filtered = results.filter(function(bug) {
      return timeFromModified(bug.last_change_time) > 30;
    });
    var sorted = filtered.sort(function(a, b) {
      return a.last_change_time > b.last_change_time;
    });
    var content = $('.mentorable > table')[0];
    sorted.forEach(function(bug) {
      var row = document.createElement('tr');
      var description = document.createElement('td');
      var idle = document.createElement('td');
      description.innerHTML = "<a href='http://bugzil.la/" + bug.id + "'>" + bug.id + "</a> - " + bug.summary;
      idle.textContent = timeFromModified(bug.last_change_time);
      row.appendChild(description);
      row.appendChild(idle);
      content.appendChild(row);
    });
  }
  var searchable_name = name;
  if (!searchable_name.startsWith(':'))
    searchable_name = ':' + searchable_name;
  bugzilla.searchUsers(searchable_name, function(msg, result) {
    bugzilla.searchBugs({assigned_to: result[0].email,
                         whiteboard_type: 'contains_all',
                         bug_status: ["NEW","ASSIGNED","REOPENED","UNCONFIRMED"],
                         include_fields: "id,summary,last_change_time"},
                        processAssigned);
  });
}

function showDashboard() {
  $('#team')[0].style.display = 'block';
  $('#mentor')[0].style.display = 'none';
}

var bugzilla;
$(document).ready(function() {
  bugzilla = bz.createClient({username: bzUsername,
                              password: bzPassword});

  for (var i in mentorGroups) {
    var opt = document.createElement('option');
    opt.textContent = i;
    $('#group')[0].appendChild(opt);
  }

  var query = window.location.search;

  function query_var(sVar) {
    return unescape(query.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  }
  var chosen = query_var("team");
  if (chosen) {
    var teams = document.getElementsByTagName("option");
    for (var i = 0; i < teams.length; i++) {
      if (chosen == teams[i].textContent) {
        teams[i].parentNode.selectedIndex = i;
        break;
      }
    }
  }

  var mentor = query_var("mentor");
  if (!chosen && mentor) {
    showMentor(mentor);
  }

  if (chosen || !mentor) {
    showDashboard();
    updateGroup();
  }
});
