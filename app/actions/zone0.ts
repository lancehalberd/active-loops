import {BasicAction, CheckAction, DungeonAction, MultipartAction, ProgressAction} from 'app/actions/action';
import {addAction} from 'app/actions/allActions';
import {unlockZone} from 'app/utils/driver';
import {getProgressLevel} from 'app/utils/experience';
import {getExploreProgress} from 'app/utils/explore';
import {fibonacci, numberToWords, precision3} from 'app/utils/helpers';
import {adjustGoldCostFromPrestige} from 'app/utils/prestige';
import {setBooleanResource, gainResource, resetResource} from 'app/utils/resources';
import {gainSkillExperienceForAction, getSkillBonus, getSkillLevel, getSkillMod} from 'app/utils/skills';

//Zone 1 - Beginnersville
const townIndex = 0;
addAction(new BasicAction({
    key: 'mapZ0',
    label: 'Map',
    townIndex,
    stats: {
        Cha: 0.8,
        Luck: 0.1,
        Soul: 0.1
    },
    manaCost: 200,
    visible: (state: GameState) => getExploreProgress(state) > 0,
    unlocked: (state: GameState) => getExploreProgress(state) > 0,
    onComplete(state: GameState) {
        gainResource(state, "gold", -15);
        gainResource(state, "maps", 1);
    },
    maxAllowed: 1,
    canStart(state: GameState) {
        return state.loopState.resources.gold >= 15;
    },
    // story: (state: GameState, completed: boolean) => setStoryFlag("glassesBought"),
    isLateAction: true,
}));
addAction(new ProgressAction({
    key: 'zone0Explore',
    label: 'Wander',
    townIndex,
    manaCost: 250,
    stats: {
        Per: 0.2,
        Con: 0.2,
        Cha: 0.2,
        Spd: 0.3,
        Luck: 0.1
    },
    visible: true,
    unlocked: true,
    // I think this is used to display the smaller icons on the action.
    // affectedBy: ["Buy Glasses"],
    progressKey: 'zone0Explored',
    progressPerAction:(state: GameState) => 200 * (state.loopState.resources.glasses ? 4 : 1),
}));
addAction(new CheckAction({
    key: 'smashPots',
    checkKey: 'pots',
    label: 'Smash Pots',
    townIndex,
    stats: {
        Str: 0.2,
        Per: 0.2,
        Spd: 0.6,
    },
    manaCost(state: GameState) {
        return Math.ceil(50 * getSkillBonus(state, 'Practical'));
    },
    visible: true,
    unlocked: true,
    totalChecks(state: GameState) {
        return getProgressLevel(state, 'zone0Explored') * 5;
        // TODO: include prestige + survey bonuses here.
        // let basePots = Math.round(getProgressLevel(state, 'zone0Explored') * 5 * adjustContentFromPrestige());
        // return Math.floor(basePots + basePots * getSurveyBonus(town));
    },
    onSuccess(state: GameState): number {
        const manaGain = Math.floor(100 * getSkillBonus(state, 'Dark'));
        addMana(manaGain);
        return manaGain;
    },
}));
addAction(new CheckAction({
    key: 'pickLocks',
    checkKey: 'locks',
    label: 'Pick Locks',
    townIndex,
    stats: {
        Dex: 0.5,
        Per: 0.3,
        Spd: 0.1,
        Luck: 0.1,
    },
    manaCost: 400,
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Explored') >= 3),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Explored') >= 20),
    totalChecks(state: GameState) {
        return getProgressLevel(state, 'zone0Explored');
        // TODO: include prestige + survey bonuses here.
        // let baseLocks = Math.round(getProgressLevel(state, 'zone0Explored') * adjustContentFromPrestige());
        // town.totalLocks = Math.floor(baseLocks * getSkillMod("Spatiomancy", 100, 300, .5) + baseLocks * getSurveyBonus(town));
    },
    onSuccess(state: GameState): number {
        let base = 10;
        const goldGain = (base * getSkillMod(state, 'Practical', 0, 200, 1) * getSkillBonus(state, 'Thievery')) | 0;
        gainResource(state, 'gold', goldGain);
        return goldGain;
    },
}));
addAction(new BasicAction({
    key: 'buyGlasses',
    label: 'Buy Glasses',
    townIndex,
    stats: {
        Cha: 0.7,
        Spd: 0.3
    },
    manaCost: 50,
    visible: (state: GameState) => (
        getProgressLevel(state, 'zone0Explored') >= 3
        && getExploreProgress(state) < 100
        && !state.prestige.completedAnyPrestige
    ),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Explored') >= 20),
    onComplete(state: GameState) {
        setBooleanResource(state, 'glasses', true);
    },
    maxAllowed: 1,
    canStart(state: GameState) {
        return state.loopState.resources.gold >= 10;
    },
    payCost(state: GameState) {
        gainResource(state, "gold", -10);
    },
    // story: (state: GameState, completed: boolean) => setStoryFlag("glassesBought"),
}));
// This replaces the Buy Glasses action to indicate that you start each loop with glasses.
addAction(new BasicAction({
    key: 'findGlasses',
    label: 'Found Glasses',
    townIndex,
    expMult: 0,
    stats: {},
    manaCost: 0,
    // affectedBy: ["SurveyZ1"],
    visible: (state: GameState) => (
        getExploreProgress(state) >= 100
        || !!state.prestige.completedAnyPrestige
    ),
    unlocked: false,
    onComplete(state: GameState) {
    },
    maxAllowed: 0,
    canStart(state: GameState) {
        return false;
    },
    payCost(state: GameState) {
        gainResource(state, "gold", -10);
    },
    // story: (state: GameState, completed: boolean) => setStoryFlag("glassesBought"),
}));
addAction(new BasicAction({
    key: 'buyManaZ0',
    label: 'Buy Mana',
    townIndex,
    stats: {
        Cha: 0.7,
        Int: 0.2,
        Luck: 0.1
    },
    manaCost: 100,
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Explored') >= 3),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Explored') >= 20),
    onComplete(state: GameState) {
        const manaPerGold = Math.floor(50 * getSkillBonus(state, 'Mercantilism') * adjustGoldCostFromPrestige(state));
        addMana(state.loopState.resources.gold * manaPerGold);
        resetResource(state, 'gold');
    }
}));
addAction(new ProgressAction({
    key: 'meetPeople',
    label: 'Meet People',
    townIndex,
    manaCost: 800,
    stats: {Int: 0.1, Cha: 0.8, Soul: 0.1},
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Explored') >= 10),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Explored') >= 22),
    progressKey: 'zone0People',
    progressPerAction: 200,
}));
addAction(new BasicAction({
    key: 'trainStrength',
    label: 'Train Strength',
    townIndex,
    expMult: 4,
    stats: {Str: 0.8, Con: 0.2},
    manaCost: 2000,
    maxAllowed: (state: GameState) => state.maxTrainings,
    visible: (state: GameState) => (getProgressLevel(state, 'zone0People') >= 1),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0People') >= 5),
    onComplete(state: GameState) {
        // The benefit is the expMulti.
    }
}));
addAction(new CheckAction({
    key: 'shortQuest',
    checkKey: 'shortQuests',
    label: 'Short Quest',
    townIndex,
    stats: {Str: 0.2, Dex: 0.1, Cha: 0.3, Spd: 0.2, Luck: 0.1, Soul: 0.1},
    manaCost: 600,
    visible: (state: GameState) => (getProgressLevel(state, 'zone0People') >= 1),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0People') >= 5),
    totalChecks(state: GameState) {
        return getProgressLevel(state, 'zone0People');
        // TODO: include prestige + survey bonuses here.
        //let baseSQuests = Math.round(getProgressLevel(state, 'zone0People') * adjustContentFromPrestige());
        //town.totalSQuests = Math.floor(baseSQuests * getSkillMod("Spatiomancy", 200, 400, .5) + baseSQuests * getSurveyBonus(town));
    },
    onSuccess(state: GameState): number {
        let base = 20;
        const goldGain = (base * getSkillMod(state, 'Practical', 100, 300, 1)) | 0;
        gainResource(state, 'gold', goldGain);
        return goldGain;
    },
}));
addAction(new ProgressAction({
    key: 'investigate',
    label: 'Investigate',
    townIndex,
    manaCost: 1000,
    stats: {Per: 0.3, Cha: 0.4, Spd: 0.2, Luck: 0.1},
    visible: (state: GameState) => (getProgressLevel(state, 'zone0People') >= 5),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0People') >= 25),
    progressKey: 'zone0Investigated',
    progressPerAction: 500,
}));
addAction(new CheckAction({
    key: 'longQuest',
    checkKey: 'longQuests',
    label: 'Long Quest',
    townIndex,
    stats: {Str: 0.2, Int: 0.2, Con: 0.4, Spd: 0.2},
    manaCost: 1500,
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 1),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 10),
    totalChecks(state: GameState) {
        return Math.round(getProgressLevel(state, 'zone0Investigated') / 2);
        // TODO: include prestige + survey bonuses here.
        //let baseLQuests = Math.round(getProgressLevel(state, 'zone0Investigated') / 2 * adjustContentFromPrestige());
        //town.totalLQuests = Math.floor(baseLQuests * getSkillMod("Spatiomancy", 300, 500, .5) + baseLQuests * getSurveyBonus(town));
    },
    onSuccess(state: GameState): number {
        let base = 30;
        const goldGain = (base * getSkillMod(state, 'Practical', 200, 400, 1)) | 0;
        gainResource(state, 'gold', goldGain);
        gainResource(state, 'reputation', 1);
        return goldGain;
    },
}));
addAction(new ProgressAction({
    key: 'throwParty',
    label: 'Throw Party',
    townIndex,
    expMult: 2,
    manaCost: 1600,
    stats: {Cha: 0.8, Soul: 0.2},
    canStart: (state: GameState) => (state.loopState.resources.reputation >= 2),
    payCost: (state: GameState) => gainResource(state, 'reputation', -2),
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 20),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 30),
    progressKey: 'zone0People',
    progressPerAction: 3200,
}));
addAction(new BasicAction({
    key: 'warriorLessons',
    label: 'Warrior Lessons',
    townIndex,
    expMult: 1.5,
    stats: {Str: 0.5, Dex: 0.3, Con: 0.2},
    skills: {Combat: 100},
    manaCost: 1000,
    canStart: (state: GameState) => (state.loopState.resources.reputation >= 2),
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 10),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 20),
    onComplete: gainSkillExperienceForAction
}));
addAction(new BasicAction({
    key: 'mageLessons',
    label: 'Mage Lessons',
    townIndex,
    expMult: 1.5,
    stats: {Per: 0.3, Int: 0.5, Con: 0.2},
    skills: {Magic: (state: GameState) => 100 * (1 + getSkillLevel(state, 'Alchemy') / 100)},
    manaCost: 1000,
    canStart: (state: GameState) => (state.loopState.resources.reputation >= 2),
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 10),
    unlocked: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 20),
    onComplete: gainSkillExperienceForAction
}));
addAction(new MultipartAction({
    key: 'healTheSick',
    label: 'Heal The Sick',
    townIndex,
    stats: {Per: 0.2, Int: 0.2, Cha: 0.2, Soul: 0.4},
    skills: {Magic: 10},
    manaCost: 2500,
    canStart: (state: GameState) => (state.loopState.resources.reputation >= 1),
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 20),
    unlocked: (state: GameState) => (getSkillLevel(state, 'Magic') >= 12),

    getBarLabel(barIndex: number) {
        return `Patient ${numberToWords(barIndex + 1)}`;
    },
    segmentStats: ['Per', 'Int', 'Cha'],
    getSegmentLabel(barIndex: number, segmentIndex: number) {
        return ['Diagnose', 'Treat', 'Inform'][segmentIndex];
    },
    getSegmentCost(state: GameState, segmentIndex: number, barIndex: number) {
        return fibonacci(2 + ((barIndex + segmentIndex) / 3 + 0.0000001) | 0) * 5000;
    },
    getProgressMultiplier(state: GameState, totalCompletions: number) {
        return getSkillLevel(state, 'Magic') * Math.max(getSkillLevel(state, 'Restoration') / 50, 1) * Math.sqrt(1 + totalCompletions / 100);
    },
    onCompleteBar(state: GameState, barIndex: number) {
        gainResource(state, 'reputation', 3);
    },
    onComplete: gainSkillExperienceForAction,
}));
addAction(new MultipartAction({
    key: 'fightMonsters',
    label: 'Fight Monsters',
    townIndex,
    stats: {Str: 0.3, Spd: 0.3, Con: 0.3, Luck: 0.1},
    skills: {Combat: 10},
    manaCost: 2000,
    canStart: (state: GameState) => (state.loopState.resources.reputation >= 2),
    visible: (state: GameState) => (getProgressLevel(state, 'zone0Investigated') >= 20),
    unlocked: (state: GameState) => (getSkillLevel(state, 'Combat') >= 10),

    getBarLabel(barIndex: number) {
        const monsterName = 'Monster ' + (barIndex + 1);
        return monsterName;
    },
    segmentStats: ["Spd", "Spd", "Spd", "Str", "Str", "Str", "Con", "Con", "Con"],
    getSegmentLabel(barIndex: number, segmentIndex: number) {
        const monsterName = 'Monster ' + (barIndex + 1);
        return ['A couple of ', 'A few ', 'A bunch of '][segmentIndex] + monsterName;
        //if (barIndex >= this.segmentNames.length) return this.altSegmentNames[monster % 3];
        //return this.segmentNames[monster];
    },
    getSegmentCost(state: GameState, segmentIndex: number, barIndex: number) {
        return fibonacci((segmentIndex + 2 * barIndex / 3 + 0.0000001) | 0) * 10000;
    },
    getProgressMultiplier(state: GameState, totalCompletions: number) {
        return getSelfCombat() * Math.sqrt(1 + totalCompletions / 100);
    },
    onCompleteSegment(state: GameState) {
        gainResource(state, 'gold', 20);
    },
    onComplete: gainSkillExperienceForAction,
}));
addAction(new DungeonAction({
    key: 'smallDungeon',
    label: 'Small Dungeon',
    townIndex,
    stats: { Str: 0.1, Dex: 0.4, Con: 0.3, Cha: 0.1, Luck: 0.1},
    skills: {Combat: 5, Magic: 5},
    manaCost: 2000,
    canStart: (state: GameState) => {
        const curFloor = state.loopState.multipartProgressMap.smallDungeon?.barIndex ?? 0;
        return state.loopState.resources.reputation >= 2 && curFloor < 6;
    },
    visible: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 15),
    unlocked: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 35),

    getBarLabel(barIndex: number) {
        const monsterName = 'Floor ' + (barIndex + 1);
        return monsterName;
    },
    segmentStats: ["Dex", "Con", "Dex", "Cha", "Dex", "Str", "Luck"],
    getSegmentLabel(barIndex: number, segmentIndex: number) {
        return ["Dex", "Con", "Dex", "Cha", "Dex", "Str", "Luck"][segmentIndex] + ' Check';
    },
    getSegmentCost(state: GameState, segmentIndex: number, barIndex: number) {
        return precision3(Math.pow(2, Math.floor((barIndex + segmentIndex) / 7 + 0.0000001)) * 15000);
    },
    getProgressMultiplier(state: GameState, totalCompletions: number) {
        const curFloor = state.loopState.multipartProgressMap.smallDungeon?.barIndex ?? 0;
        const floorCompletions = state.dungeonFloorCompletions.smallDungeon[curFloor].completed ?? 0;
        return (getSelfCombat() + getSkillLevel(state, 'Magic')) * Math.sqrt(1 + floorCompletions / 200);
    },
    onComplete: gainSkillExperienceForAction,
}));
addAction(new BasicAction({
    key: 'buySupplies',
    label: 'Buy Supplies',
    townIndex,
    stats: {Cha: 0.8, Luck: 0.1, Soul: 0.1},
    manaCost: 200,
    canStart: (state: GameState) => (
        state.loopState.resources.gold >= state.loopState.suppliesCost
        && !state.loopState.booleanResources.supplies
    ),
    payCost: (state: GameState) => gainResource(state, 'gold', -state.loopState.suppliesCost),
    maxAllowed: 1,
    visible: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 15),
    unlocked: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 35),
    onComplete: (state: GameState) => setBooleanResource(state, 'supplies', true),
}));
addAction(new BasicAction({
    key: 'haggle',
    label: 'Haggle',
    townIndex,
    stats: {Cha: 0.8, Luck: 0.1, Soul: 0.1},
    manaCost: 100,
    canStart: (state: GameState) => (state.loopState.resources.reputation >= 1),
    payCost: (state: GameState) => gainResource(state, 'reputation', -1),
    visible: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 15),
    unlocked: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 35),
    onComplete(state: GameState) {
        state.loopState.suppliesCost = Math.max(0, state.loopState.suppliesCost - 20);
        // view.requestUpdate("updateResource", "supplies");
    }
}));
addAction(new BasicAction({
    key: 'z0z1',
    label: 'Start Journey',
    townIndex,
    stats: {Con: 0.4, Per: 0.3, Spd: 0.3},
    manaCost: 1000,
    canStart: (state: GameState) => state.loopState.booleanResources.supplies,
    payCost: (state: GameState) => setBooleanResource(state, 'supplies', false),
    maxAllowed: 1,
    visible: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 15),
    unlocked: (state: GameState) => ((getSkillLevel(state, "Combat") + getSkillLevel(state, "Magic")) >= 35),
    onComplete: (state: GameState) =>unlockZone(state, 1),
}));
addAction(new BasicAction({
    key: 'z0z2',
    label: 'Hitch Ride',
    townIndex,
    stats: {Cha: 0.5, Per: 0.5},
    manaCost: 1,
    payCost: (state: GameState) => setBooleanResource(state, 'supplies', false),
    maxAllowed: 1,
    visible: (state: GameState) => getExploreProgress(state) > 1,
    unlocked: (state: GameState) => getExploreProgress(state) >= 25,
    onComplete: (state: GameState) => unlockZone(state, 2),
}));
addAction(new BasicAction({
    key: 'z0z5',
    label: 'Open Rift',
    townIndex,
    stats: {Int: 0.2, Luck: 0.1, Soul: 0.7},
    skills: {Dark: 1000},
    manaCost: 50000,
    payCost: (state: GameState) => setBooleanResource(state, 'supplies', false),
    maxAllowed: 1,
    visible: (state: GameState) => getProgressLevel(state, 'zone5Meander') >= 1,
    unlocked: (state: GameState) => (getSkillLevel(state, "Dark") >= 300 && getSkillLevel(state, "Spatiomancy") >= 100),
    onComplete(state: GameState, action: Action) {
        gainSkillExperienceForAction(state, action);
        // setBooleanResource(state, 'supplies', false);
        unlockZone(state, 5);
    }
}));
