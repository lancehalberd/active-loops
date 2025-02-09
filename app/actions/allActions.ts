export const allActions: {[key: string]: Action} = {};

export function addAction(action: Action) {
    allActions[action.key] = action;
}
