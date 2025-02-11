
export function getDefaultStatMap<T>(defaultValue: T): {[key in CharStat]: T} {
    return {
        Cha: defaultValue, 
        Con: defaultValue, 
        Dex: defaultValue, 
        Int: defaultValue, 
        Luck: defaultValue, 
        Per : defaultValue, 
        Soul : defaultValue, 
        Spd : defaultValue, 
        Str: defaultValue,
    };
}
export function getEmptyDungeonState(floorCount: number): DungeonFloorState[] {
    const floors: DungeonFloorState[] = [];
    for (let i = 0; i < floorCount; i++) {
        floors.push({
            completed: 0,
            lootChance: 1,
        });
    }
    return floors;
}

export function getNewState(): GameState {
    return {
        discoveredZones: new Set(),
        prestige: {},
        progressMap: {},
        checksCheckedMap: {},
        options: {
            pauseOnComplete: false,
        },
        loopState: getNewLoopState(),
        talentExperience: getDefaultStatMap(0),
        soulStones: getDefaultStatMap(0),
        skills: {},
        buffs: {
            Heroism: 0,
            Ritual: 0,
            Feast: 0,
        },
        multipartCompletions:  {},
        dungeonFloorCompletions: {
            smallDungeon: getEmptyDungeonState(6),
            largeDungeon: getEmptyDungeonState(10),
            spire: getEmptyDungeonState(20),
        },
        maxTrainings: 10,
    }
}

export function getNewLoopState(): LoopState {
    return {
        zoneIndex: 0,
        resources: {
            gold: 0, reputation: 0, herbs: 0, hides: 0, potions: 0, teamMembers: 0, armor: 0,
            blood: 0, artifacts: 0, favors: 0, enchantments: 0, houses: 0, pylons: 0, zombies: 0, maps: 0,
            completedMaps: 0, hearts: 0, power: 0,
        },
        booleanResources: new Set(),
        checksLootedMap: {},
        statsExperience: getDefaultStatMap(0),
        multipartProgressMap: {},
        suppliesCost: 300,
        mana: 250,
    }
}

let state = getNewState();

export function getState() {
    return state;
}
