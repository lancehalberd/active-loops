import {requireElementById, toggleVisibility} from 'app/utils/dom';

//const curActionsDiv = requireElementById("curActionsList");
//const nextActionsDiv = requireElementById("nextActionsList");
const actionOptionsTown: HTMLElement[] = [];
const actionStoriesTown: HTMLElement[] = [];
const townInfos: HTMLElement[] = [];
let actionStoriesShowing = false;

for (let i = 0; i <= 8; i++) {
    actionOptionsTown[i] = requireElementById(`actionOptionsTown${i}`);
    const actionDiv = document.createElement('div');
    actionDiv.className = "actionDiv";
    const travelDiv = document.createElement('div');
    travelDiv.className = "travelDiv";
    actionOptionsTown[i].append(actionDiv);
    actionOptionsTown[i].append(travelDiv);
    actionStoriesTown[i] = requireElementById(`actionStoriesTown${i}`);
    townInfos[i] = requireElementById(`townInfo${i}`);
}

export function createZoneActions() {
    if (actionOptionsTown[0].querySelector(".actionOrTravelContainer")) return;
    for (const action of towns.flatMap(t => t.totalActionList)) {
        this.createTownAction(action);
    }
    for (const varName of towns.flatMap(t => t.allVarNames)) {
        const action = totalActionList.find(a => a.varName === varName);
        if (isActionOfType(action, "limited")) this.createTownInfo(action);
        if (isActionOfType(action, "progress")) {
            if (action.name.startsWith("Survey")) this.createGlobalSurveyProgress(action);
            this.createActionProgress(action);
        }
        if (isActionOfType(action, "multipart")) this.createMultiPartPBar(action);
    }
    if (options.highlightNew) this.highlightIncompleteActions();
}


const previousZoneButton = requireElementById("townViewLeft");
const nextZoneButton = requireElementById("townViewRight");
export function showZone(state: GameState, zoneIndex: ZoneIndex) {
    if (!state.discoveredZones.has(zoneIndex)) {
        return;
    }

    const highestZoneIndex = Math.max(...state.discoveredZones);

    toggleVisibility(previousZoneButton, zoneIndex !== 0);
    toggleVisibility(nextZoneButton, zoneIndex !== highestZoneIndex);

    for (let i = 0; i < actionOptionsTown.length; i++) {
        actionOptionsTown[i].style.display = "none";
        actionStoriesTown[i].style.display = "none";
        townInfos[i].style.display = "none";
    }
    if (actionStoriesShowing) actionStoriesTown[zoneIndex].style.display = "";
    else actionOptionsTown[zoneIndex].style.display = "";
    townInfos[zoneIndex].style.display = "";
    $("#TownSelect").val(zoneIndex);
    htmlElement("shortTownColumn").classList.remove(`zone-${townShowing+1}`);
    htmlElement("shortTownColumn").classList.add(`zone-${zoneIndex+1}`);
    document.getElementById("townDesc").textContent = _txt(`towns>town${zoneIndex}>desc`);
    townShowing = zoneIndex;
}

export function showActions(stories) {
    for (let i = 0; i < actionOptionsTown.length; i++) {
        actionOptionsTown[i].style.display = "none";
        actionStoriesTown[i].style.display = "none";
    }

    if (stories) {
        document.getElementById("actionsViewLeft").style.visibility = "";
        document.getElementById("actionsViewRight").style.visibility = "hidden";
        actionStoriesTown[townShowing].style.display = "";
    } else {
        document.getElementById("actionsViewLeft").style.visibility = "hidden";
        document.getElementById("actionsViewRight").style.visibility = "";
        actionOptionsTown[townShowing].style.display = "";
    }

    document.getElementById("actionsTitle").textContent = _txt(`actions>title${(stories) ? "_stories" : ""}`);
    actionStoriesShowing = stories;
}
