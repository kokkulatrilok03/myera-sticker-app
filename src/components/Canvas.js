import React, { useRef, useState } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import useImage from 'use-image';

const Canvas = ({ stickers, handleAction, snapToGrid }) => {
    const stageRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const handleDelete = (index) => {
        const newStickers = stickers.filter((_, i) => i !== index);
        handleAction(newStickers);
    };

    return (
        <Stage
            width={600}
            height={400}
            ref={stageRef}
            style={{ border: '2px dashed #888', backgroundColor: '#fefefe' }}
            onMouseDown={(e) => {
                if (e.target === e.target.getStage()) {
                    setSelectedId(null);
                }
            }}
        >
            <Layer>
                {stickers.map((sticker, i) => (
                    <ImageWithTransformer
                        key={i}
                        sticker={sticker}
                        index={i}
                        isSelected={i === selectedId}
                        onSelect={() => setSelectedId(i)}
                        onChange={(attrs) => {
                            const newStickers = [...stickers];
                            newStickers[i] = attrs;
                            handleAction(newStickers);
                        }}
                        handleDelete={handleDelete}
                        snapToGrid={snapToGrid}
                    />
                ))}
            </Layer>
        </Stage>
    );
};

const ImageWithTransformer = ({ sticker, index, isSelected, onSelect, onChange, handleDelete, snapToGrid }) => {
    const shapeRef = useRef();
    const transformerRef = useRef();
    const [image] = useImage(sticker.src, 'anonymous');

    return (
        <>
            <Image
                ref={shapeRef}
                image={image}
                x={sticker.x}
                y={sticker.y}
                draggable
                rotation={sticker.rotation}
                scaleX={sticker.scaleX}
                scaleY={sticker.scaleY}
                onClick={onSelect}
                onTap={onSelect}
                onDblClick={() => handleDelete(index)}
                onDragEnd={(e) => {
                    const node = e.target;
                    const newX = snapToGrid ? Math.round(node.x() / 40) * 40 : node.x();
                    const newY = snapToGrid ? Math.round(node.y() / 40) * 40 : node.y();
                    node.to({ x: newX, y: newY, duration: 0.1 });
                    onChange({ ...sticker, x: newX, y: newY });
                }}
                onTransformEnd={() => {
                    const node = shapeRef.current;
                    onChange({
                        ...sticker,
                        x: node.x(),
                        y: node.y(),
                        rotation: node.rotation(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={transformerRef}
                    node={shapeRef.current}
                    boundBoxFunc={(oldBox, newBox) => newBox}
                />
            )}
        </>
    );
};

export default Canvas;
