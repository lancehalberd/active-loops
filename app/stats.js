// @ts-check
"use strict";


class Stat extends Localizable {
    /** @type {StatName} */
    name;
    statLevelExp = new LevelExp();
    talentLevelExp = new LevelExp();
    soullessLevelExp = new LevelExp();
    soulstone = 0;
    /** @type {PrestigeBuffName} */
    prestigeBuff;


    /** @param {StatName} name */
    constructor(name) {
        super(`stats>${name}`);
        Object.defineProperty(this, "name", {value: name});
        if (["Str","Dex","Con","Spd","Per"].includes(name)) {
            this.prestigeBuff = "PrestigePhysical";
        }
        if (["Cha","Int","Soul","Luck"].includes(name)) {
            this.prestigeBuff = "PrestigeMental";
        }
    }

    get exp() {
        return this.statLevelExp.totalExp;
    }
    set exp(totalExp) {
        throw new Error(`Tried to set stat.exp to ${totalExp}, should set stat.statLevelExp.totalExp instead`);
        // this.statLevelExp.totalExp = totalExp;
    }

    get talent() {
        return this.talentLevelExp.totalExp;
    }
    set talent(totalExp) {
        throw new Error(`Tried to set stat.talent to ${totalExp}, should set stat.talentLevelExp.totalExp instead`);
        // this.talentLevelExp.totalExp = totalExp;
    }

    get blurb() {
        return this.memoize("blurb");
    }

    get short_form() {
        return this.memoize("short_form");
    }

    get long_form() {
        return this.memoize("long_form");
    }

    #soulstoneCalc;
    #soulstoneMult;
    get soulstoneMult() {
        if (this.#soulstoneCalc !== this.soulstone) {
            this.#soulstoneMult = 1 + Math.pow(this.soulstone, 0.8) / 30;
            this.#soulstoneCalc = this.soulstone;
        }
        return this.#soulstoneMult;
    }
    
    #talentCalc;
    #talentMult;
    get talentMult() {
        if (this.#talentCalc !== this.talentLevelExp.level) {
            this.#talentMult = 1 + Math.pow(this.talentLevelExp.level, 0.4) / 3;
            this.#talentCalc = this.talentLevelExp.level;
        }
        return this.#talentMult;
    }

    #levelCalc;
    #effortMultiplier;
    #manaMultiplier;
    get effortMultiplier() {
        if (this.#levelCalc !== this.statLevelExp.level) {
            this.#effortMultiplier = 1 + this.statLevelExp.level / 100;
            this.#manaMultiplier = undefined;
            this.#levelCalc = this.statLevelExp.level;
        }
        return this.#effortMultiplier;
    }
    get manaMultiplier() {
        if (this.#levelCalc !== this.statLevelExp.level || this.#manaMultiplier === undefined) {
            this.#manaMultiplier = 1 / this.effortMultiplier; // will set levelCalc
        }
        return this.#manaMultiplier;
    }

    toJSON() {
        const toSave = {...this};
        // Backwards compatibility
        toSave.exp = this.exp;
        toSave.talent = this.talent;
        return toSave;
    }

    load(toLoad) {
        if (!toLoad || typeof toLoad !== "object") return false;
        // stat level doesn't get touched during load bc no saving partial loops yet
        // this.statLevelExp.load(toLoad.statLevelExp, toLoad.exp);
        this.talentLevelExp.load(toLoad.talentLevelExp, toLoad.talent);
        this.soulstone = toLoad.soulstone > 0 ? toLoad.soulstone : 0;
        return true;
    }

    /** @type {(a:Stat, b:Stat) => number} */
    static compareLevelAscending(a, b)        { return a.exp - b.exp; }
    /** @type {(a:Stat, b:Stat) => number} */
    static compareLevelDescending(a, b)       { return b.exp - a.exp; }
    /** @type {(a:Stat, b:Stat) => number} */
    static compareTalentAscending(a, b)       { return a.talent - b.talent; }
    /** @type {(a:Stat, b:Stat) => number} */
    static compareTalentDescending(a, b)      { return b.talent - a.talent; }
    /** @type {(a:Stat, b:Stat) => number} */
    static compareSoulstoneAscending(a, b)    { return a.soulstone - b.soulstone; }
    /** @type {(a:Stat, b:Stat) => number} */
    static compareSoulstoneDescending(a, b)   { return b.soulstone - a.soulstone; }
}

class Buff extends Localizable {
    // why in valhalla's name are we using localized text as a key, wtaf
    /** @readonly */
    static fullNames = /** @type {const} */ ({
        Ritual: "Dark Ritual",
        Imbuement: "Imbue Mind",
        Imbuement2: "Imbue Body",
        Feast: "Great Feast",
        Aspirant: "Aspirant",
        Heroism: "Heroism",
        Imbuement3: "Imbue Soul",
        PrestigePhysical: "Prestige - Physical",
        PrestigeMental: "Prestige - Mental",
        PrestigeCombat: "Prestige - Combat",
        PrestigeSpatiomancy: "Prestige - Spatiomancy",
        PrestigeChronomancy: "Prestige - Chronomancy",
        PrestigeBartering: "Prestige - Bartering",
        PrestigeExpOverflow: "Prestige - Experience Overflow",
    });

    /** @type {BuffName} */
    name;
    amt = 0;

    get label() {
        return this.memoize("label");
    }
    get desc() {
        return this.memoize("desc");
    }

    /** @param {BuffName} name */
    constructor(name) {
        super(`buffs>${getXMLName(Buff.fullNames[name])}`);
        Object.defineProperty(this, "name", {value: name});
    }
}

function initializeStats() {
    for (let i = 0; i < statList.length; i++) {
        addNewStat(statList[i]);
    }
}

/** @param {StatName} name */
function addNewStat(name) {
    stats[name] = new Stat(name);
}


function initializeBuffs() {
    for (let i = 0; i < buffList.length; i++) {
        addNewBuff(buffList[i]);
    }
}

/** @param {BuffName} name */
function addNewBuff(name) {
    buffs[name] = new Buff(name);
}

/** @param {StatName} stat */
function getLevel(stat) {
    return stats[stat].statLevelExp.level
}

function getTotalTalentLevel() {
    return Math.floor(Math.pow(totalTalent, 0.2));
}

function getTotalTalentPrc() {
    return (Math.pow(totalTalent, 0.2) - Math.floor(Math.pow(totalTalent, 0.2))) * 100;
}

function getLevelFromExp(exp) {
    return Math.floor((Math.sqrt(8 * exp / 100 + 1) - 1) / 2);
}

/** @param {StatName} stat  */
function getTalent(stat) {
    return stats[stat].talentLevelExp.level;
}

function getLevelFromTalent(exp) {
    return Math.floor((Math.sqrt(8 * exp / 100 + 1) - 1) / 2);
}

function getExpOfTalent(level) {
    return level * (level + 1) * 50;
}

function getExpOfSingleTalent(level) {
    return level * 100;
}


/** @param {BuffName} buff */
function getBuffLevel(buff) {
    return buffs[buff].amt;
}

/** @param {BuffName} buff */
function getBuffCap(buff) {
    // Fixme please! I need to have a storage in data space
    const input = document.getElementById(`buff${buff}Cap`);
    if (input instanceof HTMLInputElement) {
        return parseInt(input.value)
    }
    throw Error(`buff${buff}Cap not HTMLInputElement?`);
}

function getRitualBonus(min, max, speed)
{
    if (getBuffLevel("Ritual") < min) return 1;
    else return 1 + Math.min(getBuffLevel("Ritual") - min, max-min) * speed / 100;
}

function getSurveyBonus(town)
{
    return town.getLevel("Survey") * .005;
}

/**
 * @param {BuffName} name 
 * @param {number} amount 
 * @param {Action} [action] 
 * @param {BuffEntry["statSpendType"]} [spendType] 
 * @param {SoulstoneEntry["stones"]} [statsSpent] 
 */
function addBuffAmt(name, amount, action, spendType, statsSpent) {
    const oldBuffLevel = getBuffLevel(name);
    if (oldBuffLevel === buffHardCaps[name]) return;
    buffs[name].amt += amount;
    if (amount === 0) buffs[name].amt = 0; // for presetige, reset to 0 when passed in.
    if (action) {
        actionLog.addBuff(action, name, buffs[name].amt, oldBuffLevel, spendType, statsSpent);
    }
    view.requestUpdate("updateBuff",name);
}

const talentMultiplierCache = {
    aspirant: -1,
    wunderkind: -1,
    talentMultiplier: -1,
}
function getTalentMultiplier() {
    if (talentMultiplierCache.aspirant !== getBuffLevel("Aspirant") || talentMultiplierCache.wunderkind !== getSkillBonus("Wunderkind")) {
        talentMultiplierCache.aspirant = getBuffLevel("Aspirant");
        talentMultiplierCache.wunderkind = getSkillBonus("Wunderkind");
        const aspirantBonus = getBuffLevel("Aspirant") ?  getBuffLevel("Aspirant") * 0.01 : 0;
        talentMultiplierCache.talentMultiplier = (getSkillBonus("Wunderkind") + aspirantBonus) / 100;
    }
    return talentMultiplierCache.talentMultiplier;
}

// how much "addExp" would you have to do to get this stat to the next exp or talent level
/** @param {StatName} name */
function getExpToLevel(name, talentOnly=false) {
    const expToNext = stats[name].statLevelExp.expToNextLevel;
    const talentToNext = stats[name].talentLevelExp.expToNextLevel;
    const talentMultiplier = getTalentMultiplier();
    return Math.ceil(Math.min(talentOnly ? Infinity : expToNext, talentToNext / talentMultiplier));
}

/** @param {StatName} name */
function addExp(name, amount) {
    stats[name].statLevelExp.addExp(amount);
    stats[name].soullessLevelExp.addExp(amount / stats[name].soulstoneMult);
    let talentGain = amount * getTalentMultiplier();
    stats[name].talentLevelExp.addExp(talentGain);
    totalTalent += talentGain;
    view.requestUpdate("updateStat", name);
}

function restartStats() {
    for (let i = 0; i < statList.length; i++) {
        if(getSkillLevel("Wunderkind") > 0) stats[statList[i]].statLevelExp.setLevel(getBuffLevel("Imbuement2") * 2);
        else stats[statList[i]].statLevelExp.setLevel(getBuffLevel("Imbuement2"));
    }
    view.requestUpdate("updateStats", true);
}
