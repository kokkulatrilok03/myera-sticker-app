import React from 'react';

const StickerButton = ({ src, onAddSticker }) => {
    return (
        <img
            src={src}
            alt="Sticker button"
            className="sticker-button"
            onClick={() => onAddSticker(src)}
            title="Add sticker"
        />
    );
};

export default StickerButton;