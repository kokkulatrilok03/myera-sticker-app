import React, { useRef, useState } from 'react';
import Konva from 'konva';

import { Stage, Layer, Image, Transformer } from 'react-konva';
import useImage from 'use-image';

const Canvas = ({ stickers, handleAction, snapToGrid }) => {
    const stageRef = useRef(null);
    const [selectedId, setSelectedId] = useState(null);

    const handleDragEnd = (e, index) => {
        const node = e.target;
        const newX = snapToGrid ? Math.round(node.x() / 40) * 40 : node.x();
        const newY = snapToGrid ? Math.round(node.y() / 40) * 40 : node.y();
        node.to({
            x: newX,
            y: newY,
            duration: 0.1,
            easing: Konva.Easings.EaseInOut,
        });

        const newStickers = stickers.slice();
        newStickers[index] = {
            ...newStickers[index],
            x: newX,
            y: newY,
        };
        handleAction(newStickers);
    };

    const handleDelete = (index) => {
        const newStickers = stickers.filter((_, i) => i !== index);
        handleAction(newStickers);
    };

    const exportToPNG = () => {
        setTimeout(() => {
            try {
                const uri = stageRef.current.toDataURL({ pixelRatio: 3 });
                const link = document.createElement('a');
                link.download = 'canvas.png';
                link.href = uri;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (error) {
                alert('Export failed. Ensure all images are loaded.');
                console.error(error);
            }
        }, 100);
    };

    return (
        <>
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
                        />
                    ))}
                </Layer>
            </Stage>
        </>
    );
};

const ImageWithTransformer = ({ sticker, index, isSelected, onSelect, onChange, handleDelete }) => {
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
                onDragEnd={(e) =>
                    onChange({
                        ...sticker,
                        x: e.target.x(),
                        y: e.target.y(),
                    })
                }
                onClick={onSelect}
                onTap={onSelect}
                onDblClick={() => handleDelete(index)}
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
