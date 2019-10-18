import React from 'react';
import './index.css';

function Section ({ row, col, data, onRevealSections, onFlag }) {
    const { status, content } = data;

    function handleLeftClick (e) {
        e.preventDefault();
        if (status !== 'f') {
            onRevealSections(row, col);
        }
    }

    function handleRightClick (e) {
        e.preventDefault();
        if (status !== 'r') {
            onFlag(row, col);
        }
    }

    let displayContent;
    let revealedClass = '';
    switch(status) {
        case 'r': {
            revealedClass = ' revealed';
            if (content === -1) {
                displayContent = <span rel="img" aria-label="bomb">💣</span>;
            } else if (content === 0) {
                displayContent = null;
            } else {
                displayContent = content;
            }
            break;
        }
        case 'f': {
            displayContent = <span rel="img" aria-label="red flag">🚩</span>
            break;
        }
        case 'e': {
            revealedClass = ' revealed';
            displayContent = <span rel="img" aria-label="explosion">💥</span>;
            break;
        }
        default: {
            displayContent = '';
            break;
        }
    }

    return (
        <div className={`section${revealedClass}`} onClick={handleLeftClick} onContextMenu={handleRightClick}>
            { displayContent }
        </div>
    )
}

export default Section;
