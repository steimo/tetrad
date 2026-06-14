import { prepareWithSegments, layoutNextLineRange, materializeLineRange } from '@chenglou/pretext';

const FONT = `13px ${getComputedStyle(document.body).fontFamily}`;
const TEXT_STYLE = `font: ${FONT}; fill: #444; pointer-events: none;`;
const LINE_HEIGHT = 16;
const OUTER_EDGE_GAP = 22;
const MAX_WIDTH = 100;
const TOP_MARGIN = 10;
const BOTTOM_MARGIN = 10;
const STORAGE_KEY = 'tetrad-state';
const CENTER_LABEL_MAX_WIDTH = 180;
const CENTER_LABEL_FONT_SIZE = 18;

function updateCenterLabel(text) {
    const el = document.getElementById('tetrad-center-label');
    el.style.fontSize = '';
    el.textContent = text ? text.toUpperCase() : 'MEDIUM';

    let fontSize = CENTER_LABEL_FONT_SIZE;
    while (el.getComputedTextLength() > CENTER_LABEL_MAX_WIDTH && fontSize > 9) {
        fontSize -= 1;
        el.style.fontSize = `${fontSize}px`;
    }

    if (fontSize === CENTER_LABEL_FONT_SIZE) {
        el.style.fontSize = '';
    }

    return el.getComputedTextLength() <= CENTER_LABEL_MAX_WIDTH;
}

const quadrantConfigs = {
    'enhance': { side: 'left', topBoundary: -200, bottomBoundary: 0 },
    'reverse': { side: 'right', topBoundary: -200, bottomBoundary: 0 },
    'retrieve': { side: 'left', topBoundary: 0, bottomBoundary: 200 },
    'obsolesce': { side: 'right', topBoundary: 0, bottomBoundary: 200 },
};

const scrollOffsets = { enhance: 0, reverse: 0, retrieve: 0, obsolesce: 0 };
const svg = document.querySelector('.tetrad-tool__diagram svg');
const textGroups = {};

let lastValidMedium = '';

function createSVGElement(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
}

Object.keys(quadrantConfigs).forEach(id => {
    const g = createSVGElement("g");
    svg.appendChild(g);
    textGroups[id] = g;
});

function getTargetQuadrant(e, svgElement) {
    const rect = svgElement.getBoundingClientRect();
    const isLeft = e.clientX < rect.left + rect.width / 2;
    const isTop = e.clientY < rect.top + rect.height / 2;

    if (isLeft && isTop) return 'enhance';
    if (!isLeft && isTop) return 'reverse';
    if (isLeft && !isTop) return 'retrieve';
    return 'obsolesce';
}

function getTotalLines(preparedText) {
    let totalLines = 0;
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };

    while (cursor) {
        const range = layoutNextLineRange(preparedText, cursor, MAX_WIDTH);
        if (!range) break;
        cursor = range.end;
        totalLines++;
    }

    return totalLines;
}

function outerEdgeTextX(currentY, config) {
    const { side, topBoundary, bottomBoundary } = config;
    const centerY = (topBoundary + bottomBoundary) / 2;
    const boundedY = Math.max(topBoundary, Math.min(bottomBoundary, currentY));
    const halfWidthAtY = 100 - Math.abs(boundedY - centerY);
    const direction = side === 'left' ? -1 : 1;

    return (direction * 100) + (direction * halfWidthAtY) + (direction * OUTER_EDGE_GAP);
}

function clampAndApplyScroll(id, preparedText, deltaY = 0) {
    if (!preparedText) {
        scrollOffsets[id] = 0;
        return 0;
    }
    const { topBoundary, bottomBoundary } = quadrantConfigs[id];
    const quadrantHeight = bottomBoundary - topBoundary;
    const totalLines = getTotalLines(preparedText);
    const maxScroll = Math.max(0, totalLines * LINE_HEIGHT - quadrantHeight + TOP_MARGIN + BOTTOM_MARGIN);

    scrollOffsets[id] = Math.min(Math.max(0, scrollOffsets[id] + deltaY), maxScroll);
    return maxScroll;
}

function renderQuadrant(id, preparedText) {
    const group = textGroups[id];
    group.innerHTML = '';
    if (!preparedText) return;

    const config = quadrantConfigs[id];
    const { side, topBoundary, bottomBoundary } = config;
    const visibleTop = topBoundary + TOP_MARGIN;
    const visibleBottom = bottomBoundary - BOTTOM_MARGIN;

    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let currentY = visibleTop - scrollOffsets[id];

    while (cursor) {
        const range = layoutNextLineRange(preparedText, cursor, MAX_WIDTH);
        if (!range) break;

        if (currentY >= visibleTop && currentY <= visibleBottom) {
            const line = materializeLineRange(preparedText, range);
            const textNode = createSVGElement("text", {
                x: outerEdgeTextX(currentY, config),
                y: currentY,
                "text-anchor": side === 'left' ? 'end' : 'start',
                "dominant-baseline": "middle",
            });
            textNode.style.cssText = TEXT_STYLE;
            textNode.textContent = line.text;
            group.appendChild(textNode);
        }

        cursor = range.end;
        currentY += LINE_HEIGHT;
        if (currentY > bottomBoundary + LINE_HEIGHT) break;
    }
}

function updateView(id, deltaY = 0) {
    const textContent = document.getElementById(`tetrad-${id}`).value.trim();
    const preparedText = textContent ? prepareWithSegments(textContent, FONT) : null;
    const maxScroll = clampAndApplyScroll(id, preparedText, deltaY);
    renderQuadrant(id, preparedText);
    return maxScroll;
}

const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) { } },
    remove(key) { try { localStorage.removeItem(key); } catch (_) { } },
};

function saveToStorage() {
    const state = { medium: document.getElementById('tetrad-medium').value };
    Object.keys(quadrantConfigs).forEach(id => { state[id] = document.getElementById(`tetrad-${id}`).value; });
    storage.set(STORAGE_KEY, JSON.stringify(state));
}

function loadFromStorage() {
    const raw = storage.get(STORAGE_KEY);
    if (!raw) return;
    try {
        const state = JSON.parse(raw);
        const mediumEl = document.getElementById('tetrad-medium');
        mediumEl.value = state.medium || '';
        lastValidMedium = mediumEl.value;
        updateCenterLabel(state.medium?.trim());
        Object.keys(quadrantConfigs).forEach(id => {
            if (state[id] != null) document.getElementById(`tetrad-${id}`).value = state[id];
        });
    } catch (_) { }
}

svg.addEventListener('wheel', (e) => {
    const targetId = getTargetQuadrant(e, svg);
    const maxScroll = updateView(targetId, e.deltaY * 0.5);
    if (maxScroll > 0) e.preventDefault();
}, { passive: false });

let activeTouchTarget = null;
let lastTouchY = 0;

svg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        activeTouchTarget = getTargetQuadrant(touch, svg);
        lastTouchY = touch.clientY;
    }
}, { passive: false });

svg.addEventListener('touchmove', (e) => {
    if (!activeTouchTarget || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const maxScroll = updateView(activeTouchTarget, lastTouchY - touch.clientY);
    lastTouchY = touch.clientY;
    if (maxScroll > 0) e.preventDefault();
}, { passive: false });

const resetTouch = () => { activeTouchTarget = null; };
svg.addEventListener('touchend', resetTouch);
svg.addEventListener('touchcancel', resetTouch);

document.getElementById('tetrad-medium').addEventListener('input', (e) => {
    const el = e.target;
    if (updateCenterLabel(el.value.trim())) {
        lastValidMedium = el.value;
    } else {
        const caret = el.selectionStart;
        const inserted = Math.max(0, el.value.length - lastValidMedium.length);
        el.value = lastValidMedium;
        const pos = Math.max(0, caret - inserted);
        el.setSelectionRange(pos, pos);
        updateCenterLabel(el.value.trim());
    }
    saveToStorage();
});

document.getElementById('btn-print').addEventListener('click', () => window.print());

document.getElementById('btn-clear').addEventListener('click', () => {
    if (!confirm('Clear all fields? This cannot be undone.')) return;
    document.getElementById('tetrad-medium').value = '';
    lastValidMedium = '';
    updateCenterLabel('');
    Object.keys(quadrantConfigs).forEach(id => {
        document.getElementById(`tetrad-${id}`).value = '';
        updateView(id);
    });
    storage.remove(STORAGE_KEY);
});

Object.keys(quadrantConfigs).forEach(id => {
    document.getElementById(`tetrad-${id}`).addEventListener('input', () => {
        updateView(id);
        saveToStorage();
    });

    const quadrant = document.getElementById(`quadrant-${id}`);
    quadrant.style.cursor = 'pointer';
    quadrant.addEventListener('click', () => {
        document.getElementById(`tetrad-${id}`).focus();
    });
});

document.getElementById('quadrant-center').addEventListener('click', () => {
    document.getElementById('tetrad-medium').focus();
});

loadFromStorage();
Object.keys(quadrantConfigs).forEach(id => updateView(id));
