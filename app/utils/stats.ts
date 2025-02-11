import {getPercentToNextLevel} from 'app/utils/experience';

export const stats: readonly CharStat[] = <const>['Dex', 'Str', 'Con', 'Spd', 'Per', 'Cha', 'Int', 'Luck', 'Soul'];

export function getStatPercentToNextLevel(state: GameState, stat: CharStat) {
    return getPercentToNextLevel(state.loopState.statsExperience[stat]);
}

export function getTalentPercentToNextLevel(state: GameState, stat: CharStat) {
    return getPercentToNextLevel(state.talentExperience[stat]);
}


export function getTotalBonusXP(state: GameState, cata: CharStat) {
    return 1;
    /*const prestigeLevel = getBuffLevel(this.prestigeBuff);
    if (this.#tbxSoulstone !== this.soulstone || this.#tbxTalent !== this.talentLevelExp.level || this.#tbxPrestige !== prestigeLevel) {
        this.#tbxSoulstone = this.soulstone;
        this.#tbxTalent = this.talentLevelExp.level;
        this.#tbxPrestige = prestigeLevel;
        this.#totalBonusXP = this.soulstoneMult * this.talentMult * prestigeBonus(this.prestigeBuff);
    }
    return this.#totalBonusXP;
    return stats[statName].totalBonusXP;*/
}
