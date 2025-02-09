import {pauseGame} from 'app/utils/driver';
import {getLevelForExperience} from 'app/utils/experience';
import {getExploreProgress, getExploreSkill} from 'app/utils/explore';
import {gainResource} from 'app/utils/resources';

//====================================================================================================
//Survery Actions (All Zones)
//====================================================================================================
function SurveyAction(townIndex: TownIndex) {
    return <const>{
        type: "progress",
        expMult: 1,
        townIndex,
        stats: {
            Per: 0.4,
            Spd: 0.2,
            Con: 0.2,
            Luck: 0.2
        },
        canStart(state: GameState, loop: LoopState) {
            return (loop.resources.map > 0) || getLevelForExperience(state.progress.surveyExperience[townIndex]) === 100;
        },
        manaCost() {
            return 10000 * (townIndex + 1);
        },
        visible() {
            return getExploreProgress() > 0;
        },
        unlocked() {
            return getExploreProgress() > 0;
        },
        finish(state: GameState, loop: LoopState) {
            if (getLevelForExperience(state.progress.surveyExperience[townIndex]) !== 100) {
                gainResource(state, loop, "map", -1);
                gainResource(state, loop, "completedMap", 1);
                towns[townIndex].finishProgress(this.varName, getExploreSkill());
                //view.requestUpdate("updateActionTooltips", null);
            } else if (state.options.pauseOnComplete) {
                pauseGame(state, true, "Survey complete! (Game paused)");
            }
        }
    };
}

Action.SurveyZ0 = new Action("SurveyZ0", SurveyAction(0));
Action.SurveyZ1 = new Action("SurveyZ1", SurveyAction(1));
Action.SurveyZ2 = new Action("SurveyZ2", SurveyAction(2));
Action.SurveyZ3 = new Action("SurveyZ3", SurveyAction(3));
Action.SurveyZ4 = new Action("SurveyZ4", SurveyAction(4));
Action.SurveyZ5 = new Action("SurveyZ5", SurveyAction(5));
Action.SurveyZ6 = new Action("SurveyZ6", SurveyAction(6));
Action.SurveyZ7 = new Action("SurveyZ7", SurveyAction(7));
Action.SurveyZ8 = new Action("SurveyZ8", SurveyAction(8));
