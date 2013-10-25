var mentorGroups = {
                     "platform": ["jdm", "bholley", "bz", "ms2ger", "waldo", "terrence"],
                     "devtools": ["msucan", "vporof", "paul", "robcee"],
                     "mobile": ["capella", "margaret", "wesj", "botond", "kats"],
                     "gaia": []
                   };

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
  }
}

$(document).ready(function() {
  for (var i in mentorGroups) {
    var opt = document.createElement('option');
    opt.textContent = i;
    $('#group')[0].appendChild(opt);
  }
  updateGroup();
});