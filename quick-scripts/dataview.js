// dateview.js
function generateDateViewHTML() {
    const nldates = app.plugins.getPlugin("nldates-obsidian");
    const today = nldates.parseDate("today").moment;
    const week =  nldates.parseDate("next week").moment;
    const month = nldates.parseDate("next month").moment;
    const year = nldates.parseDate("next year").moment;
    const weekDiff = week.diff(today,'days');
    const weekPercentage = parseInt(weekDiff/7*100);
    const monthDiff = month.diff(today,'days');
    const daysInMonth = today.daysInMonth();
    const monthPercentage = parseInt(monthDiff/daysInMonth*100);
    const yearDiff = year.diff(today,'days');
    const yearPercentage = parseInt(yearDiff/365*100);

    let html = '';
    
    html += '<div>本周还剩<span class="stress">' + weekDiff + '</span>天</div>';
    html += '<progress max="7" value="' + weekDiff + '" percentage="' + weekDiff + '"></progress>';
    html += '<div>本月还剩<span class="stress">' + monthDiff + '</span>天</div>';
    html += '<progress max="' + daysInMonth + '" value="' + monthDiff + '" percentage="' + monthPercentage + '"></progress>';
    html += '<div>今年还剩<span class="stress">' + yearDiff + '</span>天</div>';
    html += '<progress max="365" value="' + yearDiff + '" percentage="' + yearPercentage + '"></progress>';

    return html;
}
