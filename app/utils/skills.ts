import {computeValue} from 'app/utils/computed';
import {getExperienceForSingleLevel, getTotalExperinceForLevel} from 'app/utils/experience';
import {getAdvGuildBonus, getCraftGuildBonus} from 'app/utils/guilds';
import {prestigeBonus} from 'app/utils/prestige';
import {typedKeys} from 'app/utils/types';

export const skillList: readonly SkillKey[] = <const>[
    "Combat", "Magic", "Practical", "Alchemy", "Crafting", "Dark", "Chronomancy", "Pyromancy", "Restoration",
    "Spatiomancy", "Mercantilism", "Divine", "Commune", "Wunderkind", "Gluttony", "Thievery", "Leadership", "Assassin"
];
const skills: {[K in SkillKey]?: Skill} = {};

function addNewSkill(key: SkillKey, getBonus: (skillLevel: number) => number) {
    skills[key] = {
        key,
        getBonus
    };
}

for (const skillKey of <const>["Dark", "Chronomancy", "Mercantilism", "Divine", "Wunderkind", "Thievery", "Leadership"]) {
    addNewSkill(skillKey, getIncreaseSkillBonus);
}
for (const skillKey of <const>["Practical", "Spatiomancy", "Commune", "Gluttony"]) {
    addNewSkill(skillKey, getDecreaseSkillBonus);
}
addNewSkill('Assassin', getCustomSkillBonus);



function getIncreaseSkillBonus(skillLevel: number): number {
    return Math.pow(1 + skillLevel / 60, 0.25);
}

function getDecreaseSkillBonus(skillLevel: number): number {
    return 1 / (1 + skillLevel / 100);
}
function getCustomSkillBonus(skillLevel: number): number {
    return 1 / (1 + skillLevel / 2000);
}


function getSkillLevelFromExp(exp: number): number {
    return Math.floor((Math.sqrt(8 * exp / 100 + 1) - 1) / 2);
}

//function getExpOfSkillLevel(level) {
//    return level * (level + 1) * 50;
//}

export function getSkillLevel(state: GameState, key: SkillKey) {
    return getSkillLevelFromExp(state.skills[key] ?? 0);
}

export function getSkillBonus(state: GameState, key: SkillKey): number {
    const level = getSkillLevelFromExp(state.skills[key] ?? 0);
    const skill = skills[key];
    if (!skill) {
        console.warn("No skill defined:", key)
        return 1;
    }
    return skill.getBonus(level);
}


// Gain percentChange% bonus for every level above min up to level max.
export function getSkillMod(state: GameState, key: SkillKey, min: number, max: number, percentChange: number) {
    const level = getSkillLevel(state, key);
    if (level < min) return 1;
    else return 1 + Math.min(level - min, max - min) * percentChange / 100;
}

export function gainSkillExperienceForAction(state: GameState, action: Action) {
    if (!action.skills) {
        return;
    }
    for (const skillKey of typedKeys(action.skills)) {
        const exp = computeValue(state, action, action.skills[skillKey], 0);
        addSkillExp(state, skillKey, exp);
    }
}

export function getBuffLevel(state: GameState, buffKey: BuffKey) {
    return state.buffs[buffKey];
}

export function getPercentToNextSkillLevel(state: GameState, skillKey: SkillKey): string {
    const level = getSkillLevel(state, skillKey);
    const curLevelProgress = (state.skills[skillKey] ?? 0) - getTotalExperinceForLevel(level);
    const nextLevelNeeds = getExperienceForSingleLevel(level + 1);
    return (curLevelProgress / nextLevelNeeds).toFixed(1);
}

function addSkillExp(state: GameState, skillKey: SkillKey, amount: number) {
    if (skillKey === "Combat" || skillKey === "Pyromancy" || skillKey === "Restoration") {
        amount *= 1 + getBuffLevel(state, 'Heroism') * 0.02;
    }
    //const oldLevel = getSkillLevel(state, skillKey);
    state.skills[skillKey] = (state.skills[skillKey] ?? 0) + amount;
    //const newLevel = getSkillLevel(state, skillKey);
    //if (oldLevel !== newLevel) {
    //    actionLog.addSkillLevel(actions.currentAction, skillKey, newLevel, oldLevel);
    //}
    //view.requestUpdate("updateSkill", skillKey);
}

export function getArmorLevel(state: GameState) {
    return 1 + ((state.loopState.resources.armor + 3 * state.loopState.resources.enchantments) * getCraftGuildBonus(state)) / 5;
}

export function getSelfCombat(state: GameState) {
    return ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Pyromancy") * 5)
                * getArmorLevel(state)
                * (1 + getBuffLevel(state, "Feast") * .05))
                * prestigeBonus(state, "PrestigeCombat");
}

function getZombieStrength(state: GameState) {
    return getSkillLevel(state, "Dark")
                * state.loopState.resources.zombies / 2
                * Math.max(getBuffLevel(state, "Ritual") / 100, 1)
                * (1 + getBuffLevel(state, "Feast") * .05)
                * prestigeBonus(state, "PrestigeCombat");
}

function getTeamStrength(state: GameState) {
    return ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Restoration") * 4)
                * (state.loopState.resources.teamMembers / 2)
                * getAdvGuildBonus(state) * getSkillBonus(state, "Leadership")
                * (1 + getBuffLevel(state, "Feast") * .05))
                * prestigeBonus(state, "PrestigeCombat");
}

export function getTeamCombat(state: GameState) {
    return getSelfCombat(state) + getZombieStrength(state) + getTeamStrength(state);
}
