interface ViewDefinition {
    renderToPage: (state: GameState) => void
}

export const views: ViewDefinition[] = [];
export function drawViews(state: GameState) {
    for (const view of views) {
        view.renderToPage(state);
    }
}
