// import {getExperienceForSingleLevel, getTotalExperinceForLevel} from 'app/utils/experience';
import {zoneIndexes} from 'app/zones';

export function getExploreSkill(state: GameState): number {
    return Math.floor(Math.sqrt(getExploreProgress(state)));
}

export function getExploreProgress(state: GameState): number {
    //ExploreProgress == mean of all zones' survey progress, rounded down.
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress == 0) return 0;
    else return Math.max(Math.floor(totalExploreProgress / zoneIndexes.length), 1);
}

export function getTotalExploreProgress() {
    //TotalExploreProgress == total of all zones' survey progress.
    let totalExploreProgress = 0;
    //towns.forEach((town, index) => {
    //    if (town.getLevel("SurveyZ"+index)) totalExploreProgress += town.getLevel("SurveyZ"+index);
    //});
    return totalExploreProgress;
}

// TODO: import this.
/*

function fullyExploredZones() {
    let fullyExplored = 0;
    towns.forEach((town, index) => {
        if (town.getLevel(`SurveyZ${index}`) == 100) fullyExplored++;
    })
    return fullyExplored;
}
function getExploreExp() {
    //ExploreExp == total survey exp across all zones
    let totalExploreExp = 0;
    towns.forEach((town, index) => {
        if (town.getLevel("SurveyZ"+index)) totalExploreExp += town[`expSurveyZ${index}`];
    });
    return totalExploreExp;
}
function getExploreExpSinceLastProgress() {
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress === 100 * towns.length) return 1;
    let levelsSinceLastProgress = totalExploreProgress <= 1 ? 1
                                : totalExploreProgress < towns.length * 2 ? totalExploreProgress - 1
                                : totalExploreProgress % towns.length + 1;

    const levelsPerTown = {};
    function expSinceLast(town) {
        const varName = `SurveyZ${town.index}`;
        const level = town.getLevel(varName) - (levelsPerTown[town.index] ?? 0);
        if (level === 0 || level === 100) return Infinity;
        if (levelsPerTown[town.index]) {
            return getExperienceForSingleLevel(level);
        } else {
            const curExp = town[`exp${varName}`];
            return curExp - getTotalExperinceForLevel(level) + 1;
        }
    }
    const townsByExpOrder = [...towns].sort((a, b) => expSinceLast(a) - expSinceLast(b));
    let totalExpGained = 0;
    while (levelsSinceLastProgress--) {
        totalExpGained += expSinceLast(townsByExpOrder[0]);
        const index = townsByExpOrder[0].index;
        levelsPerTown[index] ??= 0;
        levelsPerTown[index]++;
        townsByExpOrder.sort((a, b) => expSinceLast(a) - expSinceLast(b));
    }
    return totalExpGained;
}
function getExploreExpToNextProgress() {
    const totalExploreProgress = getTotalExploreProgress();
    if (totalExploreProgress === 100 * towns.length) return 0;
    let levelsToNextProgress = totalExploreProgress === 0 ? 1
                             : totalExploreProgress < towns.length * 2 ? towns.length * 2 - totalExploreProgress
                             : towns.length - (totalExploreProgress % towns.length);

    const levelsPerTown = {};
    function expToNext(town) {
        const varName = `SurveyZ${town.index}`;
        const level = town.getLevel(varName) + (levelsPerTown[town.index] ?? 0);
        if (level >= 100) return Infinity;
        if (levelsPerTown[town.index]) {
            // we're at a level boundary so we can shortcut
            return getExperienceForSingleLevel(level + 1);
        } else {
            return getTotalExperinceForLevel(level + 1) - town[`exp${varName}`];
        }
    }
    const townsByExpOrder = [...towns].sort((a, b) => expToNext(a) - expToNext(b));
    let totalExpNeeded = 0;
    while (levelsToNextProgress--) {
        totalExpNeeded += expToNext(townsByExpOrder[0]);
        const index = townsByExpOrder[0].index;
        levelsPerTown[index] ??= 0;
        levelsPerTown[index]++;
        townsByExpOrder.sort((a, b) => expToNext(a) - expToNext(b));
    }
    return totalExpNeeded;
}
function exchangeMap() {
    let unfinishedSurveyZones = [];
    towns.forEach((town, index) => {
        if (town.getLevel("Survey") < 100) unfinishedSurveyZones.push(index);
    });
    //For each completed map, give 2*ExploreSkill survey exp to a random unfinished zone's
    //survey progress (if no unfinished zones remain, skip all of this.)
    while (resources.completedMap > 0 && unfinishedSurveyZones.length > 0) {
        let rand = unfinishedSurveyZones[Math.floor(Math.random() * unfinishedSurveyZones.length)];
        let name = "expSurveyZ"+rand;
        towns[rand][name] += getExploreSkill() * 2;
        if (towns[rand][name] >= 505000) {
            towns[rand][name] = 505000;
            for(var i = 0; i < unfinishedSurveyZones.length; i++)
                if ( unfinishedSurveyZones[i] === rand)
                    unfinishedSurveyZones.splice(i, 1);
        }
        view.requestUpdate("updateProgressAction", {name: "SurveyZ"+rand, town: towns[rand]});
        addResource("completedMap", -1);
    }
}
*/
