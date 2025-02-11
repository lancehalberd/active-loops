import {requireSelectById} from 'app/utils/dom';
import {showZone, zoneNames, zoneIndexes} from 'app/zones';


function handleZoneChange(event: Event) {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
        return;
    }
    showZone(Number(target.value) as ZoneIndex);
}

const travelMenu = requireSelectById("TownSelect");
export function initializeTravelMenu(state: GameState) {

    let optionsHTML = '';
    for (const zoneIndex of zoneIndexes) {
        optionsHTML += `<option value=${zoneIndex} class='zone-${zoneIndex+1}' hidden=''>${zoneNames[zoneIndex]}</option>`;
    }
    travelMenu.innerHTML = optionsHTML;
    travelMenu.onchange = handleZoneChange;
    updateTravelMenu(state)
}

export function updateTravelMenu(state: GameState) {
    for (const zoneIndex of zoneIndexes) {
        const option = travelMenu.children[zoneIndex];
        if (option instanceof HTMLOptionElement) {
            option.hidden = !state.discoveredZones.has(zoneIndex);
        }
    }
}
