import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

function ModuleNode2({ obj } = props) {
    let [splitting, setSplitting] = useState(false);
    const [mousePosition, setMousePosition] = useState({
        x: null,
        y: null,
    });
    const [splitterPosition, setSplitterPosition] = useState({
        x: null,
        y: null,
    });
    let thisNode = useRef(null);

    const { parent, level, progress, from, to, content } = obj;
    const willSplitVertically = level % 2 != 0; // Will split vertically if odd level
    const min = 60;

    useEffect(() => {
        if (splitting) {
            window.addEventListener("mousemove", _updateAnimVars);
            window.addEventListener("click", endSplit);
            window.addEventListener("contextmenu", endSplit);
        }

        return () => {
            window.removeEventListener("mousemove", _updateAnimVars);
            window.removeEventListener("click", endSplit);
            window.addEventListener("contextmenu", endSplit);
        };
    });

    const clamp = (val, min, max) => Math.min(Math.max(min, val), max);
    const _updateAnimVars = (ev) => {
        setMousePosition({ x: ev.clientX, y: ev.clientY });
        if (willSplitVertically) {
            setSplitterPosition({
                x: 0,
                y: clamp(ev.clientY - thisNode.current.getBoundingClientRect().top, min, thisNode.current.getBoundingClientRect().height - min),
            });
        } else {
            setSplitterPosition({
                x: clamp(ev.clientX - thisNode.current.getBoundingClientRect().left, min, thisNode.current.getBoundingClientRect().width - min),
                y: 0,
            });
        }
    };

    let thisClass = `module ${obj.getSide() == "to" ? "to" : "from"} ${
        splitting ? "active" : ""
    }`;
    let thisStyle = {
        "--level": level,
        "--parentProgress": parent?.progress,
        flexDirection: (level + 1) % 2 == 0 ? "column" : "row",
    };

    let beginSplit = (e) => {
        const enoughSpace = willSplitVertically ? thisNode.current.getBoundingClientRect().height > 2*min : thisNode.current.getBoundingClientRect().width > 2*min
        e.preventDefault();
        e.stopPropagation();

        if (!splitting && enoughSpace) {
            _updateAnimVars(e);
            setSplitting(true);
        }
    };

    let endSplit = () => {
        if (splitting) {
            console.log(splitterPosition);
            setSplitting(false);
            obj.createChild(
                "from",
                `${level} : from`,
                Math.round(
                    willSplitVertically
                        ? (splitterPosition.y * 100) /
                              thisNode.current.getBoundingClientRect().height
                        : (splitterPosition.x * 100) /
                              thisNode.current.getBoundingClientRect().width
                )
            );
            obj.createChild("to", `${level} : to`);
        }
    };

    return (
        <>
            <div
                onContextMenu={(e) => {
                    beginSplit(e);
                }}
                ref={thisNode}
                className={thisClass}
                style={thisStyle}
            >
                {from || to ? (
                    <>
                        <ModuleNode2 obj={from}></ModuleNode2>
                        <ModuleNode2 obj={to}></ModuleNode2>
                    </>
                ) : (
                    <div>{content}</div>
                )}
                <Stage
                    className={`splitter${!splitting ? " hide" : ""}`}
                    width={window.innerWidth}
                    height={window.innerHeight}
                >
                    <Layer>
                        <Line
                            x={splitterPosition.x}
                            y={splitterPosition.y}
                            points={[
                                0,
                                0,
                                willSplitVertically
                                    ? thisNode.current?.getBoundingClientRect()
                                          .width ?? 0
                                    : 0,
                                !willSplitVertically
                                    ? thisNode.current?.getBoundingClientRect()
                                          .height ?? 0
                                    : 0,
                            ]}
                            stroke="red"
                        ></Line>
                    </Layer>
                </Stage>
            </div>
        </>
    );
}

export default ModuleNode2;
