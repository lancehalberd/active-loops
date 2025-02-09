function getDefaultResources() {
    return {
        gold: 0,
        reputation: 0,
        herbs: 0,
        hides: 0,
        potions: 0,
        teamMembers: 0,
        armor: 0,
        blood: 0,
        artifacts: 0,
        favors: 0,
        enchantments: 0,
        houses: 0,
        pylons: 0,
        zombie: 0,
        map: 0,
        completedMap: 0,
        heart: 0,
        power: 0,
    };
}
function getDefaultBooleanResources() {
    return {
        glasses: false,
        supplies: false,
        pickaxe: false,
        loopingPotion: false,
        citizenship: false,
        pegasus: false,
        key: false,
        stone: false,
        wizardCollege: false,
    };
}


export function setBooleanResource(state: GameState, resource: BooleanResourceType, value: boolean) {
    state.loopState.booleanResources[resource] = value;
    // view.requestUpdate("updateResource", resource);
    // if (resource === "teamMembers" || resource === "armor" || resource === "zombie") view.requestUpdate("updateTeamCombat",null);
}

export function gainResource(state: GameState, resource: ResourceType, amount: number) {
   state.loopState.resources[resource] += amount;
    // view.requestUpdate("updateResource", resource);
    // if (resource === "teamMembers" || resource === "armor" || resource === "zombie") view.requestUpdate("updateTeamCombat",null);
}

export function resetResource(state: GameState, resource: ResourceType) {
    state.loopState.resources[resource] = getDefaultResources()[resource];
    // view.requestUpdate("updateResource", resource);
}

export function resetResources(state: GameState) {
    state.loopState.resources = getDefaultResources();
    state.loopState.booleanResources = getDefaultBooleanResources();
    //if(getExploreProgress() >= 100 || state.prestige.completedAnyPrestige) {
    //    state.loopState.booleanResources.glasses = true;
    //}
    //view.requestUpdate("updateResources", null);
}
