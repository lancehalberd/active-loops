import {computeValue} from 'app/utils/computed';
import {pauseGame} from 'app/utils/driver';
import {maxExperience, stats} from 'app/utils/experience';
import {getSkillBonus} from 'app/utils/skills';

interface BaseActionProps {
    key: string
    label: string
    townIndex: number
    stats: {[key in CharStat]?: number}
    expMult?: number
    manaCost: Computed<number, Action>
    skills?: {[key in SkillKey]?: Computed<number, Action>}
    visible: Computed<boolean, Action>
    unlocked: Computed<boolean, Action>
    maxAllowed?: Computed<number, Action>
    canStart?: (state: GameState) => boolean
    payCost?: (state: GameState) => void
    isLateAction?: boolean
}
export class BaseAction implements Action {
    key = this.props.key;
    label = this.props.label;
    expMult = this.props.expMult ?? 1;
    townIndex = this.props.townIndex;
    manaCost = this.props.manaCost;
    skills = this.props.skills;
    visible = this.props.visible;
    unlocked = this.props.unlocked;
    maxAllowed = this.props.maxAllowed;
    canStart = this.props.canStart;
    payCost = this.props.payCost;
    isLateAction = this.props.isLateAction;
    constructor(public props: BaseActionProps) {}
}

interface BasicActionProps extends BaseActionProps {
    onComplete: (state: GameState, action: Action) => void
}
export class BasicAction extends BaseAction {
    type = <const>'progress';
    constructor(public props: BasicActionProps) {
        super(props);
    }
    onComplete(state: GameState) {
        this.props.onComplete(state, this);
    }
}

interface ProgressActionProps extends BaseActionProps {
    progressKey: ProgressKey
    progressPerAction: Computed<number, ProgressAction>
}
export class ProgressAction extends BaseAction {
    type = <const>'progress';
    progressKey = this.props.progressKey;
    progressPerAction = this.props.progressPerAction;
    constructor(public props: ProgressActionProps) {
        super(props);
    }
    onComplete(state: GameState) {
        const amountGained = computeValue(state, this, this.progressPerAction, 1);
        let experience = state.progressMap[this.progressKey] ?? 0;
        // return if capped, for performance
        if (experience === 505000) {
            if (state.options.pauseOnComplete) {
                pauseGame(state, true, "Progress complete! (Game paused)");
            }
            return;
        }
        experience = Math.min(experience + amountGained, maxExperience);
        state.progressMap[this.progressKey] = experience;
    }
}

interface CheckActionProps extends BaseActionProps {
    checkKey: CheckKey
    totalChecks: Computed<number, CheckAction>
    rewardRatio?: number
    onSuccess: (state: GameState) => void
}
export class CheckAction extends BaseAction {
    type = <const>'check';
    checkKey = this.props.checkKey;
    totalChecks = this.props.totalChecks;
    rewardRatio = this.props.rewardRatio ?? 10;
    onSuccess = this.props.onSuccess;
    constructor(public props: CheckActionProps) {
        super(props);
    }
    onComplete(state: GameState) {
        // error state, negative numbers.
        /*if (this[`total${varName}`] - this[`checked${varName}`] < 0) {
            this[`checked${varName}`] = this[`total${varName}`];
            this[`good${varName}`] = Math.floor(this[`total${varName}`] / rewardRatio);
            this[`goodTemp${varName}`] = this[`good${varName}`];
            console.log("Error state fixed");
        }*/

        const lootFirst = true;
        const total = computeValue(state, this, this.totalChecks, 0);
        let checksChecked = state.checksCheckedMap[this.checkKey] ?? 0;
        let checksLooted = state.loopState.checksLootedMap[this.checkKey] ?? 0;
        const unkownChecksLeft = total - checksChecked;
        const knownGoodChecksLeft = (checksChecked / this.rewardRatio) | 0 - checksLooted;
        if (unkownChecksLeft > 0 && (!lootFirst || knownGoodChecksLeft <= 0)) {
            // Check the contents of an unknown check (will be good 1 in this.ration times).
            checksChecked++;
            state.checksCheckedMap[this.checkKey] = checksChecked;
            if (checksChecked % this.rewardRatio === 0) {
                state.loopState.checksLootedMap[this.checkKey] = checksLooted + 1;
                this.onSuccess(state);
            }
        } else if (knownGoodChecksLeft > 0) {
            state.loopState.checksLootedMap[this.checkKey] = checksLooted + 1;
            this.onSuccess(state);
        } else {
            // Failure: nothing left to check.
        }
        //view.requestUpdate("updateRegular", {name: varName, index: this.index});
    }
}

interface MultipartActionProps extends BaseActionProps {
    key: MultipartActionKey
    onComplete: (state: GameState, action: Action) => void
    getBarLabel: (barIndex: number) => string
    segmentStats: CharStat[]
    getSegmentLabel: (barIndex: number, segmentIndex: number) => string
    getSegmentCost: (state: GameState, segmentIndex: number, barIndex: number) => number
    getProgressMultiplier: (state: GameState, totalCompletions: number) => number
    onCompleteBar?: (state: GameState, barIndex: number) => void
    onCompleteSegment?: (state: GameState, barIndex: number, segmentIndex: number) => void
}
export class MultipartAction extends BaseAction {
    type = <const>'progress';
    constructor(public props: MultipartActionProps) {
        super(props);
    }
    onComplete(state: GameState) {
        this.props.onComplete(state, this);
    }
}


const dungeonBaseSS = <const>{
    smallDungeon: 10,
    largeDungeon: 100,
    spire: 1000,
}
interface DungeonActionProps extends MultipartActionProps {
    key: DungeonKey
}
export class DungeonAction extends BaseAction {
    type = <const>'progress';
    key = this.props.key;
    constructor(public props: DungeonActionProps) {
        super(props);
    }
    onCompleteBar(state: GameState) {
        const curFloor = state.loopState.multipartProgressMap[this.key]?.barIndex ?? 0;
        const floorState = state.dungeonFloorCompletions[this.key][curFloor];
        if (!floorState) {
            return false;
        }
        floorState.completed++;
        const rand = Math.random();
        if (rand > floorState.lootChance) {
            return false;
        }
        const statToAdd = stats[Math.floor(Math.random() * stats.length)];
        floorState.lastStat = statToAdd;
        const countToAdd = Math.floor(dungeonBaseSS[this.key] * getSkillBonus(state, "Divine"));
        state.soulStones[statToAdd] = (state.soulStones[statToAdd] ?? 0) + countToAdd;
        floorState.lootChance *= 0.98;
        // view.requestUpdate("updateSoulstones",null);
        // actionLog.addSoulstones(this, statToAdd, countToAdd);
        return true;
    }
}
