import {ProgressAction} from 'app/actions/action';
import {addAction} from 'app/actions/allActions';
import {pauseGame} from 'app/utils/driver';
import {getLevelForExperience} from 'app/utils/experience';
import {getExploreProgress, getExploreSkill} from 'app/utils/explore';
import {gainResource} from 'app/utils/resources';
import {zoneIndexes} from 'app/zones';

const surveyKeys = <const>['zone0Survey','zone1Survey','zone2Survey','zone3Survey','zone4Survey','zone5Survey','zone6Survey','zone7Survey','zone8Survey'];
for (const zoneIndex of zoneIndexes) {
    const surveyKey = surveyKeys[zoneIndex];
    addAction(new ProgressAction({
        key: 'SurveyZ' + zoneIndex,
        label: 'Survey',
        zoneIndex,
        manaCost: 10000 * (zoneIndex + 1),
        stats: {Per: 0.4, Spd: 0.2, Con: 0.2, Luck: 0.2},
        visible: (state: GameState) => getExploreProgress(state) > 0,
        unlocked: (state: GameState) => getExploreProgress(state) > 0,
        canStart(state: GameState) {
                return (state.loopState.resources.maps > 0) || getLevelForExperience(state.progressMap[surveyKey] ?? 0) === 100;
        },
        progressKey: surveyKey,
        progressPerAction:(state: GameState) => getExploreSkill(state),
        onComplete(state: GameState) {
            if (getLevelForExperience(state.progressMap[surveyKey] ?? 0) !== 100) {
                gainResource(state, 'maps', -1);
                gainResource(state, 'completedMaps', 1);
                //view.requestUpdate("updateActionTooltips", null);
            } else if (state.options.pauseOnComplete) {
                pauseGame(state, true, 'Survey complete! (Game paused)');
            }
        }
    }));
}

