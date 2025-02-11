type ZoneIndex = 0|1|2|3|4|5|6|7|8;

type CharStat = 'Cha' | 'Con' | 'Dex' | 'Int' | 'Luck' | 'Per' | 'Soul' | 'Spd' | 'Str';

type ProgressKey =
    'zone0Explored' | 'zone0People' | 'zone0Investigated'
    | 'zone1Forest' | 'zone1Shortcuts' | 'zone1Hermit' | 'zone1FlowerTrails' | 'zone1Thicket' | 'zone1Witch'
    | 'zone5Meander'
    | 'zone0Survey' | 'zone1Survey' | 'zone2Survey' | 'zone3Survey' | 'zone4Survey'
    | 'zone5Survey' | 'zone6Survey' | 'zone7Survey' | 'zone8Survey';

type CheckKey = 'pots' | 'locks' | 'shortQuests' | 'longQuests' | 'wildMana' | 'herbs' | 'animals' | 'suckers';

type DungeonKey = 'smallDungeon' | 'largeDungeon' | 'spire';
type MultipartActionKey = 'healTheSick' | 'fightMonsters' | DungeonKey;

type SkillKey = "Combat" | "Magic" | "Practical" | "Alchemy" | "Crafting" | "Dark"
    | "Chronomancy" | "Pyromancy" | "Restoration" | "Spatiomancy" | "Mercantilism" | "Divine"
    | "Commune" | "Wunderkind" | "Gluttony" | "Thievery" | "Leadership" | "Assassin";

type Computed<T, U> = T | ((state: GameState, object: U) => T);

type ResourceType = 'gold' | 'reputation' | 'herbs' | 'hides' | 'potions' | 'teamMembers' | 'armor'
    | 'blood' | 'artifacts' | 'favors' | 'enchantments' | 'houses' | 'pylons'| 'zombies' | 'maps'
    | 'completedMaps' | 'hearts' | 'power';

type BooleanResourceType = 'glasses' | 'supplies' | 'pickaxe' | 'loopingPotion' | 'citizenship' | 'pegasus' | 'key' | 'stone' | 'wizardCollege';

type BuffKey = "Ritual" | 'Heroism' | 'Feast';
type PrestigeBuff = 'PrestigeBartering' | 'PrestigeChronomancy' | 'PrestigeCombat' | 'PrestigeExpOverflow'
    | 'PrestigeMental' | 'PrestigePhysical' | 'PrestigeSpatiomancy';

interface Skill {
    key: string
    getBonus: (skillLevel: number) => number
}

interface Action {
    key: string
    label: string
    skills?: {[key in SkillKey]?: Computed<number, Action>}
    onComplete?: (state: GameState) => void
}

interface DungeonFloorState {
    completed: number
    lootChance: number
    lastStat?: CharStat
}
// Stores state for the entire game.
interface GameState {
    discoveredZones: Set<ZoneIndex>
    prestige: PrestigeState
    progressMap: {[key in ProgressKey]?: number}
    checksCheckedMap: {[key in CheckKey]?: number}
    options: GameOptions
    loopState: LoopState
    talentExperience: {[key in CharStat]: number}
    soulStones: {[key in CharStat]: number}
    skills: {[key in SkillKey]?: number}
    buffs: {[key in BuffKey]: number}
    multipartCompletions:  {[key in MultipartActionKey]?: number}
    dungeonFloorCompletions: {[key in DungeonKey]: DungeonFloorState[]}
    maxTrainings: number
    gameIsStopped?: boolean
    shouldRestart?: boolean
}

interface GameOptions {
    pauseOnComplete?: boolean
    notifyOnPause?: boolean
    pingOnPause?: boolean
}

interface PrestigeState {
    completedAnyPrestige?: boolean
}

// Stores state for a loop in progress
interface LoopState {
    // The current zone.
    zoneIndex: ZoneIndex
    // Available resources.
    resources: {
        [key in ResourceType]: number
    }
    booleanResources: Set<BooleanResourceType>
    checksLootedMap: {[key in CheckKey]?: number}
    statsExperience: {[key in CharStat]: number}
    multipartProgressMap: {[key in MultipartActionKey]?: {
        barIndex: number
        segmentIndex: number
        segmentProgress: number
    }}
    suppliesCost: number
    mana: number
}

interface Window {
    [key: string]: any;
}

// Game Data
// computed()

// State Data
// X explored/learned/followed

// Loop Data
// pots smashed(good/bad)

/*interface Action<N, E> {
    // provided as extras in constructor:
    type: E["type"];
    expMult: E["expMult"];
    townNum: E["townNum"];
    story?: (completed: number) => void,
    storyReqs?: (storyNum: number) => boolean;
    stats: E["stats"];
    canStart(loopCounter?: number): boolean;
    cost?: () => void,
    manaCost(): number;
    goldCost?: () => number;
    allowed?: () => number;
    visible(): boolean;
    unlocked(): boolean;
    finish(): void;
    skills?: E["skills"];
    grantsBuff?: E["grantsBuff"];
    affectedBy?: readonly string[];
    progressScaling?: ProgressScalingType;
}

declare interface MultipartAction<const N, const E> {
    segments: number;

    loopStats: E["loopStats"];
    loopCost(segment: number, loopCounter?: number): number;
    tickProgress(offset: number, loopCounter?: number, totalCompletions?: number): number;
    segmentFinished?: (loopCounter?: number) => void;
    loopsFinished(loopCounter?: number): void;
    getPartName(): string;
    completedTooltip?: () => string;
}

declare interface DungeonAction<const N, const E> {

}

declare interface TrialAction<const N, const E> {
    floorReward(): ReturnType<E["floorReward"]>;
    baseProgress(): number;
    baseScaling: E["baseScaling"];
    exponentScaling?: E["exponentScaling"];
}

declare interface AssassinAction<const N, const E> {

}

type DTJHTMLTag = "span" | "div" | "ol" | "ul" | "li" | "table" | "tr" | "td";
type DTJHTML<O=unknown,C=unknown> = [DTJHTMLTag, {style?: string}, ...DTJML<O,C>[]] | [DTJHTMLTag, ...DTJML<O,C>[]];
type DTJML<O=unknown,C=unknown> = DTJHTML<O,C> | ["object", {object: O, config: C} | {object: any}] | string;
interface DTFormatter<O=any, C=any> {
    header(object: unknown, config?: C): DTJHTML<O,C> | null;
    hasBody?: (object: O, config?: C) => boolean;
    body?: (object: O, config?: C) => DTJHTML<O,C> | null;
}

declare interface Window {
    devtoolsFormatters: DTFormatter[];
}*/

//declare const LZString = await import("lz-string");
//declare const Mousetrap = await import("mousetrap");

/**
 * interface MultipartActionExtras extends ActionExtras {
 *     loopStats: readonly StatName[],
 *     loopCost(segment: number, loopCounter?: number): number,
 *     tickProgress(offset: number, loopCounter?: number, totalCompletions?: number): number,
 *     segmentFinished?: (loopCounter?: number) => void,
 *     loopsFinished(loopCounter?: number): void,
 *     getSegmentName?: (segment: number) => string,
 *     getPartName(loopCounter?: number): string,
 *     completedTooltip?: () => string,
 * }
 *
 */
