



export class Action {
    name: string;
    varName: string;

    constructor(name, extras) {
        this.name = name;
        this.varName = withoutSpaces(name);
        Object.assign(this, extras);
    }

    get imageName() {
        return camelize(this.name);
    }

    /* eslint-disable no-invalid-this */
    // not all actions have tooltip2 or labelDone, but among actions that do, the XML format is
    // always the same; these are loaded lazily once (and then they become own properties of the
    // specific Action object)
    get tooltip() { return this.memoize("tooltip"); }
    get tooltip2() { return this.memoize("tooltip2"); }
    get label() { return this.memoize("label"); }
    get labelDone() { return this.memoize("labelDone", ">label_done"); }
    get labelGlobal() { return this.memoize("labelGlobal", ">label_global"); }

    // all actions to date with info text have the same info text, so presently this is
    // centralized here (function will not be called by the game code if info text is not
    // applicable)
    infoText() {
        return `${_txt(`actions>${getXMLName(this.name)}>info_text1`)}
                <i class='fa fa-arrow-left'></i>
                ${_txt(`actions>${getXMLName(this.name)}>info_text2`)}
                <i class='fa fa-arrow-left'></i>
                ${_txt(`actions>${getXMLName(this.name)}>info_text3`)}
                <br><span class='bold'>${`${_txt("actions>tooltip>total_found")}: `}</span><div id='total${this.varName}'></div>
                <br><span class='bold'>${`${_txt("actions>tooltip>total_checked")}: `}</span><div id='checked${this.varName}'></div>`;
    };

    /** @param {SkillName} skill */
    teachesSkill(skill) {
        // if we don't give exp in the skill we don't teach it
        if (this.skills?.[skill] === undefined) return false;
        // if we have an unlock function and it references the skill, we don't teach it
        if (this.unlocked?.toString().search(`getSkillLevel\\("${skill}"\\)`) >= 0) return false;
        // if this is combat or magic and this isn't town 0, we don't teach it
        if ((skill === "Combat" || skill === "Magic") && this.townNum > 0) return false;
        // otherwise we do (as long as we actually give exp in it and it isn't zeroed out)
        const reward = this.skills[skill];
        const exp = typeof reward === "function" ? reward() : reward;
        return exp > 0;
    }

    getStoryTexts(rawStoriesDataForAction = this.txtsObj[0].children) {
        /** @type {{num: number, condition: string, conditionHTML: string, text: string}[]} */
        const storyTexts = [];

        for (const rawStoryData of rawStoriesDataForAction) {
            if (rawStoryData.nodeName.startsWith("story_")) {
                const num = parseInt(rawStoryData.nodeName.replace("story_", ""));
                const [conditionHTML, text] = rawStoryData.textContent.split("⮀");
                const condition = conditionHTML.replace(/^<b>|:<\/b>$/g,"")
                storyTexts.push({num, condition, conditionHTML, text});
            } else if (rawStoryData.nodeName === "story") {
                const num = parseInt(rawStoryData.getAttribute("num"));
                const condition = rawStoryData.getAttribute("condition");
                const conditionHTML = `<b>${condition}:</b> `;
                const text = rawStoryData.children.length > 0 ? rawStoryData.innerHTML : rawStoryData.textContent;
                storyTexts.push({num, condition, conditionHTML, text});
            }
        }
        return storyTexts;
    }
}

// same as Action, but contains shared code to load segment names for multipart actions.
export class MultipartAction extends Action {
    segments: number = 3;

    constructor(name, extras) {
        super(name, extras);
        this.segments = (extras.varName === "Fight") ? 3 : extras.loopStats.length;
    }

    // lazily calculate segment names when explicitly requested (to give chance for localization
    // code to be loaded first)

    /** @returns {string[]} */
    get segmentNames() {
        return this.memoizeValue("segmentNames",  Array.from(
            this.txtsObj.find(">segment_names>name")
        ).map(elt => elt.textContent));
    }

    /** @returns {string[]} */
    get altSegmentNames() {
        return this.memoizeValue("altSegmentNames",  Array.from(
            this.txtsObj.find(">segment_alt_names>name")
        ).map(elt => elt.textContent));
    }

    /** @returns {string[]} */
    get segmentModifiers() {
        return this.memoizeValue("segmentModifiers",  Array.from(
            this.txtsObj.find(">segment_modifiers>segment_modifier")
        ).map(elt => elt.textContent));
    }

    static {
        // listing these means they won't get stored even if memoized
        Data.omitProperties(this.prototype, ["segmentNames", "altSegmentNames", "segmentModifiers"]);
    }

    /** @param {number} segment  */
    getSegmentName(segment) {
        return this.segmentNames[segment % this.segmentNames.length];
    }

    /** @param {number} offset /** @param {number} [loopCounter] @param {number} [totalCompletions] */
    canMakeProgress(offset, loopCounter, totalCompletions) {
        // some actions with a tickProgress (like Small Dungeon) will throw an exception if tickProgress
        // is called after they're already complete. Turn that into a boolean.
        try {
            return this.tickProgress(offset, loopCounter, totalCompletions) > 0;
        } catch {
            return false;
        }
    }
}
