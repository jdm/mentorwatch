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
                              "evelyn", ":rik"]
                   };

function processResult(msg, results, row) {
  $("td", row)[1].textContent = results.length;
  $("td", row)[2].textContent =
    results.filter(function(bug) { return bug.status == "RESOLVED"; }).length;
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
    var total = document.createElement('td');
    total.appendChild(spinner.cloneNode());
    var fixed = document.createElement('td');
    fixed.appendChild(spinner.cloneNode());
    row.appendChild(name);
    row.appendChild(total);
    row.appendChild(fixed);
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