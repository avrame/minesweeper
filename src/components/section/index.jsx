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
                displayContent = <img src="/img/bomb.png" alt="bomb" width="28" height="28" />;
            } else if (content === 0) {
                displayContent = '';
            } else {
                displayContent = content;
            }
            break;
        }
        case 'f': {
            displayContent = <img src="/img/red-flag.svg" alt="red flag" width="28" height="28" />
            break;
        }
        case 'e': {
            revealedClass = ' revealed';
            displayContent = <img src="/img/explosion.png" alt="exploded bomb" width="28" height="28" />;
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
