// custom.js

class DateViewGenerator {
    constructor() {
        this.nldates = app.plugins.getPlugin("nldates-obsidian");
    }

    generateDateViewElements() {
        if (!this.nldates) {
            console.error("nldates-obsidian 插件未加载。");
            return null;
        }

        const today = this.nldates.parseDate("today").moment;
        const week = this.nldates.parseDate("next week").moment;
        const month = this.nldates.parseDate("next month").moment;
        const year = this.nldates.parseDate("next year").moment;

        const weekDiff = week.diff(today, 'days');
        const weekPercentage = parseInt(weekDiff / 7 * 100);
        const monthDiff = month.diff(today, 'days');
        const daysInMonth = today.daysInMonth();
        const monthPercentage = parseInt(monthDiff / daysInMonth * 100);
        const yearDiff = year.diff(today, 'days');
        const yearPercentage = parseInt(yearDiff / 365 * 100);

        const elements = [
            this.createHTMLElement('div', '本周还剩<span class="stress">' + weekDiff + '</span>天'),
            this.createHTMLElement('progress', null, { attr: { max: 7, value: weekDiff, percentage: weekPercentage } }),
            this.createHTMLElement('div', '本月还剩<span class="stress">' + monthDiff + '</span>天'),
            this.createHTMLElement('progress', null, { attr: { max: daysInMonth, value: monthDiff, percentage: monthPercentage } }),
            this.createHTMLElement('div', '今年还剩<span class="stress">' + yearDiff + '</span>天'),
            this.createHTMLElement('progress', null, { attr: { max: 365, value: yearDiff, percentage: yearPercentage } })
        ];

        return elements;
    }

    // Helper function to create elements
    createHTMLElement(tag, text, options) {
        const element = document.createElement(tag);
        if (text) {
            element.innerHTML = text;
        }
        if (options && options.attr) {
            for (const [key, value] of Object.entries(options.attr)) {
                element.setAttribute(key, value);
            }
        }
        return element;
    }
}


// 导出 DateViewGenerator 类
module.exports = {
    DateViewGenerator: DateViewGenerator
};
