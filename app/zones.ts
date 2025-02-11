// import {getLevelForExperience} from 'app/utils/experience';

export const zoneIndexes: ZoneIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const zoneNames = [
    'Beginnersville',
    'Forest',
    'Merchanton',
];

export function showZone(zoneIndex: ZoneIndex) {

}

// TODO: Figure out what these are.
/*type ProgressScalingType = 'linear';
type AnyAction = any;


interface TownProgress {
    scaling: ProgressScalingType;
    experience: number
}

class Town {
    index: ZoneIndex;
    allVarNames: string[] = [];
    varNames: string[] = [];
    progressVars: string[] = [];
    multipartVars: string[] = [];
    progressScaling: Record<string, ProgressScalingType> = {};
    totalActionList: AnyAction[] = [];
    hiddenVars: Set<string> = new Set();

    surveyExperience: number = 0;

    isUnlocked(state: GameState) {
        return state.discoveredZones.has(this.index);
    };

    getSurveyLevel() {
        return getLevelForExperience(this.surveyExperience);
    }

    getLevel(varName) {
        let xp = this[`exp${varName}`];
        if (this.progressScaling[varName] === "linear") return Math.floor(xp / 5050);
        return Math.floor((Math.sqrt(8 * xp / 100 + 1) - 1) / 2);
    };

    restart() {
        for (let i = 0; i < this.varNames.length; i++) {
            const varName = this.varNames[i];
            this[`goodTemp${varName}`] = this[`good${varName}`];
            this[`lootFrom${varName}`] = 0;
            view.requestUpdate("updateRegular",{name: varName, index: this.index});
        }
    };

    finishProgress(varName, expGain) {
        // return if capped, for performance
        if (this[`exp${varName}`] === 505000) {
            if (options.pauseOnComplete) pauseGame(true, "Progress complete! (Game paused)");
            else return;
        }

        const prevLevel = this.getLevel(varName);
        if (this[`exp${varName}`] + expGain > 505000) {
            this[`exp${varName}`] = 505000;
        } else {
            this[`exp${varName}`] += expGain;
        }
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
        //view.requestUpdate("updateProgressAction", {name: varName, town: towns[curTown]});
    };

    getPrcToNext(varName) {
        const level = this.getLevel(varName);
        if (level >= 100) return 100;
        if (this.progressScaling[varName] === "linear") return this[`exp${varName}`] / 5050 % 1 * 100;
        const expOfCurLevel = expForLevel(level);
        const curLevelProgress = this[`exp${varName}`] - expOfCurLevel;
        const nextLevelNeeds = expForLevel(level + 1) - expOfCurLevel;
        return Math.floor(curLevelProgress / nextLevelNeeds * 100 * 10) / 10;
    };

    // finishes actions that have checkable aspects
    finishRegular(varName, rewardRatio, rewardFunc) {
        // error state, negative numbers.
        if (this[`total${varName}`] - this[`checked${varName}`] < 0) {
            this[`checked${varName}`] = this[`total${varName}`];
            this[`good${varName}`] = Math.floor(this[`total${varName}`] / rewardRatio);
            this[`goodTemp${varName}`] = this[`good${varName}`];
            console.log("Error state fixed");
        }

        // only checks unchecked items 
        // IF there are unchecked items 
        // AND the user has not disabled checking unchecked items OR there are no checked items left
        const searchToggler = inputElement(`searchToggler${varName}`, false, false);
        if (this[`total${varName}`] - this[`checked${varName}`] > 0 && ((searchToggler && !searchToggler.checked) || this[`goodTemp${varName}`] <= 0)) {
            this[`checked${varName}`]++;
            if (this[`checked${varName}`] % rewardRatio === 0) {
                this[`lootFrom${varName}`] += rewardFunc();
                this[`good${varName}`]++;
            }
        } else if (this[`goodTemp${varName}`] > 0) {
            this[`goodTemp${varName}`]--;
            this[`lootFrom${varName}`] += rewardFunc();
        }
        view.requestUpdate("updateRegular", {name: varName, index: this.index});
    };

    createVars(varName) {
        if (this[`checked${varName}`] === undefined) {
            this[`checked${varName}`] = 0;
        }
        if (this[`goodTemp${varName}`] === undefined) {
            this[`goodTemp${varName}`] = 0;
        }
        if (this[`good${varName}`] === undefined) {
            this[`good${varName}`] = 0;
        }
        if (this[`lootFrom${varName}`] === undefined) {
            this[`lootFrom${varName}`] = 0;
        }
        if (this[`total${varName}`] === undefined) {
            this[`total${varName}`] = 0;
        }
        if (this.varNames.indexOf(varName) === -1) {
            this.varNames.push(varName);
            this.allVarNames.push(varName);
        }
    };

    createProgressVars(varName, progressScaling = "default") {
        if (this[`exp${varName}`] === undefined) {
            this[`exp${varName}`] = 0;
        }
        if (this.progressVars.indexOf(varName) === -1) {
            this.progressVars.push(varName);
            this.allVarNames.push(varName);
            this.progressScaling[varName] = progressScaling;
        }
    };

    createMultipartVars(varName) {
        this[varName] = 0;
        this[`${varName}LoopCounter`] = 0;
        if (!this.multipartVars.includes(varName)) {
            this.multipartVars.push(varName);
            this.allVarNames.push(varName);
        }
    }

    constructor(index) {
        this.index = index;
        let lateGameActionCount = 0;
        let inLateGameActions = true;
        for (const action of totalActionList) {
            if (this.index === action.townNum) {
                if (inLateGameActions) {
                    if (lateGameActions.includes(action.name)) {
                        lateGameActionCount++;
                    } else {
                        inLateGameActions = false;
                    }
                }
                if (!inLateGameActions && lateGameActionCount > 0 && isTravel(action.name)) {
                    // shift late-game actions to end of action button list
                    this.totalActionList.push(...this.totalActionList.splice(0, lateGameActionCount));
                    lateGameActionCount = 0;
                }
                // @ts-ignore
                this.totalActionList.push(action);
                if (action.type === "limited") this.createVars(action.varName);
                if (action.type === "progress") this.createProgressVars(action.varName, action.progressScaling);
                if (action.type === "multipart") this.createMultipartVars(action.varName);
            }
        }
    }
}



const towns: Town[] = [];

let curTown = 0;

function initializeTowns() {
    for (let i = 0; i <= 8; i++) {
        towns[i] = new Town(i);
    }
}*/
