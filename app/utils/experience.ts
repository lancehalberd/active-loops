//import {pauseGame} from 'app/utils/driver';

export const maxExperience = 505000;
// This is the inverse of getTotalExperinceForLevel
// 100 -> 1, 300 -> 2, 600 -> 3, ... 505000 -> 100
export function getLevelForExperience(xp: number): number {
    return ((Math.sqrt(8 * xp / 100 + 1) - 1) / 2) | 0;
}

// This is sum(100 * n) for n = [1...level].
export function getTotalExperinceForLevel(level: number) {
    return level * (level + 1) * 50;
}

export function getExperienceForSingleLevel(level: number): number {
    return level * 100;
}

export function getProgressLevel(state: GameState, progressKey: ProgressKey) {
    return getLevelForExperience(state.progressMap[progressKey] ?? 0);
}

export function getPercentToNextLevel(totalXP: number) {
    const level = getLevelForExperience(totalXP);
    const currentProgress = totalXP - getTotalExperinceForLevel(level);
    return currentProgress / getExperienceForSingleLevel(level + 1);
}

export function getLevelDetails(totalExperience: number) {
    const level = getLevelForExperience(totalExperience);
    const currentExperience = totalExperience - getTotalExperinceForLevel(level);
    const experienceForNextLevel = getExperienceForSingleLevel(level + 1);
    const percentToNextLevel = currentExperience / experienceForNextLevel;
    return {
        totalExperience,
        level,
        currentExperience,
        experienceForNextLevel,
        percentToNextLevel,
    };
}

/*
export function gainProgressExpereince(state: GameState, key: ProgressKey, amount: number) {
    let experience = state.progressMap[key] ?? 0;
    // return if capped, for performance
    if (experience === 505000) {
        if (state.options.pauseOnComplete) {
            pauseGame(state, true, "Progress complete! (Game paused)");
        }
        return;
    }
    experience = Math.min(experience + amount, maxExperience);
    state.progressMap[key] = experience;
    // TODO: make sure this handles linear progress values.
    // TODO: make sure values that depend on progress are updated when the level changes.
    const prevLevel = this.getLevel(varName);
    const level = this.getLevel(varName);
    if (level !== prevLevel) {
        //view.requestUpdate("updateLockedHidden", null);
        adjustAll();
        for (const action of totalActionList) {
            if (towns[action.townNum].varNames.indexOf(action.varName) !== -1) {
                //view.requestUpdate("updateRegular", {name: action.varName, index: action.townNum});
            }
        }
    }
}*/


// I think we probably shouldn't used this.
export class LevelExp {
    level = 0;
    exp = 0;

    getExpToNextLevel() {
        return this.getExpRequiredForNextLevel() - this.exp;
    }

    getExpRequiredForNextLevel(): number {
        return getExperienceForSingleLevel(this.level + 1);
    }

    getTotalExpForThisLevel() {
        return getTotalExperinceForLevel(this.level);
    }

    getTotalExp() {
        return this.getTotalExpForThisLevel() + this.exp;
    }

    setTotalExp(totalExp: number) {
        this.level = getLevelForExperience(totalExp);
        this.exp = totalExp - this.getTotalExpForThisLevel();
    }

    constructor(levelOrTotalExp?: number, exp?: number) {
        if (!levelOrTotalExp) {
            return;
        }
        if (typeof exp === "number") {
            this.level = levelOrTotalExp;
            this.exp = exp;
        } else {
            this.setTotalExp(levelOrTotalExp);
        }
    }

    setLevel(level: number, exp=0) {
        this.level = level;
        this.exp = exp;
    }

    addExp(exp: number) {
        this.exp += exp;
    }

    /*levelUp() {
        while (this.exp >= this.expRequiredForNextLevel) {
            this.exp -= this.expRequiredForNextLevel;
            this.level++;
            this.recalc();
        }
        while (this.exp < 0 && this.level > 0) {
            this.level--;
            this.exp += this.expRequiredForNextLevel;
            this.recalc();
        }
    }*/


    /*load(toLoad, totalExp) {
        if (!toLoad || typeof toLoad !== "object") toLoad = {};
        if (toLoad.level >= 0 && toLoad.exp >= 0) {
            this.level = toLoad.level;
            this.exp = toLoad.exp;
        } else if (totalExp > 0) {
            this.totalExp = totalExp;
        } else {
            this.level = this.exp = 0;
        }
        this.recalc();
    }*/
}
