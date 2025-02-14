import {getState} from 'app/state';
import {requireElementById} from 'app/utils/dom';
import {initializeCharacterStats} from 'app/views/characterStats';
import {createZoneActions, showActions} from 'app/views/zoneActions';
import {initializeTravelMenu} from 'app/views/travelMenu';
import {showZone} from 'app/zones';

window.closeTutorial = () => requireElementById("tutorial").style.display = "none";
window.closeTutorial();

const state = getState();
initializeTravelMenu(state);
initializeCharacterStats(state);

createZoneActions(state);
showZone(0);
showActions(state, false);
