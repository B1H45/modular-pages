import { useEffect, useState, useRef } from "react";
import { Stage, Layer, Line } from "react-konva";

function ModuleNode({ obj } = props) {
    let [splitting, setSplitting] = useState(false);
    const [mousePosition, setMousePosition] = useState({
        x: null,
        y: null,
    });
    const [splitterPosition, setSplitterPosition] = useState({
        x: null,
        y: null,
    });
    const [splitTarget, setSplitTarget] = useState(null);
    let thisNode = useRef(null);

    const { parent, level, partition, content, children, isVertical } = obj;
    // const willSplitVertically = level % 2 != 0; // Will split vertically if odd level
    const willSplitVertically = false;
    const willSplitItself = parent
        ? willSplitVertically !== parent.isVertical
        : true;
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
        if (willSplitItself) {
            setSplitterPosition({
                x: 0,
                y: clamp(
                    ev.clientY - thisNode.current.getBoundingClientRect().top,
                    min,
                    thisNode.current.getBoundingClientRect().height - min,
                ),
            });
        } else {
            setSplitterPosition({
                x: clamp(
                    ev.clientX - thisNode.current.getBoundingClientRect().left,
                    min,
                    thisNode.current.getBoundingClientRect().width - min,
                ),
                y: 0,
            });
        }
    };

    let thisClass = `module ${obj.isLast() ? "end" : ""} ${
        splitting ? "active" : ""
    }`;
    let thisStyle = {
        "--level": level,
        "--partition": partition,
        flexDirection: "row",
    };

    let beginSplit = (e) => {
        if (willSplitItself) {
        }

        // const enoughSpace = willSplitVertically ? thisNode.current.getBoundingClientRect().height > 2*min : thisNode.current.getBoundingClientRect().width > 2*min
        // setSplitTarget();
        // console.log(e.target);
        e.preventDefault();
        e.stopPropagation();

        if (!splitting) {
            // if (!splitting && enoughSpace) {
            _updateAnimVars(e);
            setSplitting(true);
        }
    };

    let endSplit = () => {
        if (splitting) {
            // console.log(splitterPosition);
            setSplitting(false);
            const newPartition = Math.round(
                // false
                //     ? (splitterPosition.y * 100) /
                //           thisNode.current.getBoundingClientRect().height
                (splitterPosition.x * partition) /
                    thisNode.current.getBoundingClientRect().width,
            );
            if (willSplitItself) {
                obj.splitIt("a child", newPartition, 0);
            } else {
                obj.parent.splitIt("a child", newPartition, obj.getIndex() + 1);
            }
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
                {children.length > 0 ? (
                    <>
                        {children.map((child) => {
                            return (
                                <ModuleNode
                                    key={child.content + child.partition}
                                    obj={child}
                                ></ModuleNode>
                            );
                        })}
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
                                willSplitItself
                                    ? (thisNode.current?.getBoundingClientRect()
                                          .width ?? 0)
                                    : 0,
                                !willSplitItself
                                    ? (thisNode.current?.getBoundingClientRect()
                                          .height ?? 0)
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

export default ModuleNode;
