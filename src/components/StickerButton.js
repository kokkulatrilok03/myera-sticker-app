import React from 'react';

const StickerButton = ({ src, onAddSticker }) => (
    <button
        onClick={() => onAddSticker(src)}
        title="Add sticker"
        style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
        }}
    >
        <img
            src={src}
            alt="Sticker"
            className="sticker-button"
            style={{ width: 48, height: 48 }}
        />
    </button>
);

export default StickerButton;
