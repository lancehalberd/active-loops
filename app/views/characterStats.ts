import {requireElementById} from 'app/utils/dom';
import {getLevelForExperience, getLevelDetails} from 'app/utils/experience';
import {formatNumber, getMaxLogBarScale, intToString} from 'app/utils/helpers';
import {getTotalBonusXP, stats} from 'app/utils/stats';


const totalContainer = requireElementById('totalStatContainer');
const statsContainer = requireElementById('statsContainer');
export function initializeCharacterStats(state: GameState) {
    let left = 0, top = 0;
    for (const stat of stats) {
        const longStat = stat;
        const description = `${stat} goes brrrr`;
        const statContainer = document.createElement('div');
        statContainer.className = `statContainer showthat stat-${stat}`;
        statContainer.style.left = `${left}%`
        statContainer.style.top = `${top}%`
        statContainer.onmouseover = () => showStat(state, stat);
        statContainer.onmouseout = () => showStat(state);
        statContainer.innerHTML = `
            <div class='statLabelContainer'>
                <div class='medium bold stat-name long-form' style='margin-left:18px;margin-top:5px;'>${longStat}</div>
                <div class='medium bold stat-name short-form' style='margin-left:18px;margin-top:5px;'>${stat}</div>
                <div class='medium statNum stat-soulstone' style='color:var(--stat-soulstone-color);' id='stat${stat}ss'></div>
                <div class='statNum stat-talent'></div>
                <div class='medium statNum stat-talent statBarWrapper'>
                    <div class='thinProgressBarLower tiny talentBar'><div class='statBar statTalentBar' id='stat${stat}TalentBar'></div></div>
                    <div class='label' id='stat${stat}Talent'>0</div>
                </div>
                <div class='medium statNum stat-level statBarWrapper'>
                    <div class='thinProgressBarLower tiny expBar'><div class='statBar statLevelBar' id='stat${stat}LevelBar'></div></div>
                    <div class='label bold' id='stat${stat}Level'>0</div>
                </div>
            </div>
            <div class='statBars'>
                <div class='thinProgressBarUpper expBar'><div class='statBar statLevelLogBar logBar' id='stat${stat}LevelLogBar'></div></div>
                <div class='thinProgressBarLower talentBar'><div class='statBar statTalentLogBar logBar' id='stat${stat}TalentLogBar'></div></div>
                <div class='thinProgressBarLower soulstoneBar'><div class='statBar statSoulstoneLogBar logBar' id='stat${stat}SoulstoneLogBar'></div></div>
            </div>
            <div class='showthis' id='stat${stat}Tooltip' style='width:225px;'>
                <div class='medium bold'>${longStat}</div><br>${description}
                <br>
                <div class='medium bold'>Level:</div> <div id='stat${stat}Level2'></div>
                <br>
                <div class='medium bold'>Level Exp:</div>
                <div id='stat${stat}LevelExp'></div>/<div id='stat${stat}LevelExpNeeded'></div>
                <div class='statTooltipPerc'>(<div id='stat${stat}LevelProgress'></div>%)</div>
                <br>
                <div class='medium bold'>Talent:</div>
                <div id='stat${stat}Talent2'></div>
                <br>
                <div class='medium bold'>Talent Exp:</div>
                <div id='stat${stat}TalentExp'></div>/<div id='stat${stat}TalentExpNeeded'></div>
                <div class='statTooltipPerc'>(<div id='stat${stat}TalentProgress'></div>%)</div>
                <br>
                <div class='medium bold'>Talent Multi:</div>
                x<div id='stat${stat}TalentMult'></div>
                <br>
                <div id='ss${stat}Container' class='ssContainer'>
                    <div class='bold'>Soul Stones:</div> <div id='ss${stat}'></div><br>
                    <div class='medium bold'>Soul StonesMulti:</div> x<div id='stat${stat}SSBonus'></div>
                </div><br>
                <div class='medium bold'>Total Multi:</div> x<div id='stat${stat}TotalMult'></div>
            </div>
        `
        statsContainer.insertBefore(statContainer, totalContainer);
        top += 100 / stats.length;
    }
    updateCharacterStats(state);
}


let statShowing: CharStat|undefined;
function showStat(state: GameState, stat?: CharStat) {
    statShowing = stat;
    if (stat !== undefined) {
        updateStat(state, stat);
    }
}

export function updateCharacterStats(state: GameState, skipAnimation = false) {
    let maxValue = 100;
    for (const stat of stats) {
        const xp = state.loopState.statsExperience[stat];
        const level = getLevelForExperience(xp);
        const talentXp = state.talentExperience[stat];
        const talentLevel = getLevelForExperience(talentXp);
        maxValue = Math.max(level, talentLevel, state.soulStones[stat], maxValue);
    }
    maxValue = getMaxLogBarScale(maxValue);
    if (skipAnimation) {
        statsContainer.classList.remove("animate-logBars");
        //statGraph.update(true);
    }
    statsContainer.style.setProperty("--max-bar-value", String(maxValue));
    if (!statsContainer.classList.contains("animate-logBars")) {
        requestAnimationFrame(() => statsContainer.classList.add("animate-logBars"));
    }

    for (const stat of stats) {
        updateStat(state, stat);
    }
}

function updateStat(state: GameState, stat: CharStat): void {
    const statDetails = getLevelDetails(state.loopState.statsExperience[stat]);
    const talentDetails = getLevelDetails(state.talentExperience[stat]);
    //const totalLevel = Object.values(stats).map(s=>s.statLevelExp.level).reduce((a,b) => a + b);
    //const totalTalent = Object.values(stats).map(s=>s.talentLevelExp.level).reduce((a,b) => a + b);
    //requireElementById(`stattotalLevel`).textContent = intToString(totalLevel, 1);
    //requireElementById(`stattotalLevel2`).textContent = formatNumber(totalLevel);
    //requireElementById(`stattotalTalent`).textContent = intToString(totalTalent, 1);
    //requireElementById(`stattotalTalent2`).textContent = formatNumber(totalTalent);

    requireElementById(`stat${stat}Level`).textContent = intToString(statDetails.level, 0);
    requireElementById(`stat${stat}Talent`).textContent = intToString(talentDetails.level, 0);



    if (statShowing === stat || requireElementById(`stat${stat}LevelExp`).innerHTML === "") {
        requireElementById(`stat${stat}Level2`).textContent = formatNumber(statDetails.level);
        requireElementById(`stat${stat}LevelExp`).textContent = intToString(statDetails.currentExperience, 0);
        requireElementById(`stat${stat}LevelExpNeeded`).textContent = intToString(statDetails.experienceForNextLevel, 0);
        requireElementById(`stat${stat}LevelProgress`).textContent = statDetails.percentToNextLevel.toFixed(1);

        requireElementById(`stat${stat}Talent2`).textContent = formatNumber(talentDetails.level);
        requireElementById(`stat${stat}TalentExp`).textContent = intToString(talentDetails.currentExperience, 0);
        requireElementById(`stat${stat}TalentExpNeeded`).textContent = intToString(talentDetails.experienceForNextLevel, 0);
        // TODO: Calculate this.
        const talentMulti = 1;
        requireElementById(`stat${stat}TalentMult`).textContent = intToString(talentMulti, 2);
        requireElementById(`stat${stat}TalentProgress`).textContent = talentDetails.percentToNextLevel.toFixed(1);
        requireElementById(`stat${stat}TotalMult`).textContent = intToString(getTotalBonusXP(state, stat), 2);
    }
};
