import React from 'react';
import { UI_COLORS } from "../../data/presets";

/**
 * Generic Info Tooltip Component
 * Can be reused anywhere in the app to provide context hints.
 */
const InfoTooltip = ({ text }) => (
    <span
        className="ms-1"
        style={{ cursor: 'help', fontSize: '0.9em', color: UI_COLORS.actionButton }}
        title={text}
    >
        ⓘ
    </span>
);

export default InfoTooltip;